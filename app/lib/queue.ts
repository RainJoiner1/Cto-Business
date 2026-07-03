import { Queue, Worker, type Job } from 'bullmq';
import { getRedisClient } from './redis.js';

const QUEUE_PREFIX = 'reserveiq';

let _usageSyncQueue: Queue | null = null;
let _purchaseExecutionQueue: Queue | null = null;

function createConnection(): ReturnType<typeof getRedisClient> | undefined {
  return getRedisClient() ?? undefined;
}

function getUsageSyncQueue(): Queue {
  if (!_usageSyncQueue) {
    _usageSyncQueue = new Queue('usage-sync', {
      connection: createConnection(),
      prefix: QUEUE_PREFIX,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
  }
  return _usageSyncQueue;
}

function getPurchaseExecutionQueue(): Queue {
  if (!_purchaseExecutionQueue) {
    _purchaseExecutionQueue = new Queue('purchase-execution', {
      connection: createConnection(),
      prefix: QUEUE_PREFIX,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    });
  }
  return _purchaseExecutionQueue;
}

// ---------------------------------------------------------------------------
// Job data types
// ---------------------------------------------------------------------------

export interface UsageSyncJobData {
  orgId: string;
  accountId: string;
  rows: Array<{
    timestamp: string;
    instanceFamily: string;
    region: string;
    normalizedUnits: number;
    onDemandCost: number;
  }>;
}

export interface PurchaseExecutionJobData {
  executionPlanId: string;
  orgId: string;
  recommendations: Array<{
    recommendationId: string;
    instanceFamily: string;
    region: string;
    quantity: number;
    term: 'ONE_YEAR' | 'THREE_YEAR';
  }>;
}

// ---------------------------------------------------------------------------
// Helper: enqueue usage sync job (FIFO group by orgId)
// ---------------------------------------------------------------------------

export async function enqueueUsageSync(data: UsageSyncJobData): Promise<Job<UsageSyncJobData> | null> {
  try {
    const q = getUsageSyncQueue();
    return await q.add(
      `usage-sync:${data.orgId}:${Date.now()}`,
      data,
      {
        groupId: data.orgId,
        jobId: `${data.orgId}:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`,
      }
    );
  } catch (err) {
    console.warn('[queue] Failed to enqueue usage-sync job (Redis unavailable?):', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper: enqueue purchase execution job (FIFO group by orgId)
// ---------------------------------------------------------------------------

export async function enqueuePurchaseExecution(data: PurchaseExecutionJobData): Promise<Job<PurchaseExecutionJobData> | null> {
  try {
    const q = getPurchaseExecutionQueue();
    return await q.add(
      `purchase-exec:${data.orgId}:${Date.now()}`,
      data,
      {
        groupId: data.orgId,
        jobId: `purchase:${data.orgId}:${Date.now()}`,
      }
    );
  } catch (err) {
    console.warn('[queue] Failed to enqueue purchase-execution job (Redis unavailable?):', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Graceful shutdown helper
// ---------------------------------------------------------------------------

export async function closeQueues(): Promise<void> {
  if (_usageSyncQueue) await _usageSyncQueue.close();
  if (_purchaseExecutionQueue) await _purchaseExecutionQueue.close();
  const r = getRedisClient();
  if (r) await r.quit();
}

export { Worker };
export type { Job };