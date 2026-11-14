# Earth Listens

Earth Listens is a small, static sonification experiment for NASA Earth data. Move through the annual global temperature anomaly record and hear the value, its distance from the reference baseline, and its year-to-year change as pitch, tension, rhythm, and texture.

This build contains **one playable scene with real data**: NASA GISS GISTEMP v4 global annual temperature anomalies, 1880-2025. Arctic sea ice and Amazon vegetation controls are visible but disabled because their source data could not be acquired and verified in this environment. No substitute or synthetic values are used.

## Run locally

Requirements: Node.js 22.12 or newer and `curl` on `PATH` if you want to refresh the data.

```sh
npm install
npm run dev
```

The static production build can be checked with:

```sh
npm run build
npm run preview
```

Other checks:

```sh
npm test
npm run lint
```

To re-download and process the GISTEMP CSV into `public/data/global-temperature.json`:

```sh
npm run data:fetch
```

The data refresh script uses the system `curl` executable. It records source, data URL, access date, units, NASA use guidance, citation, and processing steps in the generated JSON.

## Use the instrument

- Choose a year with the range slider. Arrow keys move one year at a time.
- Press **Play** to begin; the browser audio context and Tone.js nodes are created only after this gesture.
- Choose Slow, Normal, or Fast playback.
- Turn on **Compare periods** to listen to the selected year and a second year on opposite stereo sides.
- **Mute** is always visible. Space toggles play/pause when focus is outside an interactive control; `M` toggles mute.
- The live status announces the selected year, value, and a plain-language sound description. The chart is supportive, not required to understand the series.

The data panel links to the NASA source and displays citation and use information. The “How we used AI” and mapping buttons open the contents of the corresponding project documentation.

## Data sources and terms

### Bundled: Global temperature anomaly

- Source: [NASA GISS Surface Temperature Analysis (GISTEMP v4)](https://data.giss.nasa.gov/gistemp/)
- CSV: [Global-mean monthly, seasonal, and annual means](https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv)
- Accessed: 2026-11-14.
- Units: degrees Celsius relative to NASA GISS's 1951-1980 mean.
- Use terms: the GISTEMP page asks users to cite the dataset and credit NASA GISS/GISTEMP. No dataset-specific restriction is stated there. NASA ESDIS [data-use guidance](https://www.earthdata.nasa.gov/engage/open-data-services-software-policies/data-use-guidance) describes NASA Earth science data as generally open and requests acknowledgment/citation; users must check any restrictions attached to a specific dataset.
- Processing: select the CSV's annual `J-D` column, omit nonnumeric/incomplete rows, and sort observations by year. The source values are not AI-generated.

### Planned but not bundled: Arctic sea ice

The intended source is the [NSIDC Sea Ice Index](https://nsidc.org/data/g02135/versions/3), yearly September extent, 1979 onward. This host timed out during this run; the downloadable file and its usage terms could not be verified. No Arctic data appears in the application.

### Planned but not bundled: Monthly NDVI

The NASA Earthdata catalog verifies [MODIS/Terra Vegetation Indices Monthly, MOD13C2.061](https://www.earthdata.nasa.gov/data/catalog/lpcloud-mod13c2-061), a global monthly product from February 2000 onward. Product data links are protected and redirect to Earthdata authentication. No credentials or suitable HDF4 extraction tool were available here, so no Amazon regional series appears in the application. NASA ESDIS [data-use guidance](https://www.earthdata.nasa.gov/engage/open-data-services-software-policies/data-use-guidance) says NASA-led mission data without a marked restriction are generally CC0 and encourages citation; confirm the product's current restrictions and citation before reuse.

## Mapping in brief

Values are normalized against the bundled series range. Pitch follows a three-octave C-D-E-G-A pentatonic scale. Distance from the zero-anomaly baseline increases detuning and filter brightness; the melody remains ordered. The absolute annual change controls 1-8 pulses and the level of soft pink noise. See [docs/SONIFICATION.md](docs/SONIFICATION.md) for the full, tested mapping.

## Limitations

- Only global temperature is currently playable. The two missing scenes, and therefore an Arctic-first live demo, remain blocked; see [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md).
- The sonification is an educational representation, not a scientific visualization or a substitute for the underlying data.
- The output has been checked in automated builds and browser playback, but a human has not yet listened and judged timbre, volume, or the 90-second demo.
- There is no backend, account system, live satellite processing, or current deployment URL.
- No project software license has been selected in this repository. Do not infer a project license from NASA data terms.

## AI assistance

AI assistance was used to scaffold and implement the current app, data processing script, tests, and documentation. A human provided the product brief and must still review the code, listen to the sound, confirm data terms and attribution, and check the event's AI disclosure and submission rules. See [docs/AI_USE.md](docs/AI_USE.md) for the detailed record and verification limits.
