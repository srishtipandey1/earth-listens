import aiUse from '../docs/AI_USE.md?raw';
import sonificationNotes from '../docs/SONIFICATION.md?raw';
import { AudioEngine } from './audio';
import { loadDataset, type Dataset } from './data';
import { averageForPeriod, createMappingOptions, mapSeriesPoint } from './sonification';
import { iceCapRadius, temperatureStripeColor } from './visuals';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Application root element is missing.');
}

app.innerHTML = `
  <main class="page">
    <header class="topbar">
      <a class="wordmark" href="#" aria-label="Earth Listens home">EARTH <span>/</span> LISTENS</a>
      <p class="topbar-note">An instrument for the changing planet</p>
      <button id="mute-button" class="button button-outline" type="button" aria-pressed="false" aria-label="Mute audio">Mute</button>
    </header>

    <section class="opening" aria-labelledby="page-title">
      <div>
        <p class="eyebrow">THE EARTH INFORMATION JUKEBOX</p>
        <h1 id="page-title">Listen to the<br><em>shape of change.</em></h1>
      </div>
      <div class="opening-note">
        <p>Real Earth records, played one year at a time. Choose a scene, set the year, and hear what the numbers are doing.</p>
        <p class="quiet-note">The instrument stays silent until you choose to play.</p>
      </div>
    </section>

    <section id="instrument" class="instrument" aria-label="Earth data listening instrument">
      <div class="instrument-top">
        <div class="scene-control">
          <label for="scene-select" class="eyebrow">LISTEN TO</label>
          <select id="scene-select" class="scene-select">
            <option value="global-temperature">Global temperature anomaly</option>
            <option value="arctic-sea-ice">Arctic sea ice — September extent</option>
          </select>
        </div>
        <p id="scene-record" class="scene-record">LOADING OBSERVATIONS</p>
      </div>

      <div class="visual-heading">
        <p id="visual-title">The record at a glance</p>
        <p id="visual-legend" class="visual-legend"></p>
      </div>
      <div id="data-visual" class="data-visual" aria-hidden="true"></div>
      <p class="visual-hint">Drag across the visual to scrub through time. Use the year control below for keyboard access.</p>

      <div class="year-console">
        <div class="year-readout">
          <span class="eyebrow">SELECTED YEAR</span>
          <output id="year-output" for="year-slider">—</output>
        </div>
        <div class="scrubber">
          <label class="sr-only" for="year-slider">Select year</label>
          <input id="year-slider" type="range" min="0" max="0" step="1" value="0" disabled />
          <div class="scrubber-labels" aria-hidden="true"><span id="range-start">—</span><span id="range-end">—</span></div>
        </div>
        <div class="value-readout">
          <output id="value-output">—</output>
          <span id="value-units">loading source data</span>
        </div>
        <div class="meter" aria-hidden="true">
          <svg viewBox="0 0 160 92">
            <path class="meter-arc" d="M 20 78 A 60 60 0 0 1 140 78"></path>
            <line id="vu-needle" class="meter-needle" x1="80" y1="78" x2="80" y2="23"></line>
            <circle class="meter-pivot" cx="80" cy="78" r="5"></circle>
          </svg>
          <div class="meter-labels"><span>CALM</span><span>TENSE</span></div>
        </div>
      </div>

      <div id="moment-controls" class="moment-controls" aria-label="Listen to a notable year"></div>

      <div class="transport">
        <div class="transport-main">
          <button id="play-button" class="button button-play" type="button" aria-label="Play from the selected year" aria-pressed="false" disabled>
            <span class="play-icon" aria-hidden="true"></span><span id="play-label">Play</span>
          </button>
          <label class="speed-control">Tempo
            <select id="speed-select" aria-label="Playback speed">
              <option value="1000">Slow</option>
              <option value="650" selected>Steady</option>
              <option value="350">Quick</option>
            </select>
          </label>
          <label class="compare-toggle"><input id="compare-toggle" type="checkbox" disabled /> <span>Compare two years</span></label>
        </div>
        <p id="live-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true">Loading verified NASA data…</p>
      </div>

      <div id="compare-controls" class="compare-controls" hidden>
        <div class="compare-heading">
          <div>
            <span class="ear-label">LEFT EAR</span>
            <span class="duel-mark" aria-hidden="true">↔</span>
            <span class="ear-label">RIGHT EAR</span>
          </div>
          <label for="compare-slider">Right year <output id="compare-year-output">—</output></label>
        </div>
        <input id="compare-slider" type="range" min="0" max="0" step="1" value="0" disabled />
      </div>

      <div class="instrument-foot">
        <p id="scene-description" class="scene-description">Waiting for the data series.</p>
        <p class="keyboard-hint">Arrow keys step · Space plays or pauses · M mutes</p>
      </div>
      <div id="data-error" class="error-banner" role="alert" hidden></div>
    </section>

    <section class="lower-grid" aria-label="About this experience">
      <section class="about-panel" aria-labelledby="about-title">
        <h2 id="about-title">About the data</h2>
        <p id="data-about" class="data-about"></p>
        <h3 id="data-name" class="data-name"></h3>
        <p id="data-citation" class="citation"></p>
        <div class="source-links">
          <a id="source-link" href="" target="_blank" rel="noopener noreferrer">Open the source page</a>
          <a id="source-data-link" href="" target="_blank" rel="noopener noreferrer">Open the source data</a>
        </div>
        <details class="technical-details">
          <summary>Technical details</summary>
          <div class="technical-copy">
            <p id="data-terms"></p>
            <ul id="data-processing"></ul>
            <p id="availability-note"></p>
          </div>
        </details>
      </section>

      <section class="score-panel" aria-labelledby="score-title">
        <p class="eyebrow">HOW IT SOUNDS</p>
        <h2 id="score-title">A score written by the data.</h2>
        <p>Pitch follows the value. A shift from its reference adds tension; a larger year-to-year change adds rhythm and texture.</p>
        <button id="mapping-link" class="text-link" type="button">Read the one-minute mapping notes <span aria-hidden="true">↗</span></button>
        <button id="ai-link" class="text-link" type="button">How we used AI <span aria-hidden="true">↗</span></button>
      </section>
    </section>

    <footer class="footer">
      <span>EARTH LISTENS / NASA SPACE APPS CHALLENGE 2026</span>
      <span>REAL RECORDS. NO AUTOPLAY.</span>
    </footer>

    <dialog id="info-dialog" class="info-dialog" aria-labelledby="dialog-title">
      <div class="dialog-header">
        <h2 id="dialog-title">How we used AI</h2>
        <button id="dialog-close" class="button button-outline" type="button">Close</button>
      </div>
      <pre id="dialog-content"></pre>
    </dialog>
  </main>
`;

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Required interface element is missing: ${selector}`);
  }
  return element;
}

const instrument = requiredElement<HTMLElement>('#instrument');
const sceneSelect = requiredElement<HTMLSelectElement>('#scene-select');
const sceneRecord = requiredElement<HTMLParagraphElement>('#scene-record');
const visualTitle = requiredElement<HTMLParagraphElement>('#visual-title');
const visualLegend = requiredElement<HTMLParagraphElement>('#visual-legend');
const dataVisual = requiredElement<HTMLDivElement>('#data-visual');
const yearSlider = requiredElement<HTMLInputElement>('#year-slider');
const compareSlider = requiredElement<HTMLInputElement>('#compare-slider');
const compareToggle = requiredElement<HTMLInputElement>('#compare-toggle');
const compareControls = requiredElement<HTMLDivElement>('#compare-controls');
const playButton = requiredElement<HTMLButtonElement>('#play-button');
const playLabel = requiredElement<HTMLSpanElement>('#play-label');
const speedSelect = requiredElement<HTMLSelectElement>('#speed-select');
const muteButton = requiredElement<HTMLButtonElement>('#mute-button');
const momentControls = requiredElement<HTMLDivElement>('#moment-controls');
const liveStatus = requiredElement<HTMLParagraphElement>('#live-status');
const errorBanner = requiredElement<HTMLDivElement>('#data-error');
const yearOutput = requiredElement<HTMLOutputElement>('#year-output');
const compareYearOutput = requiredElement<HTMLOutputElement>('#compare-year-output');
const valueOutput = requiredElement<HTMLOutputElement>('#value-output');
const valueUnits = requiredElement<HTMLSpanElement>('#value-units');
const sceneDescription = requiredElement<HTMLParagraphElement>('#scene-description');
const rangeStart = requiredElement<HTMLSpanElement>('#range-start');
const rangeEnd = requiredElement<HTMLSpanElement>('#range-end');
const vuNeedle = requiredElement<SVGLineElement>('#vu-needle');
const dataAbout = requiredElement<HTMLParagraphElement>('#data-about');
const dataName = requiredElement<HTMLHeadingElement>('#data-name');
const dataCitation = requiredElement<HTMLParagraphElement>('#data-citation');
const sourceLink = requiredElement<HTMLAnchorElement>('#source-link');
const sourceDataLink = requiredElement<HTMLAnchorElement>('#source-data-link');
const dataTerms = requiredElement<HTMLParagraphElement>('#data-terms');
const dataProcessing = requiredElement<HTMLUListElement>('#data-processing');
const availabilityNote = requiredElement<HTMLParagraphElement>('#availability-note');
const infoDialog = requiredElement<HTMLDialogElement>('#info-dialog');
const dialogTitle = requiredElement<HTMLHeadingElement>('#dialog-title');
const dialogClose = requiredElement<HTMLButtonElement>('#dialog-close');
const dialogContent = requiredElement<HTMLPreElement>('#dialog-content');
const aiLink = requiredElement<HTMLButtonElement>('#ai-link');
const mappingLink = requiredElement<HTMLButtonElement>('#mapping-link');

const audio = new AudioEngine();
const datasetPaths: Record<string, string> = {
  'global-temperature': 'data/global-temperature.json',
  'arctic-sea-ice': 'data/arctic-sea-ice.json',
};
const datasetCache = new Map<string, Dataset>();
let dataset: Dataset | null = null;
let mappingOptions: ReturnType<typeof createMappingOptions> | null = null;
let currentIndex = 0;
let compareIndex = 0;
let playing = false;
let muted = false;
let timer: number | undefined;
let pointerScrubbing = false;
let pointerSide = 'primary';
let pointerBoundsElement: HTMLElement | null = null;

function formatValue(value: number): string {
  if (dataset?.metadata.id === 'arctic-sea-ice') {
    return value.toFixed(2);
  }
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}°`;
}

