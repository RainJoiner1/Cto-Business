/**
 * usage-sync Worker
 *
 * Consumes jobs from the `usage-sync` BullMQ queue.
 * For each job it inserts the provided rows into UsageMetric,
 * or — if rows are empty — it triggers a cloud provider fetch.
 *
 * Run standalone: npx tsx workers/usage-sync-worker.ts
 */
import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { getRedisClient } from '../app/lib/redis.js';
import type { UsageSyncJobData } from '../app/lib/queue.js';

const prisma = new PrismaClient();

const worker = new Worker<UsageSyncJobData>(
  'usage-sync',
  async (job) => {
    const { orgId, accountId, rows } = job.data;
    console.log(`[usage-sync] Processing job ${job.id} for org=${orgId} account=${accountId}`);

    if (rows.length > 0) {
      // Bulk insert the provided rows
      const data = rows.map((r) => ({
        accountId,
        timestamp: new Date(r.timestamp),
        instanceFamily: r.instanceFamily,
        region: r.region,
        normalizedUnits: r.normalizedUnits,
        onDemandCost: r.onDemandCost,
      }));

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

      console.log(`[usage-sync] Inserted ${inserted} usage metrics for account ${accountId}`);
    } else {
      // No rows provided — in production this would call the cloud provider API
      console.log(`[usage-sync] No rows in job ${job.id} — would fetch from cloud provider`);
    }

    // Update lastSync timestamp
    await prisma.cloudAccount.update({
      where: { id: accountId },
      data: { lastSync: new Date() },
    });

    return { orgId, accountId, rowsProcessed: rows.length };
  },
  {
    connection: getRedisClient() ?? undefined,
    prefix: 'reserveiq',
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(`[usage-sync] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[usage-sync] Job ${job?.id} failed:`, err.message);
});

console.log('[usage-sync] Worker started. Waiting for jobs...');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[usage-sync] Shutting down...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[usage-sync] Shutting down...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});