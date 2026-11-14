# Progress

## Final summary

### What works

- Static Vite/TypeScript application with one real, bundled NASA GISS global annual temperature series (1880-2025), attribution, access date, units, use guidance, and processing metadata.
- Deterministic sonification mapping with unit tests; lazy Tone.js playback, limiter, mute, keyboard controls, status announcements, responsive chart, and two-period stereo compare.
- README, AI-use record, one-minute mapping notes, and an honest 90-second demo outline.
- Final validation: `npm run build`, `npm test` (10 tests), `npm run lint`, runtime `npm audit --omit=dev` (0 vulnerabilities), and `npm run preview` passed. Browser checks loaded the static dataset, found no console errors/warnings, confirmed no horizontal overflow at desktop/mobile sizes, and confirmed Tone was not loaded before a gesture.

### What does not work yet

- Arctic sea-ice and Amazon NDVI scenes are not bundled or playable. Task 2 remains unchecked: only the GISTEMP retrieval/processing script was written. The NSIDC pages timed out and MODIS raw data requires Earthdata authorization and HDF processing.
- The three-scene criterion and Arctic-first portion of the demo criterion are unmet; see `docs/KNOWN_ISSUES.md`.
- The full npm audit reports 7 moderate development-tooling advisories; runtime-only audit is clean.
- No human has listened to and approved the sound, independently verified all source terms, or reviewed event-specific AI/submission rules. No project software license has been selected.

### Decisions and assumptions

- Used vanilla TypeScript/Vite with no application framework or backend.
- Used GISTEMP's published 1951-1980 anomaly baseline (0 °C) and the bundled series' observed min/max and max annual change for mapping.
- Disabled missing-data scenes instead of using estimates, repeated data, or sample values. Compare mode therefore compares two years from the one real series.
- NASA source pages were the authority for data descriptions and general use guidance; where a source was inaccessible, no license or values were inferred.

### Morning verification checklist

- [ ] Listen to the available scene and stereo comparison; check loudness, timbre, and whether baseline/extreme years sound as intended.
- [ ] Confirm NASA GISS citation/terms and attribution; verify current NSIDC and MODIS access, dataset licenses/terms, and attribution before enabling the other scenes.
- [ ] Check the NASA Space Apps event's AI-use and submission rules and choose/verify a project software license.
- [ ] On a fresh machine, run `npm ci`, `npm run build`, `npm test`, `npm run lint`, and `npm run preview`.
- [ ] Review keyboard/screen-reader behavior and the demo timing with a human.

## Resume notes
- Current task: 10 of 10 — complete.
- Half-done: no further implementation is in progress; the missing scene data and human sign-offs are the known follow-ups above.
- Exact next command for morning verification: `npm ci; npm run build; npm test; npm run lint; npm run preview`
- Failing test: none.

## Task log
- Starting point: the repository had no application files, no git commits, and no configured git author identity.
- Instructions read in order: `agents.md`, `.github/copilot-instructions.md`, `docs/CONTEXT.md`, `docs/TASKS.md`.
- Decision: use a small vanilla TypeScript/Vite app, with no framework or backend.
- Data sources, license details, attribution, and processing cannot be assumed; they will be recorded only after checking primary source pages.
- Task 1 complete: added Vite, strict TypeScript, Tone.js, Vitest, ESLint, and the required npm scripts. Vite is a development dependency; Tone.js is the runtime audio dependency. No other packages were added.
- Task 1 validation: `npm run build`, `npm test`, and `npm run lint` passed. There are not yet any tests (Vitest is configured to pass until task 3 adds mapping tests). `npm audit --omit=dev` reported no runtime dependency advisories; the full audit reported 7 moderate advisories in development dependencies.
- Task 2 partially complete: verified the NASA GISS GISTEMP v4 CSV page and data link, downloaded the annual global series, and wrote `public/data/global-temperature.json` with source, data URL, access date, units, use terms, citation, and processing steps. The Node script uses the system curl executable because Node's direct HTTPS request is blocked in this environment. Acquisition/processing scripts for the blocked Arctic and NDVI sources are not yet written, so task 2 remains unchecked.
- Task 2 sources not acquired: the NSIDC host timed out from both web and command-line access, so no Arctic values or source license terms were verified or included. NASA's MOD13C2.061 monthly product metadata is verified and NASA ESDIS use/citation guidance is documented, but its CMR data link is protected and redirects to Earthdata login; no Earthdata credentials or HDF processor are available here. These are recorded in `docs/KNOWN_ISSUES.md`; no substitute or synthetic values were created.
- Dependency changes: no task 2 dependencies added. A generated TypeScript build-info file from task 1 is now ignored and will be removed from version control.
- Task 3 complete: added runtime dataset validation/loading, bounded normalization, pentatonic pitch mapping, baseline tension, change-driven rhythm/texture, and `docs/SONIFICATION.md`.
- Task 3 validation: `npm run build`, `npm test` (8 tests), and `npm run lint` passed.
- Task 4 complete: added a lazy Tone.js engine with two synth voices, tension filter/dissonance, gated pink-noise texture, compare-ready per-channel panning, mute gain, and a master limiter. Tone's audio context and nodes are created only after `start()` is called by the UI; `play()` before that rejects with a clear error.
- Task 4 validation: `npm run build`, `npm test` (9 tests, including the gesture gate), and `npm run lint` passed. A type mismatch from Tone's frequency wrapper was fixed by passing converted Hz values.
- Task 5 complete for the available dataset: added the scene picker with unavailable scenes disabled and labeled, year slider, play/pause, playback speed, synchronized chart, data citation panel, and in-app AI/mapping notes. The UI shows unavailable source details rather than substituting data.
- Task 5 validation: build, tests (9), lint passed. Browser verification confirmed the bundled 1880-2025 series renders, compare controls appear, playback starts only after clicking Play, and the initial page has no browser warnings/errors. Tone was changed to a dynamic import after the Play gesture to prevent an AudioContext from being created on page load.
- Task 6 complete: verified accessible names/roles in the browser accessibility snapshot, native slider ArrowRight stepping and live announcements, Space play/pause and M mute shortcuts, visible focus indication, and `prefers-reduced-motion` CSS behavior. No axe or extra browser dependency was added; the live Playwright browser checks covered the interaction paths.
- Task 6 validation: build, tests (9), lint passed. Browser checks showed `aria-live="polite"`, reduced-motion transition duration of 0.00001s, visible focus outline, and no console warnings/errors after a fresh load.
- Task 7 complete: compare mode selects two years and schedules their mappings on separate Tone channels at -0.78 (left) and +0.78 (right); it does not pretend the blocked scenes are available.
- Task 7 validation: added a focused audio-engine test for opposing pan values. Build, tests (10), and lint passed; browser playback with compare enabled produced no console errors or warnings.
- Task 8 complete: responsive layout, disabled/unavailable scene state, loading status, HTTP/schema error banner, and empty-data validation are in place. Corrected a 390px mobile horizontal overflow caused by the scene select's intrinsic width.
- Task 8 validation: build, tests (10), and lint passed. Static `npm run preview` loaded the actual dataset and embedded docs; desktop and 390px layouts had no horizontal overflow, and preview console had no errors or warnings.
- Task 9 complete: wrote a README with setup, data sourcing/terms, mapping and limitations; replaced AI-use placeholders with an accurate work/verification record; and added a timed 90-second demo that starts in silence and explicitly discloses the unavailable Arctic scene before demonstrating global temperature.
- Task 9 validation: build, tests (10), and lint passed. The README and demo do not claim the missing scenes are implemented. The exact Arctic-first demo acceptance remains blocked and is recorded in known issues.
