# Known Issues

## Amazon regional NDVI is not bundled

- NASA Earthdata verifies MODIS/Terra MOD13C2.061 as a monthly global NDVI product, but its data links require Earthdata authentication. This environment has no Earthdata credentials or suitable HDF4 extraction tool, so no Amazon regional series was created.
- **Impact:** global temperature and Arctic sea ice are playable; Amazon NDVI is not. The original three-scene acceptance criterion remains incomplete.
- **Human follow-up:** obtain authorized data, confirm the regional processing method and citation/terms, then add a real-data pipeline and tests. Do not substitute estimates or synthetic values.

## Arctic source provenance and 2025 input transition

- The human supplied `data-raw/N_09_extent_v4.0.csv` and its download URL, the [NSIDC Northern Hemisphere monthly data directory](https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/data/). The exact URL is stored in dataset metadata and shown in the About the data panel. The processor cannot independently verify that the local file was downloaded from that directory.
- The [official Version 4 user guide](https://nsidc.org/sites/default/files/documents/user-guide/g02135-v004-userguide.pdf) states that monthly `source_dataset` changes from NSIDC-0051 through 2024 to AMSR2/NSIDC-0803 from 2025. It attributes this to expected loss of SSMIS access and observed degradation of SSMIS data; pre-2025 Version 4 values are copies of Version 3. The app preserves and explains this transition; users should consider it when interpreting the time series.
- The processor verifies 48 consecutive September/Northern Hemisphere rows for 1979-2026 and the expected source IDs, but cannot independently verify the human's original acquisition.

## Development dependency advisories

The full `npm audit` reports 7 moderate advisories in development dependencies (`typescript-eslint` and transitive ESLint tooling). `npm audit --omit=dev` reports 0 vulnerabilities. npm's proposed fix changes the TypeScript ESLint version across a major-version boundary, so it was not applied without compatibility testing.
