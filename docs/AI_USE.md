# How we used AI

This version was built with an AI assistant using Copilot SDK in VS Code.

## Assistance used

- The assistant scaffolded the Vite/TypeScript project and implemented the data loader, tested mapping functions, Tone.js audio engine, accessible controls, comparison mode, and responsive styling.
- It verified NASA source information through official NASA GISS, NASA Earthdata, and NASA ESDIS pages that were reachable during this run. It created a repeatable GISTEMP download/processing script and bundled that real source dataset.
- It wrote draft documentation and ran the build, unit tests, lint, and browser interaction checks.
- No AI-generated or synthetic observations were used.

## Human review still required

The human supplied the project goal and acceptance criteria. No human code review, listening test, sound-quality review, independent dataset validation, fresh-machine test, or final event-rule review has been completed in this run. Those checks remain required before a submission.

## Data limits

Only the NASA GISS GISTEMP global annual temperature series is bundled. The NSIDC pages timed out and MODIS/Terra MOD13C2 data links required Earthdata authentication, so Arctic sea-ice and regional NDVI data were not downloaded or represented. Source links, access limits, and terms are documented in the README and `docs/KNOWN_ISSUES.md`.

The team should confirm the exact current NASA dataset terms and attribution, plus the NASA Space Apps event's AI-use and submission rules, before publishing or submitting this project.