function describePoint(index: number): string {
  if (!dataset || !mappingOptions) {
    return 'Waiting for the data series.';
  }

  const point = dataset.values[index];
  const mapping = mapSeriesPoint(dataset.values, index, mappingOptions);
  const mood = mapping.tension > 0.65 ? 'tense' : mapping.tension > 0.3 ? 'restless' : 'calm';

  if (dataset.metadata.id === 'arctic-sea-ice') {
    const direction = point.value > mappingOptions.baseline ? 'above' : point.value < mappingOptions.baseline ? 'below' : 'at';
    return `Year ${point.year}: September Northern Hemisphere sea-ice extent ${point.value.toFixed(2)} million square kilometers, ${direction} the 1981–2010 mean; sound is ${mood}.`;
  }

  const direction = point.value > 0 ? 'above' : point.value < 0 ? 'below' : 'at';
  return `Year ${point.year}: global temperature anomaly ${Math.abs(point.value).toFixed(2)} degrees Celsius ${direction} the 1951–1980 mean; sound is ${mood}.`;
}

function renderTemperaturePanel(index: number, side: string, label: string): string {
  if (!dataset) {
    return '';
  }

  const values = dataset.values;
  const { min, max } = dataset.metadata;
  const stripeWidth = 1000 / values.length;
  const stripes = values.map((point, position) => {
    const x = position * stripeWidth;
    const color = temperatureStripeColor(point.value, min, max);
    return `<rect x="${x.toFixed(2)}" y="0" width="${(stripeWidth + 0.2).toFixed(2)}" height="180" fill="${color}"></rect>`;
  }).join('');
  const markerX = (index + 0.5) * stripeWidth;
  const point = values[index];
  const value = formatValue(point.value);

  return `
    <section class="visual-side" data-scrub-side="${side}">
      <div class="visual-side-label"><span>${label}</span><strong>${point.year} · ${value}</strong></div>
      <svg class="temperature-stripes" viewBox="0 0 1000 180" preserveAspectRatio="none">
        ${stripes}
        <line class="stripe-playhead" x1="${markerX.toFixed(2)}" y1="0" x2="${markerX.toFixed(2)}" y2="180"></line>
        <circle class="stripe-marker" cx="${markerX.toFixed(2)}" cy="162" r="8"></circle>
      </svg>
    </section>
  `;
}

