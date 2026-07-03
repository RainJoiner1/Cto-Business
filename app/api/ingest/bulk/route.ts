import { NextRequest, NextResponse } from 'next/server';
import { parseCsvUsage, bulkInsertUsage } from '../../../lib/ingestion.js';
import { generateIdempotencyKey, tryClaimIdempotency, completeIdempotency } from '../../../lib/idempotency.js';

/**
 * POST /api/ingest/bulk
 *
 * Historical bulk backfill: accepts a CSV file as multipart/form-data.
 * Columns: accountId (optional if passed as query), timestamp, instanceFamily, region, normalizedUnits, onDemandCost.
 *
 * Query params:
 *   - accountId  (optional if CSV has accountId column)
 *   - orgId      (used for idempotency key scoping)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse multipart form
    const formData = await request.formData();
    const file = formData.get('file');
    const queryAccountId = request.nextUrl.searchParams.get('accountId');
    const orgId = request.nextUrl.searchParams.get('orgId');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing CSV file (field name: "file")' }, { status: 400 });
    }
    if (!queryAccountId) {
      return NextResponse.json({ error: 'Missing query parameter: accountId' }, { status: 400 });
    }
    if (!orgId) {
      return NextResponse.json({ error: 'Missing query parameter: orgId' }, { status: 400 });
    }

    const csvText = await file.text();
    const rawRows = parseCsvUsage(csvText);

    // Merge CSV-level accountId with query-level accountId (CSV column wins)
    const accountId = rawRows[0]?.accountId ?? queryAccountId;

    // Generate idempotency key from the content hash
    const idempotencyKey = generateIdempotencyKey(csvText);
    const { isNew, retryAllowed } = await tryClaimIdempotency(idempotencyKey, 'bulk-' + accountId);

    if (!isNew && !retryAllowed) {
      return NextResponse.json({ error: 'Duplicate upload — already processed', idempotencyKey }, { status: 409 });
    }

    // Normalize rows
    const rows = rawRows.map((r) => ({
      timestamp: r.timestamp,
      instanceFamily: r.instanceFamily,
      region: r.region,
      normalizedUnits: Math.round(Number(r.normalizedUnits) || 0),
      onDemandCost: Number(r.onDemandCost) || 0,
    }));

    // Bulk insert
    const inserted = await bulkInsertUsage(accountId, rows);

    // Mark idempotency as completed
    await completeIdempotency(idempotencyKey, 'SUCCESS', {
      accountId,
      rowsInserted: inserted,
    });

    return NextResponse.json({
      success: true,
      accountId,
      rowsParsed: rows.length,
      rowsInserted: inserted,
      idempotencyKey,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ingest/bulk]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/ingest/bulk — health / info
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    endpoint: '/api/ingest/bulk',
    method: 'POST',
    description: 'Upload a CSV of historical usage data for bulk backfill',
    contentType: 'multipart/form-data with field "file"',
    queryParams: ['accountId', 'orgId'],
  });
}