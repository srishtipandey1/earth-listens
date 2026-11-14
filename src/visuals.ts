const COLD = [39, 82, 150] as const;
const NEUTRAL = [246, 245, 237] as const;
const HOT = [186, 36, 27] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function interpolateColor(start: readonly number[], end: readonly number[], amount: number): string {
  const channels = start.map((channel, index) => Math.round(channel + (end[index] - channel) * amount));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

export function temperatureStripeColor(value: number, min: number, max: number): string {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    throw new Error('Temperature color requires a finite value and a range where max is greater than min.');
  }

  const zeroPosition = clamp((0 - min) / (max - min), 0, 1);
  const position = clamp((value - min) / (max - min), 0, 1);

  if (position <= zeroPosition) {
    return interpolateColor(COLD, NEUTRAL, zeroPosition === 0 ? 1 : position / zeroPosition);
  }

  return interpolateColor(NEUTRAL, HOT, zeroPosition === 1 ? 0 : (position - zeroPosition) / (1 - zeroPosition));
}

export function iceCapRadius(extent: number, maximumExtent: number, globeRadius: number): number {
  if (!Number.isFinite(extent) || !Number.isFinite(maximumExtent) || !Number.isFinite(globeRadius)
    || extent < 0 || maximumExtent <= 0 || globeRadius <= 0 || extent > maximumExtent) {
    throw new Error('Ice-cap radius requires a non-negative extent within a positive scale and radius.');
  }

  return globeRadius * Math.sqrt(extent / maximumExtent);
}

export function iceCapEdgePath(year: number, radius: number, fray: number, center = 180): string {
  if (!Number.isInteger(year) || !Number.isFinite(radius) || radius <= 0
    || !Number.isFinite(fray) || fray < 0 || fray > 1 || !Number.isFinite(center)) {
    throw new Error('Ice-cap edge requires an integer year, positive radius, and fray between 0 and 1.');
  }

  const random = seededRandom(year ^ 0x9e3779b9);
  const phaseOne = random() * Math.PI * 2;
  const phaseTwo = random() * Math.PI * 2;
  const count = 64;
  const roughness = fray * 0.06;
  const radialFactors = Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const noise = random() * 2 - 1;
    const wave = 0.55 * Math.sin(angle * 5 + phaseOne)
      + 0.3 * Math.sin(angle * 11 + phaseTwo)
      + 0.15 * noise;
    return 1 + roughness * wave;
  });
  const adjacentFactorSum = radialFactors.reduce(
    (sum, factor, index) => sum + factor * radialFactors[(index + 1) % count],
    0,
  );
  const areaCorrection = Math.sqrt(count / adjacentFactorSum);
  const points = radialFactors.map((factor, index) => {
    const angle = (index / count) * Math.PI * 2;
    const adjustedRadius = radius * factor * areaCorrection;
    return [
      center + Math.cos(angle) * adjustedRadius,
      center + Math.sin(angle) * adjustedRadius,
    ];
  });

  return `M${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`;
}

export function iceFloeCrackPaths(year: number, radius: number): string[] {
  if (!Number.isInteger(year) || !Number.isFinite(radius) || radius <= 0) {
    throw new Error('Ice-floe texture requires an integer year and a positive radius.');
  }

  const random = seededRandom(year ^ 0x51ed270b);
  const paths: string[] = [];
  const steps = 12;

  for (const vertical of [true, false]) {
    for (let line = 1; line <= 5; line += 1) {
      const base = ((line / 6) * 2 - 1) * radius * 0.9;
      const points = Array.from({ length: steps }, (_, step) => {
        const along = ((step / (steps - 1)) * 2 - 1) * radius * 1.1;
        const jitter = (random() * 2 - 1) * radius * 0.055;
        return vertical ? [base + jitter, along] : [along, base + jitter];
      });
      paths.push(`M${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}`);
    }
  }

  return paths;
}