function renderIcePanel(index: number, side: string, label: string): string {
  if (!dataset || !mappingOptions) {
    return '';
  }

  const point = dataset.values[index];
  const iceRadius = iceCapRadius(point.value, dataset.metadata.max, 148);
  const baselineRadius = iceCapRadius(mappingOptions.baseline, dataset.metadata.max, 148);
  const clipId = `polar-clip-${side}`;

  return `
    <section class="visual-side ice-side" data-scrub-side="${side}">
      <div class="visual-side-label"><span>${label}</span><strong>${point.year} · ${formatValue(point.value)} M km²</strong></div>
      <svg class="polar-visual" viewBox="0 0 360 360" focusable="false">
        <defs><clipPath id="${clipId}"><circle cx="180" cy="180" r="150"></circle></clipPath></defs>
        <circle class="polar-ocean" cx="180" cy="180" r="158"></circle>
        <g clip-path="url(#${clipId})">
          <circle class="latitude-line" cx="180" cy="180" r="110"></circle>
          <circle class="latitude-line" cx="180" cy="180" r="70"></circle>
          <circle class="latitude-line" cx="180" cy="180" r="34"></circle>
          <path class="longitude-line" d="M30 180H330 M180 30V330 M74 74L286 286 M286 74L74 286"></path>
          <circle class="ice-cap" cx="180" cy="180" r="${iceRadius.toFixed(2)}"></circle>
          <circle class="ice-reference" cx="180" cy="180" r="${baselineRadius.toFixed(2)}"></circle>
        </g>
        <circle class="polar-edge" cx="180" cy="180" r="150"></circle>
        <text class="polar-label" x="180" y="22" text-anchor="middle">90°N</text>
      </svg>
    </section>
  `;
}

