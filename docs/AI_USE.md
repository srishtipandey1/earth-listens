# How we used AI

This version was built with an AI assistant using Copilot SDK in VS Code.

## Assistance used

- The assistant scaffolded the Vite/TypeScript project and implemented the data loader, tested mapping functions, Tone.js audio engine, accessible controls, comparison mode, and responsive styling.
- It verified source information through official NASA GISS, NASA Earthdata, NASA ESDIS, and NSIDC pages and documentation. It created a repeatable GISTEMP download/processing script and an NSIDC CSV processor with checks for the supplied September extent series.
- A human supplied `data-raw/N_09_extent_v4.0.csv` and its download URL, `https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/data/`. The assistant did not download or generate its observations; it validated the 48 annual rows, selected the `extent` column without interpolation or rounding, and wrote the JSON bundle with that exact URL in its metadata and the About the data panel.
- The NSIDC Version 4 units and 2025 input-product transition were checked against the official Version 4 user guide. The Arctic baseline is computed from the supplied data's 1981-2010 September values.
- The assistant added the birth-year Earth song, using the active dataset's exact observations through its latest year, plus throttled live progress announcements. It added MediaRecorder download support through the existing post-limiter audio graph; the interface reports the browser-selected format and incomplete recordings are discarded.
- It wrote draft documentation and ran the build, unit tests, lint, and browser interaction checks.
- No AI-generated or synthetic observations were used; source values remain unchanged.

## Verification of the life-song recording

The production preview was tested in a Chromium browser. Saving a 2024-2025 temperature segment produced a 9,338-byte `audio/webm;codecs=opus` file. The browser decoded it as 0.66 seconds of stereo audio at 48 kHz, and an audio element played it through to completion. This verifies this browser's short recording; it is not a human listening or sound-quality review, and it does not certify recording support or format in other browsers.

## Human review still required

The human supplied the project goal and acceptance criteria. No human code review, listening test, sound-quality review, independent dataset validation, fresh-machine test, or final event-rule review has been completed in this run. Those checks remain required before a submission.

## Data limits

NASA GISS GISTEMP global annual temperature and NSIDC Sea Ice Index Version 4 Arctic September extent are bundled. A planned monthly vegetation series remains excluded because its source data requires authentication and no verified regional processing file is included. Source links, limits, and terms are documented in the README and `docs/KNOWN_ISSUES.md`.

The team should confirm the exact current NASA dataset terms and attribution, plus the NASA Space Apps event's AI-use and submission rules, before publishing or submitting this project.
