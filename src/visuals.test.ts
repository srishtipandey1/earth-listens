import { describe, expect, it } from 'vitest';
import { iceCapRadius, temperatureStripeColor } from './visuals';

describe('data-driven scene visuals', () => {
  it('scales ice-cap area in direct proportion to extent', () => {
    const lower = iceCapRadius(3.57, 7.67, 150);
    const higher = iceCapRadius(7.14, 7.67, 150);

    expect((higher * higher) / (lower * lower)).toBeCloseTo(2, 8);
  });

  it('colors temperature stripes on opposite sides of zero with different hues', () => {
    expect(temperatureStripeColor(-0.48, -0.48, 1.28)).not.toBe(temperatureStripeColor(1.28, -0.48, 1.28));
    expect(temperatureStripeColor(-0.48, -0.48, 1.28)).not.toBe(temperatureStripeColor(0, -0.48, 1.28));
  });

  it('rejects invalid extent and temperature ranges', () => {
    expect(() => iceCapRadius(8, 7, 150)).toThrow('within a positive scale');
    expect(() => temperatureStripeColor(0, 1, 1)).toThrow('max is greater than min');
  });
});
