/**
 * Holt-Winters Triple Exponential Smoothing (Additive)
 * Suitable for data with trend and seasonality.
 */
export function holtWintersForecast(
  data: number[],
  seasonLength: number = 7,
  forecastHorizon: number = 30,
  alpha: number = 0.2,
  beta: number = 0.1,
  gamma: number = 0.3
): number[] {
  if (data.length < seasonLength * 2) {
    // Not enough data to determine seasonality, fallback to simple smoothing or mean
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    return new Array(forecastHorizon).fill(avg);
  }

  // Improved initialization
  let level = data.slice(0, seasonLength).reduce((a, b) => a + b, 0) / seasonLength;
  
  const firstSeasonAvg = level;
  const secondSeasonAvg = data.slice(seasonLength, 2 * seasonLength).reduce((a, b) => a + b, 0) / seasonLength;
  let trend = (secondSeasonAvg - firstSeasonAvg) / seasonLength;

  const seasons = new Array(seasonLength);
  for (let i = 0; i < seasonLength; i++) {
    seasons[i] = data[i]! - level;
  }

  const result = [];

  // Initial smoothing over historical data
  for (let i = 0; i < data.length; i++) {
    const value = data[i]!;
    const lastLevel = level;
    const seasonIdx = i % seasonLength;

    level = alpha * (value - seasons[seasonIdx]!) + (1 - alpha) * (level + trend);
    trend = beta * (level - lastLevel) + (1 - beta) * trend;
    seasons[seasonIdx] = gamma * (value - level) + (1 - gamma) * seasons[seasonIdx]!;
  }

  // Forecast
  for (let i = 1; i <= forecastHorizon; i++) {
    const seasonIdx = (data.length + i - 1) % seasonLength;
    const forecastValue = level + i * trend + seasons[seasonIdx]!;
    result.push(Math.max(0, forecastValue)); // Cloud usage can't be negative
  }

  return result;
}
