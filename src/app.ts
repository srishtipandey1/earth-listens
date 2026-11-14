import aiUse from '../docs/AI_USE.md?raw';
import sonificationNotes from '../docs/SONIFICATION.md?raw';
import { AudioEngine } from './audio';
import { loadDataset, type Dataset } from './data';
import { createMappingOptions, mapSeriesPoint } from './sonification';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Application root element is missing.');
}

app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <a class="wordmark" href="#" aria-label="Earth Listens home">EARTH <span>LISTENS</span></a>
      <span class="topbar-note"><span class="topbar-spark" aria-hidden="true"></span> NASA EARTH DATA, MADE AUDIBLE</span>
      <button id="mute-button" class="button button-quiet" type="button" aria-pressed="false" aria-label="Mute audio">Mute</button>
    </header>

    <section class="hero" aria-labelledby="page-title">
      <div class="hero-copy">
        <p class="eyebrow hero-eyebrow">AN INSTRUMENT FOR THE PLANET</p>
        <h1 id="page-title">Earth,<br><em>in another key.</em></h1>
        <p class="hero-description">A planet-sized playlist, made from NASA data. Pick a year, press play, and listen for the world changing its tune.</p>
        <p class="hero-footnote"><span aria-hidden="true">✦</span> No autoplay. You set the tempo.</p>
      </div>
      <div class="orbit-art" aria-hidden="true">
        <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
        <div class="orbit orbit-three"></div>
        <div class="planet"><span class="planet-shine"></span></div>
        <span class="satellite"></span>
        <span class="orbit-label">1951—1980<br>REFERENCE</span>
        <span class="orbit-coordinate">EARTH / 001</span>
      </div>
    </section>

    <section class="instrument" aria-label="Earth data sound instrument">
      <div class="instrument-heading">
        <div>
          <p class="eyebrow">01 / CHOOSE A SCENE</p>
          <label class="sr-only" for="scene-select">Earth data scene</label>
          <select id="scene-select" class="scene-select">
            <option value="global-temperature">Global temperature anomaly</option>
            <option value="arctic" disabled>Arctic sea ice — data unavailable</option>
            <option value="vegetation" disabled>Amazon vegetation — data unavailable</option>
          </select>
        </div>
        <div class="scene-tag"><span class="live-dot"></span> HISTORICAL RECORD</div>
      </div>

      <div id="data-error" class="error-banner" role="alert" hidden></div>
      <div class="chart-wrap">
        <div class="chart-labels" aria-hidden="true"><span>ANNUAL ANOMALY</span><span>REFERENCE 0°C</span></div>
        <svg id="data-chart" class="data-chart" viewBox="0 0 1000 260" preserveAspectRatio="none" aria-hidden="true"></svg>
        <div class="chart-years" aria-hidden="true"><span id="chart-start">—</span><span id="chart-end">—</span></div>
      </div>

      <div class="time-controls">
        <div class="year-readout">
          <span class="eyebrow">YEAR</span>
          <output id="year-output" for="year-slider">—</output>
        </div>
        <div class="slider-stack">
          <label class="sr-only" for="year-slider">Select year</label>
          <input id="year-slider" type="range" min="0" max="0" step="1" value="0" disabled />
          <div class="slider-years" aria-hidden="true"><span id="range-start">—</span><span id="range-end">—</span></div>
        </div>
        <div class="value-readout">
          <output id="value-output">—</output>
          <span id="value-units">loading source data</span>
        </div>
      </div>

      <div id="compare-controls" class="compare-controls" hidden>
        <div class="compare-label">
          <label for="compare-slider">Compare with <output id="compare-year-output">—</output></label>
          <span>LEFT / RIGHT STEREO</span>
        </div>
        <input id="compare-slider" type="range" min="0" max="0" step="1" value="0" disabled />
      </div>

      <div class="transport">
        <div class="transport-main">
          <button id="play-button" class="button button-play" type="button" aria-label="Play from the selected year" aria-pressed="false" disabled>
            <span class="play-icon" aria-hidden="true"><i></i><i></i><i></i></span><span id="play-label">Play</span>
          </button>
          <label class="speed-control">SPEED
            <select id="speed-select" aria-label="Playback speed">
              <option value="1000">Slow</option>
              <option value="650" selected>Normal</option>
              <option value="350">Fast</option>
            </select>
          </label>
          <label class="compare-toggle"><input id="compare-toggle" type="checkbox" disabled /> <span>Compare periods</span></label>
        </div>
        <p id="live-status" class="live-status" role="status" aria-live="polite" aria-atomic="true">Loading verified NASA data…</p>
      </div>

      <div class="scene-summary">
        <p id="scene-description" class="scene-description">Waiting for the data series.</p>
        <p class="keyboard-hint">← / → step through years <span aria-hidden="true">·</span> Space play / pause <span aria-hidden="true">·</span> M mute</p>
      </div>
    </section>

    <section class="lower-grid" aria-label="About this experience">
      <details class="data-panel" open>
        <summary>About the data <span aria-hidden="true">+</span></summary>
        <div class="data-details">
          <p id="data-source">NASA GISS / GISTEMP</p>
          <a id="source-link" href="https://data.giss.nasa.gov/gistemp/" target="_blank" rel="noopener noreferrer">Open the source dataset</a>
          <p id="data-terms"></p>
          <p id="data-citation" class="citation"></p>
          <p class="availability-note"><strong>Other scenes:</strong> Arctic sea ice and monthly Amazon NDVI are not bundled because their official data could not be downloaded and verified in this environment.</p>
        </div>
      </details>
      <div class="mapping-note">
        <p class="eyebrow">THE SCORE</p>
        <p>Pitch follows the anomaly. Distance from the baseline adds tension. Faster change adds rhythm and a fine-grained noise layer.</p>
        <button id="mapping-link" class="text-link" type="button">Read the one-minute mapping notes <span aria-hidden="true">↗</span></button>
        <button id="ai-link" class="text-link" type="button">How we used AI <span aria-hidden="true">↗</span></button>
      </div>
    </section>

    <footer class="footer">
      <span>EARTH LISTENS / NASA SPACE APPS CHALLENGE 2026</span>
      <span>DATA FIRST. NO SOUND UNTIL YOU PRESS PLAY.</span>
    </footer>

    <dialog id="ai-dialog" class="ai-dialog" aria-labelledby="ai-title">
      <div class="dialog-header">
        <h2 id="ai-title">How we used AI</h2>
        <button id="ai-close" class="button button-quiet" type="button">Close</button>
      </div>
      <pre id="ai-content"></pre>
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

