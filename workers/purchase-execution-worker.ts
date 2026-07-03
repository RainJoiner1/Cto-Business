/**
 * purchase-execution Worker
 *
 * Consumes jobs from the `purchase-execution` BullMQ queue.
 * Executes the actual RI purchase recommendations via cloud provider APIs.
 *
 * Run standalone: npx tsx workers/purchase-execution-worker.ts
 */
import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { getRedisClient } from '../app/lib/redis.js';
import type { PurchaseExecutionJobData } from '../app/lib/queue.js';

const prisma = new PrismaClient();

const worker = new Worker<PurchaseExecutionJobData>(
  'purchase-execution',
  async (job) => {
    const { orgId, executionPlanId, recommendations } = job.data;
    console.log(`[purchase-exec] Processing job ${job.id} for org=${orgId} plan=${executionPlanId}`);

    // Update plan status to PROCESSING
    await prisma.executionPlan.update({
      where: { id: executionPlanId },
      data: { status: 'PROCESSING' },
    });

    const results: Array<{ recommendationId: string; status: string; vendorResponse?: string }> = [];

    for (const rec of recommendations) {
      try {
        // In production, this would call the cloud provider's RI purchase API.
        // We simulate a successful purchase here.
        console.log(
          `[purchase-exec] Purchasing ${rec.quantity}x ${rec.instanceFamily} in ${rec.region} (${rec.term}) for plan ${executionPlanId}`
        );

        // Update recommendation status
        await prisma.recommendation.update({
          where: { id: rec.recommendationId },
          data: { status: 'COMPLETED' },
        });

        results.push({
          recommendationId: rec.recommendationId,
          status: 'COMPLETED',
          vendorResponse: 'mock-purchase-success',
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[purchase-exec] Failed purchase for ${rec.recommendationId}:`, msg);

        await prisma.recommendation.update({
          where: { id: rec.recommendationId },
          data: { status: 'FAILED' },
        });

        results.push({
          recommendationId: rec.recommendationId,
          status: 'FAILED',
          vendorResponse: msg,
        });
      }
    }

    // Final plan status
    const allSucceeded = results.every((r) => r.status === 'COMPLETED');
    await prisma.executionPlan.update({
      where: { id: executionPlanId },
      data: { status: allSucceeded ? 'COMPLETED' : 'FAILED' },
    });

    return { orgId, executionPlanId, results };
  },
  {
    connection: getRedisClient() ?? undefined,
    prefix: 'reserveiq',
    concurrency: 2, // purchase is more expensive — lower concurrency
  }
);

worker.on('completed', (job) => {
  console.log(`[purchase-exec] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[purchase-exec] Job ${job?.id} failed:`, err.message);
});

console.log('[purchase-execution] Worker started. Waiting for jobs...');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[purchase-execution] Shutting down...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[purchase-execution] Shutting down...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});