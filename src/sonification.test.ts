import { describe, expect, it } from 'vitest';
import { mapObservation, normalizeValue } from './sonification';

const options = { min: -0.5, max: 1.3, baseline: 0, maxChange: 0.5 };

describe('normalizeValue', () => {
  it('clamps to 0..1 and increases monotonically', () => {
    expect(normalizeValue(-1, options.min, options.max)).toBe(0);
    expect(normalizeValue(options.min, options.min, options.max)).toBe(0);
    expect(normalizeValue(0, options.min, options.max)).toBeGreaterThan(0);
    expect(normalizeValue(options.max, options.min, options.max)).toBe(1);
    expect(normalizeValue(2, options.min, options.max)).toBe(1);
  });

  it('rejects an invalid range', () => {
    expect(() => normalizeValue(0, 1, 1)).toThrow('max is greater than min');
  });
});

describe('mapObservation', () => {
  it('keeps pitch in range and non-decreasing with the data value', () => {
    const mapped = [-0.5, -0.2, 0, 0.5, 1.3]
      .map((value) => mapObservation(value, undefined, options));
    const pitches = mapped.map(({ midi }) => midi);

    expect(pitches.every((pitch) => pitch >= 48 && pitch <= 84)).toBe(true);
    expect(pitches).toEqual([...pitches].sort((left, right) => left - right));
  });

  it('maps the baseline to a consonant, quiet state', () => {
    const mapping = mapObservation(0, 0, options);

    expect(mapping.tension).toBe(0);
    expect(mapping.detuneCents).toBe(0);
    expect(mapping.filterBrightness).toBe(0);
    expect(mapping.noteDensity).toBe(1);
    expect(mapping.noiseGain).toBe(0);
  });

  it('increases rhythmic density and texture with the rate of change', () => {
    const mapping = mapObservation(1, 0.5, options);

    expect(mapping.rateOfChange).toBe(1);
    expect(mapping.noteDensity).toBe(8);
    expect(mapping.noiseGain).toBe(0.18);
  });
});
