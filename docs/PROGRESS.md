# Progress

## Final summary

### What works

- Static Vite/TypeScript application with real NASA GISS global annual temperature (1880-2025) and NSIDC Arctic September extent (1979-2026) data, attribution, access dates, units, terms, and processing metadata.
- Vite production assets use `/earth-listens/`, and a GitHub Actions workflow builds and deploys `dist/` to Pages on pushes to `main`. Production preview verified the repository base path; the app has not been pushed or published.
- Deterministic sonification mapping with unit tests; lazy Tone.js playback, limiter, mute, keyboard controls, live announcements, and two-period stereo compare.
- The Earth song of your life validates the birth year against the selected scene, plays its actual observations continuously through the latest year, updates the selected-year visual, and throttles live progress to every five years plus start/end.
- Save my song records the post-limiter output through MediaRecorder and downloads only a non-empty completed recording. Chromium produced a 9,338-byte WebM/Opus file for 2024-2025; it played through to completion and decoded as 0.66 seconds of stereo audio at 48 kHz.
- Arctic scene uses the supplied 48-row NSIDC series, a computed 1981-2010 mean baseline of 6.413333 million square kilometers, and one-sided tension that rises as extent falls below that reference.
- The instrument has proportional Arctic polar visuals, annual warming stripes, a data-driven VU needle and year scrubber, moment buttons, drag-to-scrub, and a side-by-side stereo duel. Reduced-motion settings are respected.
- README, AI-use record, one-minute mapping notes, and an updated 90-second demo outline document the life-song and recording behavior.
- Final validation: `npm run build`, `npm test` (21 tests), and `npm run lint` passed. Production preview was inspected at 1440px and 390px with no horizontal overflow; browser checks confirmed the data-derived year range, live announcements at the start/five-year/final cadence, completed recording download, and playback through to completion.

### What does not work yet

- Amazon NDVI is not bundled or playable; task 2 remains unchecked because the NDVI pipeline/data is still missing.
- The supplied NSIDC download URL is the official Northern Hemisphere monthly data directory and is recorded verbatim in metadata and the About the data panel. The local file's download cannot be independently verified.
- The three-scene criterion remains unmet; see `docs/KNOWN_ISSUES.md`.
- The full npm audit reports 7 moderate development-tooling advisories; runtime-only audit is clean.
- No human has listened to and approved the sound, independently verified all source terms, or reviewed event-specific AI/submission rules. No project software license has been selected.
- Recording format and MediaRecorder availability vary by browser; only Chromium's WebM/Opus output was verified here.
- GitHub Pages is configured but not published: no push was made. Repository Pages settings must use GitHub Actions before the workflow can deploy.

### Decisions and assumptions

- Used vanilla TypeScript/Vite with no application framework or backend.
- Applied the written editorial/instrument visual brief; no reference screenshot was available in the shared workspace.
- Used GISTEMP's published 1951-1980 anomaly baseline (0 °C) and the NSIDC extent series' own 1981-2010 September mean (6.413333 million square kilometers) as its calm reference.
- Life-song examples are computed from the selected dataset's midpoint; only exact recorded whole years are accepted. The life song uses the existing mapping without interpolating or changing values.
- Disabled missing-data scenes instead of using estimates, repeated data, or sample values. Compare mode can compare Arctic years as well as temperature years.
- The NSIDC Version 4 user guide states that `source_dataset` changes from NSIDC-0051 through 2024 to AMSR2/NSIDC-0803 from 2025, due to expected SSMIS access loss and observed degradation; this is surfaced in metadata and documentation.

### Morning verification checklist

- [ ] Listen to both available scenes, the life song, and stereo comparison; check loudness, timbre, and whether the Arctic baseline/low-extent years sound as intended.
- [ ] Test Save my song in the target browsers, confirm the displayed file format and downloaded audio, and check interruption/mute behavior.
- [ ] Confirm the supplied NSIDC download directory, citation/terms, source transition, and attribution; verify current MODIS access and terms before adding NDVI.
- [ ] Check the NASA Space Apps event's AI-use and submission rules and choose/verify a project software license.
- [ ] On a fresh machine, run `npm ci`, `npm run build`, `npm test`, `npm run lint`, and `npm run preview`.
- [ ] Enable GitHub Pages with the GitHub Actions source and verify the site after a push to `main`.
- [ ] Review keyboard/screen-reader behavior and the demo timing with a human.

