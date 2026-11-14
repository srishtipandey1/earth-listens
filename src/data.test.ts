import { describe, expect, it } from 'vitest';
import { parseDataset } from './data';

const validDataset = {
  metadata: {
    id: 'test',
    title: 'Test scene',
    source: 'Test source',
    url: 'https://example.test/data',
    dataUrl: 'https://example.test/series',
    accessed: '2026-11-14',
    units: 'units',
    license: 'terms',
    licenseUrl: 'https://example.test/terms',
    citation: 'Test citation',
    processing: ['Select annual values.'],
    min: 0,
    max: 2,
  },
  values: [{ year: 2000, value: 0 }, { year: 2001, value: 2 }],
};

describe('parseDataset', () => {
  it('accepts finite, ordered observations with source metadata', () => {
    expect(parseDataset(validDataset).values).toEqual(validDataset.values);
  });

  it('rejects duplicate or descending years', () => {
    expect(() => parseDataset({
      ...validDataset,
      values: [{ year: 2001, value: 1 }, { year: 2001, value: 2 }],
    })).toThrow('strictly increasing');
  });

  it('rejects values outside the declared range', () => {
    expect(() => parseDataset({
      ...validDataset,
      values: [{ year: 2000, value: -1 }, { year: 2001, value: 2 }],
    })).toThrow('metadata range');
  });
});
