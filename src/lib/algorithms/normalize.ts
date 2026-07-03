/**
 * Unified compute unit calculation:
 * computeUnit = vCPU * 1.0 + RAM_GB * 0.25
 * This allows comparing different instance families across clouds.
 */
export function calculateComputeUnit(vCPU: number, ramGB: number): number {
  return vCPU * 1.0 + ramGB * 0.25;
}

// Mock instance metadata mapping
export const INSTANCE_METADATA: Record<string, { vCPU: number; ramGB: number }> = {
  // AWS
  'm5.large': { vCPU: 2, ramGB: 8 },
  'm5.xlarge': { vCPU: 4, ramGB: 16 },
  'c5.xlarge': { vCPU: 4, ramGB: 8 },
  'r5.2xlarge': { vCPU: 8, ramGB: 64 },
  // Azure
  'Standard_D2s_v3': { vCPU: 2, ramGB: 8 },
  'Standard_F4s': { vCPU: 4, ramGB: 8 },
  // GCP
  'n1-standard-1': { vCPU: 1, ramGB: 3.75 },
  'e2-medium': { vCPU: 2, ramGB: 4 },
};

export function normalizeUsage(instanceFamily: string, quantity: number): number {
  const metadata = INSTANCE_METADATA[instanceFamily];
  if (!metadata) {
    // Default fallback if metadata is unknown
    return quantity; 
  }
  const unitPerInstance = calculateComputeUnit(metadata.vCPU, metadata.ramGB);
  return Math.round(unitPerInstance * quantity);
}