function updateVisual(): void {
  if (!dataset) {
    return;
  }

  const isArctic = dataset.metadata.id === 'arctic-sea-ice';
  const renderPanel = isArctic ? renderIcePanel : renderTemperaturePanel;
  const leftLabel = compareToggle.checked ? 'LEFT EAR' : 'SELECTED YEAR';
  const panels = compareToggle.checked
    ? `${renderPanel(currentIndex, 'primary', leftLabel)}${renderPanel(compareIndex, 'comparison', 'RIGHT EAR')}`
    : renderPanel(currentIndex, 'primary', leftLabel);

  dataVisual.classList.toggle('visual-duel', compareToggle.checked);
  dataVisual.innerHTML = panels;
  dataVisual.setAttribute('aria-hidden', 'true');
}

function updateReadout(announce: boolean): void {
  if (!dataset || !mappingOptions) {
    return;
  }

  const point = dataset.values[currentIndex];
  const mapping = mapSeriesPoint(dataset.values, currentIndex, mappingOptions);
  const mainDescription = describePoint(currentIndex);
  yearOutput.value = String(point.year);
  yearSlider.value = String(currentIndex);
  valueOutput.value = formatValue(point.value);
  sceneDescription.textContent = compareToggle.checked
    ? `Left ear. ${mainDescription} Right ear. ${describePoint(compareIndex)}`
    : mainDescription;
  vuNeedle.setAttribute('transform', `rotate(${-60 + mapping.tension * 120} 80 78)`);

  if (compareToggle.checked) {
    compareYearOutput.value = String(dataset.values[compareIndex].year);
    compareSlider.value = String(compareIndex);
  }

  updateVisual();
  if (announce) {
    liveStatus.textContent = sceneDescription.textContent;
  }
}

function updateDataPanel(data: Dataset): void {
  const isArctic = data.metadata.id === 'arctic-sea-ice';
  dataAbout.textContent = isArctic
    ? 'Each mark is one real September observation of Northern Hemisphere sea ice. The polar circle scales by area to show extent; its fine ring marks this record’s 1981–2010 mean.'
    : 'Each stripe is one real annual global temperature anomaly. Cooler and warmer colors show values below and above NASA’s 1951–1980 reference.';
  dataName.textContent = data.metadata.title;
  dataCitation.textContent = data.metadata.citation;
  sourceLink.href = data.metadata.url;
  sourceLink.textContent = 'Open the dataset page';
  sourceDataLink.href = data.metadata.dataUrl;
  sourceDataLink.textContent = data.metadata.dataUrl;
  sourceDataLink.setAttribute('aria-label', `Open source data for ${data.metadata.title}`);
  dataTerms.textContent = `${data.metadata.units}. ${data.metadata.license} Accessed ${data.metadata.accessed}.`;
  dataProcessing.replaceChildren(...data.metadata.processing.map((step) => {
    const item = document.createElement('li');
    item.textContent = step;
    return item;
  }));
  availabilityNote.textContent = 'Amazon regional NDVI is not bundled because its source data and processing could not be verified for this build.';
  valueUnits.textContent = data.metadata.units;
}

