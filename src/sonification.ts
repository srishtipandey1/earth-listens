import type { DataPoint, Dataset } from './data';

const PENTATONIC_SEMITONES = [0, 2, 4, 7, 9] as const;

export interface MappingOptions {
  min: number;
  max: number;
  baseline: number;
  maxChange: number;
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

export function createMappingOptions(dataset: Dataset, baseline: number): MappingOptions {
  if (!Number.isFinite(baseline)) {
    throw new Error('The historical baseline must be finite.');
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

  const normalized = normalizeValue(value, options.min, options.max);
  const baselineDistance = Math.max(Math.abs(options.min - options.baseline), Math.abs(options.max - options.baseline));
  const tension = baselineDistance === 0 ? 0 : clamp(Math.abs(value - options.baseline) / baselineDistance, 0, 1);
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
