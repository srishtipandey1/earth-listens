import { describe, expect, it } from 'vitest';
import rawArcticDataset from '../public/data/arctic-sea-ice.json';
import { parseDataset } from './data';
import {
  averageForPeriod,
  createMappingOptions,
  mapObservation,
  mapSeriesPoint,
  normalizeValue,
} from './sonification';

const options = { min: -0.5, max: 1.3, baseline: 0, maxChange: 0.5 };
const arcticDataset = parseDataset(rawArcticDataset);
const arcticBaseline = averageForPeriod(arcticDataset.values, 1981, 2010);
const arcticOptions = createMappingOptions(arcticDataset, arcticBaseline, 'lower-is-tense');

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

describe('Arctic sea-ice mapping', () => {
  it('uses the complete 1981-2010 record as its baseline period', () => {
    expect(arcticBaseline).toBeCloseTo(6.4133333333, 8);
    expect(arcticDataset.values).toHaveLength(48);
    expect(arcticDataset.values.map(({ year }) => year))
      .toEqual(Array.from({ length: 48 }, (_, index) => 1979 + index));
  });

  it('keeps low-extent tension within bounds and reduces tension as extent rises', () => {
    const extents = [arcticDataset.metadata.min, arcticBaseline, arcticDataset.metadata.max];
    const tensions = extents.map((extent) => mapObservation(extent, undefined, arcticOptions).tension);

    expect(tensions).toEqual([1, 0, 0]);
    expect(tensions.every((tension) => tension >= 0 && tension <= 1)).toBe(true);
  });

  it('keeps the baseline consonant and makes 2012 tenser than 1979', () => {
    const baseline = mapObservation(arcticBaseline, arcticBaseline, arcticOptions);
    const year1979Index = arcticDataset.values.findIndex(({ year }) => year === 1979);
    const year2012Index = arcticDataset.values.findIndex(({ year }) => year === 2012);
    const year1979 = mapSeriesPoint(arcticDataset.values, year1979Index, arcticOptions);
    const year2012 = mapSeriesPoint(arcticDataset.values, year2012Index, arcticOptions);

    expect(baseline.tension).toBe(0);
    expect(baseline.detuneCents).toBe(0);
    expect(baseline.filterBrightness).toBe(0);
    expect(baseline.noteDensity).toBe(1);
    expect(baseline.noiseGain).toBe(0);
    expect(year2012.tension).toBeGreaterThan(year1979.tension);
  });
});