function updateMomentButtons(data: Dataset): void {
  const firstIndex = 0;
  const latestIndex = data.values.length - 1;
  const isArctic = data.metadata.id === 'arctic-sea-ice';
  const extremeIndex = data.values.reduce((bestIndex, point, index) => {
    const bestValue = data.values[bestIndex].value;
    return isArctic ? point.value < bestValue ? index : bestIndex : point.value > bestValue ? index : bestIndex;
  }, 0);
  const moments = [
    { index: firstIndex, label: `Hear ${data.values[firstIndex].year}` },
    {
      index: extremeIndex,
      label: isArctic
        ? `Hear the record low (${data.values[extremeIndex].year})`
        : `Hear the warmest (${data.values[extremeIndex].year})`,
    },
    { index: latestIndex, label: `Hear latest (${data.values[latestIndex].year})` },
  ].filter((moment, index, all) => all.findIndex((other) => other.index === moment.index) === index);

  momentControls.replaceChildren(...moments.map(({ index, label }) => {
    const button = document.createElement('button');
    button.className = 'moment-button';
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => {
      void hearMoment(index);
    });
    return button;
  }));
}

function updatePlaybackControl(active: boolean): void {
  instrument.classList.toggle('is-playing', active);
  playButton.setAttribute('aria-pressed', String(active));
  playButton.setAttribute('aria-label', active ? 'Pause playback' : 'Play from the selected year');
  playLabel.textContent = active ? 'Pause' : 'Play';
  updateVisual();
}

function stopPlayback(): void {
  playing = false;
  if (timer !== undefined) {
    window.clearInterval(timer);
    timer = undefined;
  }
  audio.stop();
  updatePlaybackControl(false);
}

function playCurrent(): void {
  if (!dataset || !mappingOptions) {
    return;
  }

  try {
    audio.play(mapSeriesPoint(dataset.values, currentIndex, mappingOptions), {
      channel: 'main',
      pan: compareToggle.checked ? -0.78 : 0,
    });
    if (compareToggle.checked) {
      audio.play(mapSeriesPoint(dataset.values, compareIndex, mappingOptions), {
        channel: 'comparison',
        pan: 0.78,
      });
    }
  } catch (error) {
    stopPlayback();
    errorBanner.hidden = false;
    errorBanner.textContent = error instanceof Error ? error.message : 'Audio playback failed.';
    liveStatus.textContent = errorBanner.textContent;
  }
}

function advance(): void {
  if (!dataset || currentIndex >= dataset.values.length - 1) {
    stopPlayback();
    liveStatus.textContent = 'Reached the latest available year.';
    return;
  }

  currentIndex += 1;
  updateReadout(true);
  playCurrent();
}

function schedulePlayback(): void {
  if (timer !== undefined) {
    window.clearInterval(timer);
  }

  const milliseconds = Number(speedSelect.value);
  instrument.style.setProperty('--beat-duration', `${milliseconds}ms`);
  timer = window.setInterval(advance, milliseconds);
}

async function startPlayback(): Promise<void> {
  if (!dataset) {
    return;
  }

  playButton.disabled = true;
  errorBanner.hidden = true;
  try {
    await audio.start();
    playing = true;
    updatePlaybackControl(true);
    updateReadout(true);
    schedulePlayback();
    playCurrent();
  } catch (error) {
    errorBanner.hidden = false;
    errorBanner.textContent = error instanceof Error ? `Audio could not start: ${error.message}` : 'Audio could not start.';
    liveStatus.textContent = errorBanner.textContent;
  } finally {
    playButton.disabled = false;
  }
}

