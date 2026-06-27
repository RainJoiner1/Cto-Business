import { describe, it, expect } from 'vitest';
import { calculateComputeUnit } from './normalize.js';
import { holtWintersForecast } from './forecast.js';
import { calculateROI } from './binPacking.js';

describe('Algorithms', () => {
  describe('Normalization', () => {
    it('should calculate compute units correctly', () => {
      // vCPU * 1.0 + RAM * 0.25
      expect(calculateComputeUnit(2, 8)).toBe(4);
      expect(calculateComputeUnit(4, 16)).toBe(8);
      expect(calculateComputeUnit(8, 32)).toBe(16);
    });
  });

  describe('Forecasting', () => {
    it('should predict increasing trend', () => {
      const data = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
      const forecast = holtWintersForecast(data, 2, 3);
      expect(forecast.length).toBe(3);
      expect(forecast[0]).toBeGreaterThan(19);
      expect(forecast[1]).toBeGreaterThan(forecast[0]!);
    });

    it('should handle seasonality', () => {
      // 7-day seasonality
      const data = [10, 20, 10, 20, 10, 20, 10, 11, 21, 11, 21, 11, 21, 11];
      const forecast = holtWintersForecast(data, 7, 7);
      expect(forecast[0]).toBeCloseTo(12, 0); // Monday (day 15) should be similar to day 1 and 8
      expect(forecast[1]).toBeCloseTo(22, 0); // Tuesday (day 16) should be similar to day 2 and 9
    });
  });

  describe('ROI Calculation', () => {
    it('should calculate ROI and savings correctly', () => {
      const onDemandHourly = 0.1;
      const reservationHourly = 0.06;
      const upfrontCost = 100;
      const quantity = 10;
      const termYears = 1;

      const { roiScore, monthlySavings } = calculateROI(
        onDemandHourly,
        reservationHourly,
        upfrontCost,
        quantity,
        termYears
      );

      // Monthly savings: (0.1 - 0.06) * 10 * 730 - (100 / 12) = 292 - 8.33 = 283.66
      expect(monthlySavings).toBeCloseTo(283.66, 1);
      
      // Total savings: (0.1 - 0.06) * 10 * 8760 - 100 = 3504 - 100 = 3404
      // roiScore: 3404 / 100 = 34.04
      expect(roiScore).toBeCloseTo(34.04, 1);
    });

    it('should handle zero upfront cost', () => {
      const { roiScore } = calculateROI(0.1, 0.06, 0, 10, 1);
      expect(roiScore).toBe(99.9);
    });
  });
});
