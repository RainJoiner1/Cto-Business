import { NextRequest, NextResponse } from 'next/server';
import { handleAwsCurWebhook } from '../../../lib/ingestion.js';
import { generateIdempotencyKey, tryClaimIdempotency, completeIdempotency } from '../../../lib/idempotency.js';

/**
 * POST /api/webhooks/aws-cur
 *
 * Receives S3 event notifications from AWS Cost & Usage Reports.
 * Pushes a job to the `usage-sync` BullMQ queue for async processing.
 *
 * Query params:
 *   - orgId      (required)
 *   - accountId  (required)
 *
 * The raw body is used to compute an idempotency key (SHA-256).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const orgId = request.nextUrl.searchParams.get('orgId');
    const accountId = request.nextUrl.searchParams.get('accountId');

    if (!orgId) {
      return NextResponse.json({ error: 'Missing query parameter: orgId' }, { status: 400 });
    }
    if (!accountId) {
      return NextResponse.json({ error: 'Missing query parameter: accountId' }, { status: 400 });
    }

    // Read the raw body
    const rawBody = await request.text();
    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Idempotency check via SHA-256 hash of the body
    const idempotencyKey = generateIdempotencyKey(rawBody);
    const { isNew, retryAllowed } = await tryClaimIdempotency(idempotencyKey, 'webhook-' + accountId);

    if (!isNew && !retryAllowed) {
      return NextResponse.json({
        error: 'Duplicate webhook — already processed',
        idempotencyKey,
      }, { status: 409 });
    }

    // Process the webhook payload
    const result = await handleAwsCurWebhook(payload, orgId, accountId);

    await completeIdempotency(idempotencyKey, 'SUCCESS', {
      orgId,
      accountId,
      queued: result.queued,
    });

    return NextResponse.json({
      success: true,
      ...result,
      idempotencyKey,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[webhooks/aws-cur]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/webhooks/aws-cur — health / info
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    endpoint: '/api/webhooks/aws-cur',
    method: 'POST',
    description: 'Receive AWS S3 event notifications for Cost & Usage Reports',
    queryParams: ['orgId', 'accountId'],
  });
}