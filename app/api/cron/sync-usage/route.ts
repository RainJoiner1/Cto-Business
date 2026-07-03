import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { enqueueUsageSync } from '../../../lib/queue.js';

const prisma = new PrismaClient();

/**
 * GET /api/cron/sync-usage
 *
 * Scheduled cron trigger for Azure / GCP usage sync.
 * Finds all CloudAccounts with providers AZURE or GCP and enqueues a
 * usage-sync job for each.
 *
 * Protect this endpoint with a CRON_SECRET query parameter in production.
 *
 * Query params:
 *   - token  (required, must match CRON_SECRET env var)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Simple bearer-token guard
    const token = request.nextUrl.searchParams.get('token');
    const expectedToken = process.env.CRON_SECRET;
    if (expectedToken && token !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all Azure & GCP cloud accounts
    const accounts = await prisma.cloudAccount.findMany({
      where: {
        provider: { in: ['AZURE', 'GCP'] },
      },
      include: {
        organization: true,
      },
    });

    if (accounts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No Azure/GCP accounts found to sync',
        accountsProcessed: 0,
      });
    }

    // Enqueue a usage-sync job per account
    const results: Array<{ accountId: string; provider: string; queued: boolean }> = [];

    for (const account of accounts) {
      try {
        await enqueueUsageSync({
          orgId: account.orgId,
          accountId: account.id,
          rows: [], // Worker will fetch from the cloud provider's API
        });
        results.push({
          accountId: account.id,
          provider: account.provider,
          queued: true,
        });
      } catch (err) {
        console.error(`[cron/sync-usage] Failed to enqueue for account ${account.id}:`, err);
        results.push({
          accountId: account.id,
          provider: account.provider,
          queued: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      accountsProcessed: accounts.length,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[cron/sync-usage]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}