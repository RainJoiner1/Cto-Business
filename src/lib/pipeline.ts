import { PrismaClient } from '@prisma/client';
import { normalizeUsage } from './algorithms/normalize.js';
import { holtWintersForecast } from './algorithms/forecast.js';
import { generateRecommendations } from './algorithms/binPacking.js';
import type { Deficit } from './algorithms/binPacking.js';

const prisma = new PrismaClient();

export async function runOptimizationPipeline(organizationId: string) {
  console.log(`Running optimization pipeline for org: ${organizationId}`);

  // 1. Fetch Cloud Accounts
  const accounts = await prisma.cloudAccount.findMany({
    where: { orgId: organizationId },
    include: {
      usageMetrics: {
        orderBy: { timestamp: 'asc' },
        where: {
          timestamp: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
          }
        }
      },
      reservationPortfolios: {
        where: { state: 'ACTIVE' }
      }
    }
  });

  // 2. Group data by (Region, Family)
  const usageByGroup: Record<string, { region: string; family: string; data: Map<string, number> }> = {};
  const activeRIByGroup: Record<string, number> = {};

  for (const account of accounts) {
    for (const metric of account.usageMetrics) {
      const key = `${metric.region}:${metric.instanceFamily}`;
      if (!usageByGroup[key]) {
        usageByGroup[key] = { region: metric.region, family: metric.instanceFamily, data: new Map() };
      }
      // Sum normalized units per day
      const dayKey = metric.timestamp.toISOString().split('T')[0]!;
      const current = usageByGroup[key]!.data.get(dayKey) || 0;
      usageByGroup[key]!.data.set(dayKey, current + metric.normalizedUnits);
    }

    for (const ri of account.reservationPortfolios) {
      const key = `${account.usageMetrics[0]?.region || 'unknown'}:${ri.instanceFamily}`; // Region is tricky for RIs in schema
      // In our seed script, RIs have an accountId, but UsageMetric also has accountId.
      // We should probably get the region from the first usage metric or add it to RI model.
      // For now, let's use the instance family and assume we match within account.
      
      const riKey = `${ri.instanceFamily}`; 
      activeRIByGroup[riKey] = (activeRIByGroup[riKey] || 0) + ri.normalizedUnits;
    }
  }

  // 3. Process each group
  const deficits: Deficit[] = [];

  for (const key in usageByGroup) {
    const group = usageByGroup[key]!;
    // Convert Map to sorted array of daily values
    const sortedDays = Array.from(group.data.keys()).sort();
    const timeSeries = sortedDays.map(day => group.data.get(day)!);

    // Run Forecast
    const forecast = holtWintersForecast(timeSeries, 7, 30);

    // Get active capacity for this family
    // Note: This matching logic should ideally include region.
    const activeCapacity = activeRIByGroup[group.family] || 0;

    deficits.push({
      instanceFamily: group.family,
      region: group.region,
      forecastedDemand: forecast,
      activeCapacity
    });
  }

  // 4. Generate Recommendations
  const results = generateRecommendations(deficits);

  if (results.length === 0) {
    console.log("No recommendations generated.");
    return null;
  }

  // 5. Save to Database
  const totalSavings = results.reduce((sum, r) => sum + r.estimatedMonthlySavings, 0);
  
  const executionPlan = await prisma.executionPlan.create({
    data: {
      organizationId,
      totalEstimatedSavings: totalSavings,
      status: 'DRAFT',
      recommendations: {
        create: results.map(r => ({
          instanceFamily: r.instanceFamily,
          region: r.region,
          recommendedQuantity: Math.round(r.recommendedQuantity),
          term: r.term,
          roiScore: r.roiScore,
          estimatedMonthlySavings: r.estimatedMonthlySavings,
          status: 'DRAFT'
        }))
      }
    }
  });

  console.log(`Created ExecutionPlan: ${executionPlan.id} with ${results.length} recommendations.`);
  return executionPlan;
}
