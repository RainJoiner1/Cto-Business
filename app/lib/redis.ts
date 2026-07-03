import { Redis } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let client: Redis | null = null;

/**
 * Returns a singleton ioredis client for BullMQ and caching.
 * Falls back gracefully if Redis is unavailable (returns null).
 */
export function getRedisClient(): Redis | null {
  if (!client) {
    try {
      client = new Redis(REDIS_URL, {
        maxRetriesPerRequest: null, // BullMQ requires this
        enableOfflineQueue: false,
        lazyConnect: true,
      });
    } catch {
      console.warn('[redis] Failed to create Redis client — running without cache/queue');
      return null;
    }
  }
  return client;
}

/**
 * Cached forecast values keyed by `orgId:family:region`.
 * TTL: 1 hour (3600s).
 */
export const forecastCache = {
  async get(key: string): Promise<number[] | null> {
    const r = getRedisClient();
    if (!r) return null;
    try {
      const raw = await r.get(`forecast:${key}`);
      return raw ? (JSON.parse(raw) as number[]) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, values: number[]): Promise<void> {
    const r = getRedisClient();
    if (!r) return;
    try {
      await r.setex(`forecast:${key}`, 3600, JSON.stringify(values));
    } catch { /* silent */ }
  },

  async invalidate(key: string): Promise<void> {
    const r = getRedisClient();
    if (!r) return;
    try {
      await r.del(`forecast:${key}`);
    } catch { /* silent */ }
  },
};

/**
 * Cached instance pricing keyed by `instanceFamily`.
 * TTL: 6 hours (21600s).
 */
export const instancePricingCache = {
  async get(key: string): Promise<{ onDemandHourly: number; reservationHourly: number; upfrontCost: number } | null> {
    const r = getRedisClient();
    if (!r) return null;
    try {
      const raw = await r.get(`pricing:${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async set(
    key: string,
    pricing: { onDemandHourly: number; reservationHourly: number; upfrontCost: number }
  ): Promise<void> {
    const r = getRedisClient();
    if (!r) return;
    try {
      await r.setex(`pricing:${key}`, 21600, JSON.stringify(pricing));
    } catch { /* silent */ }
  },

  async invalidate(key: string): Promise<void> {
    const r = getRedisClient();
    if (!r) return;
    try {
      await r.del(`pricing:${key}`);
    } catch { /* silent */ }
  },
};