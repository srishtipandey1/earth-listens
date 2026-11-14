import type { DataPoint, Dataset } from './data';

const PENTATONIC_SEMITONES = [0, 2, 4, 7, 9] as const;

export interface MappingOptions {
  min: number;
  max: number;
  baseline: number;
  maxChange: number;
  tensionMode?: 'baseline-distance' | 'lower-is-tense';
}

export interface SonificationMapping {
  normalized: number;
  midi: number;
  tension: number;
  detuneCents: number;
  filterBrightness: number;
  rateOfChange: number;
  noteDensity: number;
  noiseGain: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeValue(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    throw new Error('Normalization requires finite values and a range where max is greater than min.');
  }

  return clamp((value - min) / (max - min), 0, 1);
}

export function averageForPeriod(values: readonly DataPoint[], firstYear: number, lastYear: number): number {
  if (!Number.isInteger(firstYear) || !Number.isInteger(lastYear) || lastYear < firstYear) {
    throw new Error('Average period must have integer years in ascending order.');
  }

  const period = values.filter(({ year }) => year >= firstYear && year <= lastYear);
  const expectedCount = lastYear - firstYear + 1;
  if (period.length !== expectedCount || period.some(({ year }, index) => year !== firstYear + index)) {
    throw new Error(`Average period must contain every year from ${firstYear} through ${lastYear}.`);
  }

  return period.reduce((sum, { value }) => sum + value, 0) / period.length;
}

export function createMappingOptions(
  dataset: Dataset,
  baseline: number,
  tensionMode: MappingOptions['tensionMode'] = 'baseline-distance',
): MappingOptions {
  if (!Number.isFinite(baseline)) {
    throw new Error('The historical baseline must be finite.');
  }
  if (baseline < dataset.metadata.min || baseline > dataset.metadata.max) {
    throw new Error('The historical baseline must fall within the dataset range.');
  }
  if (tensionMode === 'lower-is-tense' && baseline <= dataset.metadata.min) {
    throw new Error('A lower-is-tense mapping requires the baseline above the dataset minimum.');
  }

  let maxChange = 0;

  for (let index = 1; index < dataset.values.length; index += 1) {
    const change = Math.abs(dataset.values[index].value - dataset.values[index - 1].value);
    maxChange = Math.max(maxChange, change);
  }

  return {
    min: dataset.metadata.min,
    max: dataset.metadata.max,
    baseline,
    maxChange,
    tensionMode,
  };
}

export function mapObservation(
  value: number,
  previousValue: number | undefined,
  options: MappingOptions,
): SonificationMapping {
  if (!Number.isFinite(options.baseline) || !Number.isFinite(options.maxChange) || options.maxChange < 0) {
    throw new Error('Mapping options require a finite baseline and a non-negative change range.');
  }
  if (options.tensionMode === 'lower-is-tense' && options.baseline <= options.min) {
    throw new Error('A lower-is-tense mapping requires the baseline above the dataset minimum.');
  }

  const normalized = normalizeValue(value, options.min, options.max);
  const baselineDistance = Math.max(Math.abs(options.min - options.baseline), Math.abs(options.max - options.baseline));
  const tension = options.tensionMode === 'lower-is-tense'
    ? clamp((options.baseline - value) / (options.baseline - options.min), 0, 1)
    : baselineDistance === 0 ? 0 : clamp(Math.abs(value - options.baseline) / baselineDistance, 0, 1);
  const change = previousValue === undefined ? 0 : Math.abs(value - previousValue);
  const rateOfChange = options.maxChange === 0 ? (change === 0 ? 0 : 1) : clamp(change / options.maxChange, 0, 1);
  const notePosition = Math.round(normalized * 15);
  const octave = Math.floor(notePosition / PENTATONIC_SEMITONES.length);
  const semitone = PENTATONIC_SEMITONES[notePosition % PENTATONIC_SEMITONES.length];

  return {
    normalized,
    midi: 48 + octave * 12 + semitone,
    tension,
    detuneCents: tension * 90,
    filterBrightness: tension,
    rateOfChange,
    noteDensity: 1 + Math.round(rateOfChange * 7),
    noiseGain: rateOfChange * 0.18,
  };
}

export function mapSeriesPoint(
  values: DataPoint[],
  index: number,
  options: MappingOptions,
): SonificationMapping {
  if (!Number.isInteger(index) || index < 0 || index >= values.length) {
    throw new Error('Series index is outside the available observations.');
  }

  return mapObservation(values[index].value, values[index - 1]?.value, options);
}