## Resume notes
- Current task: none; the Earth song feature is implemented and verified.
- Half-done: no engineering work remains for this feature. Amazon NDVI and human sound/data review remain follow-ups listed in the checklist.
- Exact next command: `npm run dev`
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
- UI refinement complete: strengthened the landing-page copy, Earth illustration, instrument-card depth, chart fill/labels, and play-state visualization. Playback state is now exposed with `aria-pressed`; animations honor reduced motion. No dependencies added.
- UI refinement validation: build, tests (10), and lint passed. Browser checks confirmed the production preview loads the data, the Play control enters its active state and pauses again, and the 390px mobile layout has no horizontal overflow.
- Arctic data and scene complete: added `scripts/process-sea-ice.mjs`, generated the bundle from the human-supplied local CSV without interpolating or rounding values, and validated 48 gap-free years with the expected September/Northern Hemisphere fields and NSIDC source IDs. Added dataset-driven baseline/tension mapping, scene selection, data attribution, description, and chart reference.
- Arctic provenance: NSIDC DOI resolves to the Version 4 product page, which links to the official user guide. The guide confirms million-square-kilometer extent units and explains the 2025 transition from NSIDC-0051 to AMSR2/NSIDC-0803. The exact file-level download page remains unspecified by the user; no direct URL was invented.
- Arctic mapping baseline: mean of the supplied 1981-2010 September extent values is 6.413333 million square kilometers. Values below it increase tension; values at or above it remain calm. At 390px, the entire “Arctic sea ice — September extent” picker label fits after reducing only its mobile type size.
- Added loader tests plus Arctic bounds/direction/baseline/2012-vs-1979 tests. Updated README, sonification notes, demo, AI-use record, and known issues. No dependencies added.
- Arctic validation: `npm run data:sea-ice`, build, 14 tests, lint, and static preview passed. Browser verification confirmed temperature/Arctic switching, the 2012 low-extent announcement, the 1979 calm announcement, and the complete scene name at 390px.
- NSIDC URL follow-up: recorded the supplied `https://noaadata.apps.nsidc.org/NOAA/G02135/north/monthly/data/` exactly in the generator and JSON metadata, added a visible source-data link in the About panel, and updated README, AI-use, known issues, and progress notes. The generator, build, 14 tests, and lint passed; browser checks confirmed the About-panel link text and target match the supplied URL. No values or dependencies changed.
- GitHub Pages deployment: set Vite's production base to `/earth-listens/` and added a `main`-push Actions workflow that installs dependencies, tests, lints, builds, and deploys `dist/`. Build output and production preview confirmed HTML, JS, CSS, and both dataset URLs return successfully under the repository path; Arctic scene switching loads its JSON. Build, all 14 tests, and lint pass.
- Instrument redesign: replaced the dashboard-like layout with a bold editorial instrument, temperature stripes derived from annual anomalies, and polar ice circles whose areas are proportional to the JSON extent values with the 1981-2010 mean ring. Added a tension needle, keyboard-accessible year scrubber, pointer scrubbing, data-derived moment buttons, and side-by-side left/right comparison. Simplified About the data and moved processing and the unbundled vegetation note into collapsed technical details. No dependencies added; the absent screenshot was not available, so followed the written direction.
- Instrument validation: `npm run build`, `npm test` (17; the original 14 still pass), and `npm run lint` passed. Production preview at `/earth-listens/` returned HTTP 200 for page, JS, CSS, and both datasets. Browser checks at 1440px and 390px verified the full scene label, data-derived Arctic record-low moment, comparison labels/visuals, visible exact NSIDC URL, and no console errors. No audio is started on load.
- Local commits: `628fde8 Deploy site to GitHub Pages`, `3b9a778 Redesign Earth Listens instrument`, and `e097f41 Move playback controls above the fold`. The worktree is clean; nothing was pushed.
- Follow-up from screenshot review: moved Play/tempo/compare above the main visual so playback is immediately available, shortened the intro, added year anchors beneath temperature stripes, and restyled moment links as tactile buttons. Build, all 17 tests, lint, and the `/earth-listens/` production page/data checks passed.
- Interface polish: gave the headline a confident hot-red block, made the temperature playhead a high-contrast vertical line with an edge-clamped year label, added distinct blue/red legend swatches, removed the duplicate source-page link, and completed the GISTEMP citation with the bundled access date. Kept the citation generator and bundled metadata in sync; no data values or dependencies changed.
- Interface polish validation: build, all 17 tests, lint, and diff checks passed. Production preview loaded under `/earth-listens/`; browser checks at 1440px and 390px verified first/last year labels stay within the visual, the full Arctic scene name fits, comparison has two visual panels, the About panel has one data link and a full citation, and neither viewport has horizontal overflow. No browser errors were observed.
- Arctic visual improvement: added deterministic year-seeded floe cracks and area-preserving frayed ice edges, a faint 1979 extent outline, the dashed 1981–2010 mean ring, and an extent-loss/gain readout computed against 1979. Each played note softly pulses the ice edge; reduced-motion mode uses a static highlight. Clarified the legend and that the texture is illustrative, tightened the desktop hero layout, and replaced the red UI highlight with teal. All 19 tests, lint, build, and production checks at 1440px/390px pass, including no overflow, computed 2012 loss of 3.48 million km², comparison layout, and reduced-motion styling. No data values or dependencies changed.
- Life song complete: added a dataset-bounded birth-year input and data-derived example, continuous playback from that exact observation through the selected scene's latest year, synchronized visuals, and start/five-year/final live announcements. Added post-limiter MediaRecorder support with browser-selected format, cleanup on stop/error, and non-empty completed-file downloads; incomplete recordings are discarded. Updated README, demo, sonification notes, AI-use record, and this progress summary. No dependencies or data values changed.
- Life song validation: build, lint, and 21 tests pass. Production preview at `/earth-listens/` was checked at 1440px and 390px without horizontal overflow. Browser checks verified scene-specific year bounds, 2020-to-latest playback with announcements at start and completion, and a 9,338-byte WebM/Opus download that decoded and played to completion. The test file and screenshots were removed; no browser console errors or warnings were observed.
