import { createHash } from 'node:crypto';
import { PrismaClient, type SyncStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generates a deterministic idempotency key from the raw payload bytes.
 * Uses SHA-256 so identical payloads (same cloud data) produce the same key.
 */
export function generateIdempotencyKey(payload: string | Buffer): string {
  return createHash('sha256').update(payload).digest('hex');
}

/**
 * Attempts to claim an idempotency slot for a given key.
 *
 * Returns `true` if this key has NOT been processed yet (first call wins).
 * Returns `false` if it already exists (duplicate — caller should skip).
 *
 * If the previous attempt failed (retryCount < maxRetries) the caller may
 * choose to reprocess by returning `true` for a retry.
 */
export async function tryClaimIdempotency(
  idempotencyKey: string,
  executionPlanId: string
): Promise<{ isNew: boolean; retryAllowed: boolean; existingStatus: SyncStatus | null }> {
  const existing = await prisma.transactionLog.findUnique({
    where: { idempotencyKey },
  });

  if (!existing) {
    // First claim — insert a PENDING record
    await prisma.transactionLog.create({
      data: {
        idempotencyKey,
        executionPlanId,
        status: 'PENDING',
        vendorResponse: {},
        retryCount: 0,
      },
    });
    return { isNew: true, retryAllowed: true, existingStatus: null };
  }

  // Already exists
  const retryAllowed = existing.status === 'ERROR' && existing.retryCount < 3;
  return {
    isNew: false,
    retryAllowed,
    existingStatus: existing.status as SyncStatus,
  };
}

/**
 * Marks a TransactionLog as completed (SUCCESS or ERROR) and bumps retry count.
 */
export async function completeIdempotency(
  idempotencyKey: string,
  status: SyncStatus,
  vendorResponse: Record<string, unknown>
): Promise<void> {
  await prisma.transactionLog.update({
    where: { idempotencyKey },
    data: {
      status,
      vendorResponse: vendorResponse as Record<string, never>,
      retryCount: { increment: 1 },
    },
  });
}