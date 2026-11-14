# Earth Listens

Earth Listens is a small, static sonification experiment for NASA Earth data. Move through the annual global temperature anomaly record and hear the value, its distance from the reference baseline, and its year-to-year change as pitch, tension, rhythm, and texture.

This build contains **two playable scenes with real data**: NASA GISS GISTEMP v4 global annual temperature anomalies (1880-2025) and the NSIDC Sea Ice Index Version 4 Northern Hemisphere September sea-ice extent series (1979-2026). Amazon vegetation remains unavailable because its source data could not be acquired and verified in this environment. No substitute or synthetic values are used.

## Run locally

Requirements: Node.js 22.12 or newer and `curl` on `PATH` if you want to refresh the data.

```sh
npm ci
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

## Deploy to GitHub Pages

The GitHub Actions workflow deploys `dist/` to Pages after each push to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The Vite base path is `/earth-listens/` for this repository; use that path when opening the published site.

To re-download and process the GISTEMP CSV into `public/data/global-temperature.json`:

```sh
npm run data:fetch
```

The GISTEMP data refresh script uses the system `curl` executable. It records source, data URL, access date, units, NASA use guidance, citation, and processing steps in the generated JSON.

The Arctic data file was supplied locally as `data-raw/N_09_extent_v4.0.csv`. Validate it and regenerate the bundled JSON with:

```sh
npm run data:sea-ice
```

The processor checks the September/Northern Hemisphere subset, validates 48 consecutive years (1979-2026) and the documented 2025 input-source transition, and copies the `extent` numbers without interpolation or rounding. The supplied download URL is the [NSIDC Northern Hemisphere monthly data directory](https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/data/); the exact URL is recorded in the JSON metadata and shown in the About the data panel.

## Use the instrument

- Choose a year with the range slider. Arrow keys move one year at a time.
- Press **Play** to begin; the browser audio context and Tone.js nodes are created only after this gesture.
- Choose **Arctic sea ice — September extent** to hear lower extent as greater tension against the 1981-2010 mean.
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

### Bundled: Arctic sea ice

- Source: [NSIDC Sea Ice Index, Version 4 (G02135)](https://nsidc.org/data/g02135/versions/4)
- Download URL supplied by the human: [NSIDC Northern Hemisphere monthly data directory](https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/data/)
- User guide: [Sea Ice Index, Version 4 User Guide](https://nsidc.org/sites/default/files/documents/user-guide/g02135-v004-userguide.pdf)
- Citation: Fetterer, F., Knowles, K., Meier, W. N., Savoie, M., Windnagel, A. K. & Stafford, T. (2025). *Sea Ice Index* (G02135, Version 4). Boulder, Colorado USA. National Snow and Ice Data Center. [https://doi.org/10.7265/a98x-0f50](https://doi.org/10.7265/a98x-0f50). Accessed 2026-11-14.
- Accessed: 2026-11-14.
- Units: million square kilometers, as specified in the Version 4 user guide.
- Use terms: NSIDC requires citation when these data are used; see [NSIDC data use and citation policy](https://nsidc.org/about/data-use-and-copyright).
- Processing: the human-supplied `data-raw/N_09_extent_v4.0.csv` is filtered to September (`mo=9`) and Northern Hemisphere (`region=N`); its `extent` values are preserved as supplied. The processor validates 48 contiguous annual observations from 1979-2026 and verifies the `source_dataset` values.
- Source transition: the Version 4 user guide says monthly `source_dataset` identifies the input product: NSIDC-0051 through 2024 and AMSR2/NSIDC-0803 from 2025. The guide attributes the switch to expected loss of SSMIS access and observed SSMIS degradation; pre-2025 Version 4 data are copies of Version 3. This product-input change is relevant when interpreting the time series.

### Planned but not bundled: Monthly NDVI

The NASA Earthdata catalog verifies [MODIS/Terra Vegetation Indices Monthly, MOD13C2.061](https://www.earthdata.nasa.gov/data/catalog/lpcloud-mod13c2-061), a global monthly product from February 2000 onward. Product data links are protected and redirect to Earthdata authentication. No credentials or suitable HDF4 extraction tool were available here, so no Amazon regional series appears in the application. NASA ESDIS [data-use guidance](https://www.earthdata.nasa.gov/engage/open-data-services-software-policies/data-use-guidance) says NASA-led mission data without a marked restriction are generally CC0 and encourages citation; confirm the product's current restrictions and citation before reuse.

## Mapping in brief

Values are normalized against each scene's observed range. Pitch follows a three-octave C-D-E-G-A pentatonic scale. Temperature tension measures distance from the zero-anomaly baseline; Arctic tension increases as extent drops below the dataset's 1981-2010 September mean (6.413333 million square kilometers). The absolute annual change controls 1-8 pulses and the level of soft pink noise. See [docs/SONIFICATION.md](docs/SONIFICATION.md) for the full, tested mapping.

## Limitations

- Global temperature and Arctic sea ice are playable; Amazon NDVI is not. The original three-scene acceptance criterion remains incomplete; see [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md).
- The NSIDC source file was supplied locally; its exact provided download URL is the Northern Hemisphere monthly data directory linked above and in the About the data panel.
- The Sea Ice Index changes input products in 2025, as described above and in the in-app data panel. This source transition should be considered when interpreting changes in extent.
- The sonification is an educational representation, not a scientific visualization or a substitute for the underlying data.
- The output has been checked in automated builds and browser playback, but a human has not yet listened and judged timbre, volume, or the 90-second demo.
- There is no backend, account system, live satellite processing, or current deployment URL.
- No project software license has been selected in this repository. Do not infer a project license from NASA data terms.

## AI assistance

AI assistance was used to scaffold and implement the current app, data processing script, tests, and documentation. A human provided the product brief and must still review the code, listen to the sound, confirm data terms and attribution, and check the event's AI disclosure and submission rules. See [docs/AI_USE.md](docs/AI_USE.md) for the detailed record and verification limits.
