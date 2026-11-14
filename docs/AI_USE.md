# How we used AI

This version was built with an AI assistant using Copilot SDK in VS Code.

## Assistance used

- The assistant scaffolded the Vite/TypeScript project and implemented the data loader, tested mapping functions, Tone.js audio engine, accessible controls, comparison mode, and responsive styling.
- It verified source information through official NASA GISS, NASA Earthdata, NASA ESDIS, and NSIDC pages and documentation. It created a repeatable GISTEMP download/processing script and an NSIDC CSV processor with checks for the supplied September extent series.
- A human supplied `data-raw/N_09_extent_v4.0.csv`. The assistant did not download or generate its observations; it validated the 48 annual rows, selected the `extent` column without interpolation or rounding, and wrote the JSON bundle. The exact file-level page used for the manual download was not provided, so metadata records the verified NSIDC product page and official data access root, not an asserted direct-file URL.
- The NSIDC Version 4 units and 2025 input-product transition were checked against the official Version 4 user guide. The Arctic baseline is computed from the supplied data's 1981-2010 September values.
- It wrote draft documentation and ran the build, unit tests, lint, and browser interaction checks.
- No AI-generated or synthetic observations were used; source values remain unchanged.

## Human review still required

The human supplied the project goal and acceptance criteria. No human code review, listening test, sound-quality review, independent dataset validation, fresh-machine test, or final event-rule review has been completed in this run. Those checks remain required before a submission.

## Data limits

NASA GISS GISTEMP global annual temperature and NSIDC Sea Ice Index Version 4 Arctic September extent are bundled. Amazon regional NDVI remains unavailable because MODIS/Terra MOD13C2 data links required Earthdata authentication and suitable extraction. The exact download page for the human-supplied NSIDC CSV was not provided. Source links, limits, and terms are documented in the README and `docs/KNOWN_ISSUES.md`.

The team should confirm the exact current NASA dataset terms and attribution, plus the NASA Space Apps event's AI-use and submission rules, before publishing or submitting this project.
