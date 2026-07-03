/**
 * Quick smoke-test for the ingestion pipeline.
 * Tests CSV parsing and idempotency key generation.
 *
 * Run: npx tsx test-data/test-ingestion.ts
 */
import { readFileSync } from 'node:fs';
import { parseCsvUsage } from '../app/lib/ingestion.js';
import { generateIdempotencyKey } from '../app/lib/idempotency.js';

function main() {
  const csvText = readFileSync(new URL('sample-usage.csv', import.meta.url), 'utf-8');
  const rows = parseCsvUsage(csvText);

  console.log(`Parsed ${rows.length} rows from CSV`);
  console.log('First row:', JSON.stringify(rows[0], null, 2));
  console.log('Last row:', JSON.stringify(rows[rows.length - 1], null, 2));

  // Test idempotency key
  const key1 = generateIdempotencyKey(csvText);
  const key2 = generateIdempotencyKey(csvText);
  console.log(`Idempotency key: ${key1}`);
  console.log(`Deterministic: ${key1 === key2 ? 'YES' : 'NO'}`);

  // Normalize
  const normalized = rows.map((r) => ({
    timestamp: r.timestamp,
    instanceFamily: r.instanceFamily,
    region: r.region,
    normalizedUnits: Math.round(Number(r.normalizedUnits) || 0),
    onDemandCost: Number(r.onDemandCost) || 0,
  }));
  console.log(`Normalized rows: ${normalized.length}`);
  console.log('Sample normalized:', normalized[0]);

  console.log('\n✅ Ingestion pipeline smoke-test passed!');
}

main();