import { execFileSync } from 'node:child_process';
import { log } from 'node:console';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, '..');
const outputDirectory = resolve(projectDirectory, 'public', 'data');
const dataUrl = 'https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv';
const metadataUrl = 'https://data.giss.nasa.gov/gistemp/data_v4.html';
const curl = process.platform === 'win32' ? 'curl.exe' : 'curl';
const csv = execFileSync(curl, ['--fail', '--location', '--silent', '--show-error', dataUrl], {
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024,
});
const lines = csv.split(/\r?\n/);
const headerIndex = lines.findIndex((line) => line.startsWith('Year,'));

if (headerIndex < 0) {
  throw new Error('GISTEMP CSV did not contain its expected header.');
}

const header = lines[headerIndex].split(',');
const annualMeanIndex = header.indexOf('J-D');

if (annualMeanIndex < 0) {
  throw new Error('GISTEMP CSV did not contain the annual J-D mean column.');
}

const values = lines
  .slice(headerIndex + 1)
  .map((line) => line.split(','))
  .filter((row) => row.length > annualMeanIndex)
  .map((row) => ({ year: Number(row[0]), value: Number(row[annualMeanIndex]) }))
  .filter(({ year, value }) => Number.isInteger(year) && Number.isFinite(value))
  .sort((left, right) => left.year - right.year);

if (values.length < 100) {
  throw new Error(`GISTEMP CSV contained too few annual values: ${values.length}`);
}

const allValues = values.map(({ value }) => value);
const dataset = {
  metadata: {
    id: 'global-temperature',
    title: 'NASA GISS Global-mean Annual Temperature Anomaly',
    source: 'NASA Goddard Institute for Space Studies, GISTEMP v4',
    url: metadataUrl,
    dataUrl,
    accessed: new Date().toISOString().slice(0, 10),
    units: 'degrees Celsius relative to the 1951-1980 mean',
    license: 'NASA Earth science data; cite NASA GISS/GISTEMP. No dataset-specific restriction is stated on the source page. See NASA ESDIS data-use guidance.',
    licenseUrl: 'https://www.earthdata.nasa.gov/engage/open-data-services-software-policies/data-use-guidance',
    citation: 'GISTEMP Team, 2026: GISS Surface Temperature Analysis (GISTEMP), version 4. NASA Goddard Institute for Space Studies. Cite the dataset page with the access date.',
    processing: [
      'Read the global-mean monthly/seasonal/annual CSV linked by the NASA GISTEMP v4 data page.',
      'Select the annual J-D column, which is the calendar-year mean anomaly.',
      'Skip unavailable annual rows and retain finite values in ascending year order.',
    ],
    min: Math.min(...allValues),
    max: Math.max(...allValues),
  },
  values,
};

await mkdir(outputDirectory, { recursive: true });
const outputPath = resolve(outputDirectory, 'global-temperature.json');
await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
log(`Wrote ${values.length} annual values (${values[0].year}-${values.at(-1).year}) to ${outputPath}`);
