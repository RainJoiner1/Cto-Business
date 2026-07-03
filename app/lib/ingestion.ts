import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';
import { enqueueUsageSync } from './queue.js';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// CSV Record shape (expected columns)
// ---------------------------------------------------------------------------
interface CsvUsageRow {
  accountId?: string;
  timestamp: string;
  instanceFamily: string;
  region: string;
  normalizedUnits: string | number;
  onDemandCost: string | number;
}

// ---------------------------------------------------------------------------
// Normalize a row to the shape expected by the queue
// ---------------------------------------------------------------------------
function normalizeRow(raw: CsvUsageRow) {
  return {
    timestamp: raw.timestamp,
    instanceFamily: raw.instanceFamily,
    region: raw.region,
    normalizedUnits: Math.round(Number(raw.normalizedUnits) || 0),
    onDemandCost: Number(raw.onDemandCost) || 0,
  };
}

// ---------------------------------------------------------------------------
// Parse CSV text into row objects
// ---------------------------------------------------------------------------
export function parseCsvUsage(csvText: string): CsvUsageRow[] {
  return parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as CsvUsageRow[];
}

// ---------------------------------------------------------------------------
// Bulk insert usage metrics directly (for historical backfill)
// Returns count of inserted rows
// ---------------------------------------------------------------------------
export async function bulkInsertUsage(
  accountId: string,
  rows: Array<{
    timestamp: string;
    instanceFamily: string;
    region: string;
    normalizedUnits: number;
    onDemandCost: number;
  }>
): Promise<number> {
  // Verify account exists
  const account = await prisma.cloudAccount.findUnique({
    where: { id: accountId },
  });
  if (!account) {
    throw new Error(`CloudAccount not found: ${accountId}`);
  }

  const data = rows.map((r) => ({
    accountId,
    timestamp: new Date(r.timestamp),
    instanceFamily: r.instanceFamily,
    region: r.region,
    normalizedUnits: r.normalizedUnits,
    onDemandCost: r.onDemandCost,
  }));

  // Batch in chunks of 500 to avoid query size limits
  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < data.length; i += CHUNK) {
    const chunk = data.slice(i, i + CHUNK);
    const result = await prisma.usageMetric.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    inserted += result.count;
  }

  // Update lastSync
  await prisma.cloudAccount.update({
    where: { id: accountId },
    data: { lastSync: new Date() },
  });

  return inserted;
}

// ---------------------------------------------------------------------------
// Process an incoming CSV: parse → queue for async sync (incremental path)
// ---------------------------------------------------------------------------
export async function processCsvAndEnqueue(
  orgId: string,
  accountId: string,
  csvText: string
): Promise<{ queued: boolean; rowCount: number }> {
  const raw = parseCsvUsage(csvText);
  const rows = raw.map(normalizeRow);

  await enqueueUsageSync({
    orgId,
    accountId,
    rows,
  });

  return { queued: true, rowCount: rows.length };
}

// ---------------------------------------------------------------------------
// Process webhook payload from AWS S3 CUR event
// ---------------------------------------------------------------------------
export interface AwsCurWebhookPayload {
  Records?: Array<{
    s3?: {
      bucket?: { name?: string };
      object?: { key?: string };
    };
  }>;
}

export async function handleAwsCurWebhook(payload: unknown, orgId: string, accountId: string): Promise<{ queued: boolean; message: string }> {
  const curEvent = payload as AwsCurWebhookPayload;
  const record = curEvent?.Records?.[0];
  const bucket = record?.s3?.bucket?.name ?? 'unknown-bucket';
 const key = record?.s3?.object?.key ?? 'unknown-key';

  // In production, we'd download & parse the CUR CSV from S3 here.
  // For now we enqueue a placeholder job that signals "new CUR available".
  await enqueueUsageSync({
    orgId,
    accountId,
    rows: [], // The actual worker will fetch from S3
  });

  return {
    queued: true,
    message: `CUR event from s3://${bucket}/${key} enqueued for account ${accountId}`,
  };
}