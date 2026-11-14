# Context: Earth Listens

## Event
NASA Space Apps Challenge 2026, theme "The Next Frontier". Challenge: "The Earth Information Jukebox" (turn NASA Earth data and imagery into sound). The build window is about 48 hours, and this overnight run produces the first complete version. A human will review it in the morning.

## One-line pitch
An instrument for the planet: pick a place, drag through time, and hear decades of NASA Earth data as music. It also lets blind and low-vision people explore climate data without charts.

## Users
1. A curious person who wants to feel climate change, not read a chart.
2. A blind or low-vision learner who needs non-visual access to Earth data.
3. Teachers and science communicators who need a 60-second demo.

## Scenes (build 3, with a shared engine)
1. Arctic sea ice: yearly September extent, 1979 to latest available (NSIDC Sea Ice Index, a NASA-supported data center).
2. Global temperature: yearly anomaly, 1880 to latest available (NASA GISS GISTEMP).
3. Vegetation greenness: monthly NDVI for one region (for example the Amazon) from NASA Earth Observatory / MODIS.
Confirm exact sources and licenses from official pages before using them. Pre-process the data to small JSON files in public/data/ with a metadata block (source, url, accessed date, units, processing).

## Sound design (deterministic, documented, tested)
- Each scene maps its value to normalized 0..1 using documented min/max from the data.
- Pitch: value moves pitch along a musical scale (pentatonic for calm, drifting toward a chromatic cluster as the anomaly grows).
- Tension: distance from the historical baseline controls dissonance (an interval detune or added minor second) and filter brightness.
- Rhythm: rate of change per year controls note density.
- Texture: a soft noise layer scales with variability.
- Baseline years sound consonant and calm. Extreme years sound tense.
- Write the mapping in docs/SONIFICATION.md in plain language so a judge can read it in one minute.

## Features
- Scene picker, time slider (keyboard arrows step one year), play/pause, speed control.
- Play mode: auto-advance through time while sound plays.
- Compare mode: two time periods or two scenes side by side, with left/right stereo separation.
- Visual layer: simple animated chart or color pulse synchronized with the sound. Visuals support the audio and are not required to understand it.
- Screen-reader support: live region announces year, value, and a plain description ("Year 2012: ice extent far below average, sound is tense").
- "About the data" panel: source, link, limits.
- "How we used AI" link to docs/AI_USE.md content in the About panel.

## Non-goals
No chatbot, no backend, no accounts, no real-time satellite processing.

## Acceptance criteria
1. Three scenes play with real data and show source attribution in the UI.
2. Mapping functions have unit tests (monotonic, bounds, baseline-consonant).
3. Full keyboard operation and screen-reader announcements work.
4. Compare mode works with stereo separation.
5. No sound before a user click or key press; a mute control is always visible.
6. Build, test, and lint pass; static build runs from `npm run preview`.
7. README has: what it is, how to run, data sources, mapping summary, limitations, and an honest "AI assistance" section.
8. A scripted 90-second demo outline is in docs/DEMO.md (opens with silence, then the Arctic scene).