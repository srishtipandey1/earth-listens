# Progress

## Resume notes
- Current task: 7 of 10 — validate compare mode with stereo separation.
- Half-done: compare controls and audio channels are implemented; verify a comparison session and document its scope.
- Next command: exercise compare mode with two selected years, confirm the left/right panners are used, then run all checks.
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