async function hearMoment(index: number): Promise<void> {
  if (!dataset || !mappingOptions) {
    return;
  }

  currentIndex = index;
  updateReadout(true);
  errorBanner.hidden = true;
  if (playing) {
    playCurrent();
    return;
  }

  try {
    await audio.start();
    playCurrent();
    instrument.classList.add('note-hit');
    window.setTimeout(() => instrument.classList.remove('note-hit'), 320);
  } catch (error) {
    errorBanner.hidden = false;
    errorBanner.textContent = error instanceof Error ? `Audio could not start: ${error.message}` : 'Audio could not start.';
    liveStatus.textContent = errorBanner.textContent;
  }
}

function togglePlayback(): void {
  if (playing) {
    stopPlayback();
    liveStatus.textContent = 'Playback paused.';
  } else {
    void startPlayback();
  }
}

function setCurrentYearFromSlider(): void {
  if (!dataset) {
    return;
  }
  currentIndex = Number(yearSlider.value);
  updateReadout(true);
  if (playing) {
    playCurrent();
  }
}

function setCompareYearFromSlider(): void {
  if (!dataset) {
    return;
  }
  compareIndex = Number(compareSlider.value);
  updateReadout(true);
  if (playing && compareToggle.checked) {
    playCurrent();
  }
}

function setIndexFromPointer(event: PointerEvent): void {
  if (!dataset) {
    return;
  }

  const bounds = (pointerBoundsElement ?? dataVisual).getBoundingClientRect();
  if (bounds.width === 0) {
    return;
  }
  const position = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
  const index = Math.round(position * (dataset.values.length - 1));
  if (pointerSide === 'comparison' && compareToggle.checked) {
    compareIndex = index;
  } else {
    currentIndex = index;
  }
  updateReadout(true);
  if (playing) {
    playCurrent();
  }
}

function initializeDataset(data: Dataset): void {
  dataset = data;
  const isArctic = data.metadata.id === 'arctic-sea-ice';
  const baseline = isArctic ? averageForPeriod(data.values, 1981, 2010) : 0;
  mappingOptions = createMappingOptions(data, baseline, isArctic ? 'lower-is-tense' : 'baseline-distance');
  sceneSelect.value = data.metadata.id;
  currentIndex = 0;
  compareIndex = Math.max(0, data.values.findIndex(({ year }) => year === 2000));
  yearSlider.min = '0';
  yearSlider.max = String(data.values.length - 1);
  compareSlider.min = '0';
  compareSlider.max = String(data.values.length - 1);
  compareSlider.value = String(compareIndex);
  yearSlider.disabled = false;
  compareSlider.disabled = false;
  compareToggle.disabled = false;
  playButton.disabled = false;
  rangeStart.textContent = String(data.values[0].year);
  rangeEnd.textContent = String(data.values[data.values.length - 1].year);
  sceneRecord.textContent = `${data.values.length} YEARLY OBSERVATIONS · ${data.values[0].year}–${data.values[data.values.length - 1].year}`;
  visualTitle.textContent = isArctic ? 'September ice extent' : 'A stripe for every year';
  visualLegend.textContent = isArctic
    ? `Broken ring · 1981–2010 mean ${baseline.toFixed(2)} M km²`
    : 'Blue · below reference     Red · above reference';
  updateDataPanel(data);
  updateMomentButtons(data);
  updateReadout(false);
  liveStatus.textContent = `${data.metadata.title} loaded, ${data.values.length} annual observations.`;
}

async function loadScene(sceneId: string): Promise<Dataset> {
  const cachedDataset = datasetCache.get(sceneId);
  if (cachedDataset) {
    return cachedDataset;
  }

  const dataPath = datasetPaths[sceneId];
  if (!dataPath) {
    throw new Error(`No dataset is configured for scene "${sceneId}".`);
  }

  const loadedDataset = await loadDataset(`${import.meta.env.BASE_URL}${dataPath}`);
  if (loadedDataset.metadata.id !== sceneId) {
    throw new Error(`Requested scene "${sceneId}" but loaded "${loadedDataset.metadata.id}".`);
  }
  datasetCache.set(sceneId, loadedDataset);
  return loadedDataset;
}