const yearSlider = requiredElement<HTMLInputElement>('#year-slider');
const instrument = requiredElement<HTMLElement>('.instrument');
const compareSlider = requiredElement<HTMLInputElement>('#compare-slider');
const compareToggle = requiredElement<HTMLInputElement>('#compare-toggle');
const compareControls = requiredElement<HTMLDivElement>('#compare-controls');
const playButton = requiredElement<HTMLButtonElement>('#play-button');
const playLabel = requiredElement<HTMLSpanElement>('#play-label');
const speedSelect = requiredElement<HTMLSelectElement>('#speed-select');
const muteButton = requiredElement<HTMLButtonElement>('#mute-button');
const liveStatus = requiredElement<HTMLParagraphElement>('#live-status');
const errorBanner = requiredElement<HTMLDivElement>('#data-error');
const yearOutput = requiredElement<HTMLOutputElement>('#year-output');
const compareYearOutput = requiredElement<HTMLOutputElement>('#compare-year-output');
const valueOutput = requiredElement<HTMLOutputElement>('#value-output');
const valueUnits = requiredElement<HTMLSpanElement>('#value-units');
const sceneDescription = requiredElement<HTMLParagraphElement>('#scene-description');
const chart = requiredElement<SVGSVGElement>('#data-chart');
const chartStart = requiredElement<HTMLSpanElement>('#chart-start');
const chartEnd = requiredElement<HTMLSpanElement>('#chart-end');
const rangeStart = requiredElement<HTMLSpanElement>('#range-start');
const rangeEnd = requiredElement<HTMLSpanElement>('#range-end');
const dataSource = requiredElement<HTMLParagraphElement>('#data-source');
const sourceLink = requiredElement<HTMLAnchorElement>('#source-link');
const dataTerms = requiredElement<HTMLParagraphElement>('#data-terms');
const dataCitation = requiredElement<HTMLParagraphElement>('#data-citation');
const aiDialog = requiredElement<HTMLDialogElement>('#ai-dialog');
const aiTitle = requiredElement<HTMLHeadingElement>('#ai-title');
const aiLink = requiredElement<HTMLButtonElement>('#ai-link');
const mappingLink = requiredElement<HTMLButtonElement>('#mapping-link');
const aiClose = requiredElement<HTMLButtonElement>('#ai-close');
const aiContent = requiredElement<HTMLPreElement>('#ai-content');

