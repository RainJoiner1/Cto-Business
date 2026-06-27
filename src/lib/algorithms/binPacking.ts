import { CommitmentTerm, PlanStatus } from '@prisma/client';
import { PRICING_METADATA } from './pricing.js';

export interface Deficit {
  instanceFamily: string;
  region: string;
  forecastedDemand: number[]; // 30 days of compute units
  activeCapacity: number;     // Current compute units covered by RIs
}

export interface RecommendationResult {
  instanceFamily: string;
  region: string;
  recommendedQuantity: number;
  term: CommitmentTerm;
  roiScore: number;
  estimatedMonthlySavings: number;
}

export function calculateROI(
  onDemandHourly: number,
  reservationHourly: number,
  upfrontCost: number,
  quantity: number,
  termYears: number
): { roiScore: number; monthlySavings: number } {
  const totalHours = termYears * 365 * 24;
  const monthlyHours = 730;

  const onDemandTotal = onDemandHourly * quantity * totalHours;
  const reservationTotal = (reservationHourly * quantity * totalHours) + upfrontCost;
  
  const totalSavings = onDemandTotal - reservationTotal;
  const monthlySavings = (onDemandHourly - reservationHourly) * quantity * monthlyHours - (upfrontCost / (termYears * 12));
  
  // roiScore = (Total Savings over term) / Upfront Cost
  // Using the formula from the task but adjusted for total savings
  let roiScore = 0;
  if (upfrontCost > 0) {
    roiScore = totalSavings / upfrontCost;
  } else {
    // If no upfront, ROI is technically infinite or very high
    roiScore = totalSavings > 0 ? 99.9 : 0;
  }

  return { roiScore, monthlySavings };
}

export function generateRecommendations(
  deficits: Deficit[]
): RecommendationResult[] {
  const recommendations: RecommendationResult[] = [];

  for (const deficit of deficits) {
    // Determine the stable base demand (minimum forecasted demand over 30 days)
    const minDemand = Math.min(...deficit.forecastedDemand);
    const uncoveredBase = Math.max(0, minDemand - deficit.activeCapacity);

    if (uncoveredBase > 0) {
      const pricing = PRICING_METADATA[deficit.instanceFamily];
      if (!pricing) continue;

      // Calculate quantity needed (uncovered units / unit size)
      // For simplicity, we assume recommendation quantity matches compute units for now 
      // or we could divide by the unit size. 
      // Let's assume we recommend in "units" for now as per normalizedUnits.
      
      const { roiScore, monthlySavings } = calculateROI(
        pricing.onDemandHourly,
        pricing.reservationHourly,
        pricing.upfrontCost,
        uncoveredBase,
        1 // Default to 1 year
      );

      // Filter: break-even < 6 months
      // total upfront / monthly savings < 6
      const breakEvenMonths = monthlySavings > 0 ? pricing.upfrontCost / monthlySavings : 999;

      if (breakEvenMonths < 6) {
        recommendations.push({
          instanceFamily: deficit.instanceFamily,
          region: deficit.region,
          recommendedQuantity: uncoveredBase,
          term: 'ONE_YEAR',
          roiScore,
          estimatedMonthlySavings: monthlySavings
        });
      }
    }
  }

  return recommendations.sort((a, b) => b.roiScore - a.roiScore);
}