sceneSelect.addEventListener('change', () => {
  const sceneId = sceneSelect.value;
  stopPlayback();
  sceneSelect.disabled = true;
  yearSlider.disabled = true;
  compareSlider.disabled = true;
  compareToggle.disabled = true;
  playButton.disabled = true;
  errorBanner.hidden = true;
  liveStatus.textContent = `Loading ${sceneSelect.selectedOptions[0].textContent}…`;
  void loadScene(sceneId)
    .then(initializeDataset)
    .catch((error: unknown) => {
      errorBanner.hidden = false;
      errorBanner.textContent = error instanceof Error ? `Scene data could not be loaded: ${error.message}` : 'Scene data could not be loaded.';
      liveStatus.textContent = errorBanner.textContent;
      sceneSelect.value = dataset?.metadata.id ?? 'global-temperature';
    })
    .finally(() => {
      sceneSelect.disabled = false;
      const dataReady = dataset !== null;
      yearSlider.disabled = !dataReady;
      compareSlider.disabled = !dataReady;
      compareToggle.disabled = !dataReady;
      playButton.disabled = !dataReady;
    });
});

yearSlider.addEventListener('input', setCurrentYearFromSlider);
compareSlider.addEventListener('input', setCompareYearFromSlider);
playButton.addEventListener('click', togglePlayback);
speedSelect.addEventListener('change', () => {
  if (playing) {
    schedulePlayback();
  } else {
    instrument.style.setProperty('--beat-duration', `${Number(speedSelect.value)}ms`);
  }
});
compareToggle.addEventListener('change', () => {
  compareControls.hidden = !compareToggle.checked;
  updateReadout(true);
  if (playing) {
    playCurrent();
  }
});
muteButton.addEventListener('click', () => {
  muted = !muted;
  audio.setMuted(muted);
  muteButton.setAttribute('aria-pressed', String(muted));
  muteButton.setAttribute('aria-label', muted ? 'Unmute audio' : 'Mute audio');
  muteButton.textContent = muted ? 'Unmute' : 'Mute';
  liveStatus.textContent = muted ? 'Audio muted.' : 'Audio unmuted.';
});
dataVisual.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || !dataset) {
    return;
  }
  pointerScrubbing = true;
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const side = target?.closest<HTMLElement>('[data-scrub-side]') ?? null;
  pointerBoundsElement = side ?? dataVisual;
  pointerSide = side?.dataset.scrubSide ?? 'primary';
  dataVisual.setPointerCapture(event.pointerId);
  setIndexFromPointer(event);
});
dataVisual.addEventListener('pointermove', (event) => {
  if (pointerScrubbing) {
    setIndexFromPointer(event);
  }
});
dataVisual.addEventListener('pointerup', () => {
  pointerScrubbing = false;
  pointerBoundsElement = null;
});
dataVisual.addEventListener('pointercancel', () => {
  pointerScrubbing = false;
  pointerBoundsElement = null;
});

aiLink.addEventListener('click', () => {
  dialogTitle.textContent = 'How we used AI';
  dialogContent.textContent = aiUse;
  infoDialog.showModal();
});
mappingLink.addEventListener('click', () => {
  dialogTitle.textContent = 'How the data becomes sound';
  dialogContent.textContent = sonificationNotes;
  infoDialog.showModal();
});
dialogClose.addEventListener('click', () => infoDialog.close());
infoDialog.addEventListener('click', (event) => {
  if (event.target === infoDialog) {
    infoDialog.close();
  }
});
window.addEventListener('keydown', (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && (target.isContentEditable || target.matches('input, select, textarea, button, summary'))) {
    return;
  }
  if (event.code === 'Space') {
    event.preventDefault();
    togglePlayback();
  } else if (event.key.toLowerCase() === 'm') {
    muted = !muted;
    audio.setMuted(muted);
    muteButton.setAttribute('aria-pressed', String(muted));
    muteButton.setAttribute('aria-label', muted ? 'Unmute audio' : 'Mute audio');
    muteButton.textContent = muted ? 'Unmute' : 'Mute';
    liveStatus.textContent = muted ? 'Audio muted.' : 'Audio unmuted.';
  }
});
window.addEventListener('beforeunload', () => {
  stopPlayback();
  audio.dispose();
});

instrument.style.setProperty('--beat-duration', `${Number(speedSelect.value)}ms`);
void loadScene('global-temperature')
  .then(initializeDataset)
  .catch((error: unknown) => {
    errorBanner.hidden = false;
    errorBanner.textContent = error instanceof Error ? `NASA data could not be loaded: ${error.message}` : 'NASA data could not be loaded.';
    liveStatus.textContent = errorBanner.textContent;
    playButton.disabled = true;
  });