const audio = new AudioEngine();
let dataset: Dataset | null = null;
let mappingOptions: ReturnType<typeof createMappingOptions> | null = null;
let currentIndex = 0;
let compareIndex = 0;
let playing = false;
let timer: number | undefined;
let muted = false;

function formatValue(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}°`;
}

function getDescription(index: number): string {
  if (!dataset || !mappingOptions) {
    return 'Waiting for the data series.';
  }
  const point = dataset.values[index];
  const mapping = mapSeriesPoint(dataset.values, index, mappingOptions);
  const direction = point.value > 0 ? 'above' : point.value < 0 ? 'below' : 'at';
  const mood = mapping.tension > 0.65 ? 'tense' : mapping.tension > 0.3 ? 'restless' : 'calm';
  return `Year ${point.year}: global temperature anomaly ${Math.abs(point.value).toFixed(2)} degrees Celsius ${direction} the 1951–1980 mean; sound is ${mood}.`;
}

function updateChart(): void {
  const data = dataset;
  if (!data) {
    return;
  }
  const points = data.values;
  const range = data.metadata.max - data.metadata.min;
  const path = points.map((point, index) => {
    const x = (index / (points.length - 1)) * 1000;
    const y = 235 - ((point.value - data.metadata.min) / range) * 205;
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const currentPoint = points[currentIndex];
  const currentX = (currentIndex / (points.length - 1)) * 1000;
  const currentY = 235 - ((currentPoint.value - data.metadata.min) / range) * 205;
  const comparePoint = points[compareIndex];
  const compareX = (compareIndex / (points.length - 1)) * 1000;
  const compareY = 235 - ((comparePoint.value - data.metadata.min) / range) * 205;
  const compareMarker = compareToggle.checked
    ? `<circle class="chart-marker chart-marker-compare" cx="${compareX.toFixed(1)}" cy="${compareY.toFixed(1)}" r="7"></circle>`
    : '';

  chart.innerHTML = `
    <defs>
      <linearGradient id="chart-area-fill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#efad50" stop-opacity=".4"></stop>
        <stop offset="100%" stop-color="#68a98a" stop-opacity=".02"></stop>
      </linearGradient>
    </defs>
    <line class="chart-baseline" x1="0" y1="${(235 - ((0 - data.metadata.min) / range) * 205).toFixed(1)}" x2="1000" y2="${(235 - ((0 - data.metadata.min) / range) * 205).toFixed(1)}"></line>
    <path class="chart-area" d="${path} L1000,235 L0,235 Z"></path>
    <path class="chart-line" d="${path}"></path>
    ${compareMarker}
    <circle class="chart-marker chart-marker-current" cx="${currentX.toFixed(1)}" cy="${currentY.toFixed(1)}" r="8"></circle>
  `;
}

function updateReadout(announce: boolean): void {
  if (!dataset || !mappingOptions) {
    return;
  }
  const point = dataset.values[currentIndex];
  yearOutput.value = String(point.year);
  yearSlider.value = String(currentIndex);
  valueOutput.value = formatValue(point.value);
  sceneDescription.textContent = getDescription(currentIndex);
  if (compareToggle.checked) {
    compareYearOutput.value = String(dataset.values[compareIndex].year);
    compareSlider.value = String(compareIndex);
  }
  updateChart();
  if (announce) {
    liveStatus.textContent = sceneDescription.textContent;
  }
}

function updateDataPanel(data: Dataset): void {
  dataSource.textContent = data.metadata.source;
  sourceLink.href = data.metadata.url;
  sourceLink.textContent = `${data.metadata.title} (source page)`;
  dataTerms.textContent = `${data.metadata.units}. ${data.metadata.license} Accessed ${data.metadata.accessed}.`;
  dataCitation.textContent = data.metadata.citation;
  valueUnits.textContent = data.metadata.units;
}

function updatePlaybackControl(active: boolean): void {
  instrument.classList.toggle('is-playing', active);
  playButton.setAttribute('aria-pressed', String(active));
  playButton.setAttribute('aria-label', active ? 'Pause playback' : 'Play from the selected year');
  playLabel.textContent = active ? 'Pause' : 'Play';
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
    audio.play(mapSeriesPoint(dataset.values, currentIndex, mappingOptions), { channel: 'main', pan: compareToggle.checked ? -0.78 : 0 });
    if (compareToggle.checked) {
      audio.play(mapSeriesPoint(dataset.values, compareIndex, mappingOptions), { channel: 'comparison', pan: 0.78 });
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

function initializeDataset(data: Dataset): void {
  dataset = data;
  mappingOptions = createMappingOptions(data, 0);
  currentIndex = 0;
  compareIndex = Math.max(0, data.values.findIndex(({ year }) => year === 2000));
  yearSlider.min = '0';
  yearSlider.max = String(data.values.length - 1);
  yearSlider.value = '0';
  yearSlider.disabled = false;
  compareSlider.min = '0';
  compareSlider.max = String(data.values.length - 1);
  compareSlider.value = String(compareIndex);
  compareSlider.disabled = false;
  compareToggle.disabled = false;
  playButton.disabled = false;
  chartStart.textContent = String(data.values[0].year);
  chartEnd.textContent = String(data.values[data.values.length - 1].year);
  rangeStart.textContent = chartStart.textContent;
  rangeEnd.textContent = chartEnd.textContent;
  updateDataPanel(data);
  updateReadout(false);
  liveStatus.textContent = `${data.metadata.title} loaded, ${data.values.length} annual observations.`;
}

yearSlider.addEventListener('input', setCurrentYearFromSlider);
compareSlider.addEventListener('input', setCompareYearFromSlider);
playButton.addEventListener('click', togglePlayback);
speedSelect.addEventListener('change', () => {
  if (playing) {
    schedulePlayback();
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
aiLink.addEventListener('click', () => {
  aiTitle.textContent = 'How we used AI';
  aiContent.textContent = aiUse;
  aiDialog.showModal();
});
mappingLink.addEventListener('click', () => {
  aiTitle.textContent = 'How the data becomes sound';
  aiContent.textContent = sonificationNotes;
  aiDialog.showModal();
});
aiClose.addEventListener('click', () => aiDialog.close());
aiDialog.addEventListener('click', (event) => {
  if (event.target === aiDialog) {
    aiDialog.close();
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

void loadDataset(`${import.meta.env.BASE_URL}data/global-temperature.json`)
  .then(initializeDataset)
  .catch((error: unknown) => {
    errorBanner.hidden = false;
    errorBanner.textContent = error instanceof Error ? `NASA data could not be loaded: ${error.message}` : 'NASA data could not be loaded.';
    liveStatus.textContent = errorBanner.textContent;
    playButton.disabled = true;
  });
