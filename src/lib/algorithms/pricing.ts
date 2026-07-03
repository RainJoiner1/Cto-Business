export interface PricingData {
  onDemandHourly: number;
  reservationHourly: number;
  upfrontCost: number;
}

// Mock pricing data for 1-year Standard RI
export const PRICING_METADATA: Record<string, PricingData> = {
  'm5.large': { onDemandHourly: 0.096, reservationHourly: 0.06, upfrontCost: 0 }, // Partial Upfront or All Upfront? Let's assume No Upfront for simplicity in mock, or add it.
  'm5.xlarge': { onDemandHourly: 0.192, reservationHourly: 0.12, upfrontCost: 0 },
  'c5.xlarge': { onDemandHourly: 0.17, reservationHourly: 0.10, upfrontCost: 0 },
  'r5.2xlarge': { onDemandHourly: 0.504, reservationHourly: 0.31, upfrontCost: 0 },
  'Standard_D2s_v3': { onDemandHourly: 0.096, reservationHourly: 0.06, upfrontCost: 0 },
  'Standard_F4s': { onDemandHourly: 0.169, reservationHourly: 0.10, upfrontCost: 0 },
  'n1-standard-1': { onDemandHourly: 0.0475, reservationHourly: 0.03, upfrontCost: 0 },
  'e2-medium': { onDemandHourly: 0.0335, reservationHourly: 0.02, upfrontCost: 0 },
};

// Adjusting mock to have some upfront cost for ROI calculation variety
PRICING_METADATA['m5.large']!.upfrontCost = 200;
PRICING_METADATA['m5.xlarge']!.upfrontCost = 400;
PRICING_METADATA['c5.xlarge']!.upfrontCost = 350;
PRICING_METADATA['r5.2xlarge']!.upfrontCost = 1000;
