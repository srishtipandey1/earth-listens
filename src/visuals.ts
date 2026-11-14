const COLD = [39, 82, 150] as const;
const NEUTRAL = [246, 245, 237] as const;
const HOT = [186, 36, 27] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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
