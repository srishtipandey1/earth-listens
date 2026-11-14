export interface DataPoint {
  year: number;
  value: number;
}

export interface SceneMetadata {
  id: string;
  title: string;
  source: string;
  url: string;
  dataUrl: string;
  accessed: string;
  units: string;
  license: string;
  licenseUrl: string;
  citation: string;
  processing: string[];
  min: number;
  max: number;
}

export interface Dataset {
  metadata: SceneMetadata;
  values: DataPoint[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function requiredString(metadata: Record<string, unknown>, field: string): string {
  const value = metadata[field];

  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Dataset metadata is missing ${field}.`);
  }

  return value;
}

export function parseDataset(input: unknown): Dataset {
  if (!isRecord(input) || !isRecord(input.metadata) || !Array.isArray(input.values)) {
    throw new Error('Dataset must contain metadata and a values array.');
  }

  const rawMetadata = input.metadata;
  if (!isStringArray(rawMetadata.processing)) {
    throw new Error('Dataset metadata processing must be a list of strings.');
  }

  const min = rawMetadata.min;
  const max = rawMetadata.max;

  if (typeof min !== 'number' || !Number.isFinite(min) || typeof max !== 'number' || !Number.isFinite(max) || max <= min) {
    throw new Error('Dataset metadata must contain a valid numeric range.');
  }

  const values: DataPoint[] = [];
  let previousYear = Number.NEGATIVE_INFINITY;

  for (const rawPoint of input.values) {
    if (!isRecord(rawPoint) || typeof rawPoint.year !== 'number' || !Number.isInteger(rawPoint.year)
      || typeof rawPoint.value !== 'number' || !Number.isFinite(rawPoint.value)) {
      throw new Error('Dataset values must contain integer years and finite numeric values.');
    }
    if (rawPoint.year <= previousYear) {
      throw new Error('Dataset years must be strictly increasing.');
    }
    if (rawPoint.value < min || rawPoint.value > max) {
      throw new Error('Dataset values must fall within the metadata range.');
    }

    previousYear = rawPoint.year;
    values.push({ year: rawPoint.year, value: rawPoint.value });
  }

  if (values.length < 2) {
    throw new Error('Dataset must contain at least two observations.');
  }

  const metadata: SceneMetadata = {
    id: requiredString(rawMetadata, 'id'),
    title: requiredString(rawMetadata, 'title'),
    source: requiredString(rawMetadata, 'source'),
    url: requiredString(rawMetadata, 'url'),
    dataUrl: requiredString(rawMetadata, 'dataUrl'),
    accessed: requiredString(rawMetadata, 'accessed'),
    units: requiredString(rawMetadata, 'units'),
    license: requiredString(rawMetadata, 'license'),
    licenseUrl: requiredString(rawMetadata, 'licenseUrl'),
    citation: requiredString(rawMetadata, 'citation'),
    processing: rawMetadata.processing,
    min,
    max,
  };

  return { metadata, values };
}

export async function loadDataset(url: string): Promise<Dataset> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not load dataset from ${url}: HTTP ${response.status}.`);
  }

  return parseDataset(await response.json());
}
