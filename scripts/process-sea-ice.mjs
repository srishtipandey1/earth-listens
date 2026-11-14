import { log } from 'node:console';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, '..');
const inputPath = resolve(projectDirectory, 'data-raw', 'N_09_extent_v4.0.csv');
const outputDirectory = resolve(projectDirectory, 'public', 'data');
const datasetUrl = 'https://nsidc.org/data/g02135/versions/4';
const dataUrl = 'https://noaadata.apps.nsidc.org/NOAA/G02135/';
const userGuideUrl = 'https://nsidc.org/sites/default/files/documents/user-guide/g02135-v004-userguide.pdf';
const citationPolicyUrl = 'https://nsidc.org/about/data-use-and-copyright';
const firstYear = 1979;
const lastYear = 2026;
const expectedCount = lastYear - firstYear + 1;

const source = await readFile(inputPath, 'utf8');
const lines = source.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim().length > 0);
const header = lines.shift()?.split(',').map((column) => column.trim().toLowerCase());

if (!header) {
  throw new Error('NSIDC CSV is empty.');
}

const requiredColumns = ['year', 'mo', 'source_dataset', 'region', 'extent'];
const indexes = Object.fromEntries(requiredColumns.map((column) => [column, header.indexOf(column)]));

for (const column of requiredColumns) {
  if (indexes[column] < 0) {
    throw new Error(`NSIDC CSV is missing the required "${column}" column.`);
  }
}

const values = lines.map((line, lineIndex) => {
  const cells = line.split(',').map((cell) => cell.trim());
  const year = Number(cells[indexes.year]);
  const month = Number(cells[indexes.mo]);
  const sourceDataset = cells[indexes.source_dataset];
  const region = cells[indexes.region];
  const extent = Number(cells[indexes.extent]);

  if (!Number.isInteger(year) || month !== 9 || region !== 'N' || !Number.isFinite(extent) || extent < 0) {
    throw new Error(`Invalid September northern-hemisphere extent row at CSV line ${lineIndex + 2}.`);
  }

  const expectedSource = year < 2025 ? 'NSIDC-0051' : 'NSIDC-0803';
  if (sourceDataset !== expectedSource) {
    throw new Error(`Unexpected source_dataset "${sourceDataset}" for ${year}; expected ${expectedSource}.`);
  }

  return { year, value: extent };
});

if (values.length !== expectedCount
  || values[0]?.year !== firstYear
  || values.at(-1)?.year !== lastYear
  || values.some(({ year }, index) => year !== firstYear + index)) {
  throw new Error(`Expected ${expectedCount} gap-free annual values from ${firstYear} to ${lastYear}; found ${values.length}.`);
}

const extents = values.map(({ value }) => value);
const dataset = {
  metadata: {
    id: 'arctic-sea-ice',
    title: 'Northern Hemisphere September Sea Ice Extent',
    source: 'National Snow and Ice Data Center (NSIDC), Sea Ice Index Version 4',
    url: datasetUrl,
    dataUrl,
    accessed: '2026-11-14',
    units: 'million square kilometers',
    license: 'NSIDC requires citation of this dataset when used; see its data-use and citation policy.',
    licenseUrl: citationPolicyUrl,
    citation: 'Fetterer, F., Knowles, K., Meier, W. N., Savoie, M., Windnagel, A. K. & Stafford, T. (2025). Sea Ice Index (G02135, Version 4). Boulder, Colorado USA. National Snow and Ice Data Center. https://doi.org/10.7265/a98x-0f50. Accessed 2026-11-14.',
    processing: [
      'Read the human-supplied local file data-raw/N_09_extent_v4.0.csv; no remote file URL was supplied.',
      'Select the September (mo=9) Northern Hemisphere (region=N) rows and the extent column; retain the numeric values without interpolation, rounding, or other modification.',
      `Validate exactly ${expectedCount} consecutive annual values from ${firstYear} through ${lastYear}.`,
      `The Version 4 user guide (${userGuideUrl}) states that source_dataset identifies the input product: NSIDC-0051 through 2024 and NSIDC-0803 (AMSR2) from 2025. It says the change was driven by expected loss of SSMIS access and observed SSMIS degradation; pre-2025 Version 4 data are copies of Version 3.`,
      'The user guide states monthly extent is expressed in millions of square kilometers.',
    ],
    min: Math.min(...extents),
    max: Math.max(...extents),
  },
  values,
};

await mkdir(outputDirectory, { recursive: true });
const outputPath = resolve(outputDirectory, 'arctic-sea-ice.json');
await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
log(`Wrote ${values.length} annual values (${firstYear}-${lastYear}) to ${outputPath}`);
