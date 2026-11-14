import { describe, expect, it } from 'vitest';
import { iceCapEdgePath, iceCapRadius, iceFloeCrackPaths, temperatureStripeColor } from './visuals';

function polygonArea(path: string): number {
  const coordinates = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  let twiceArea = 0;
  for (let index = 0; index < coordinates.length; index += 2) {
    const next = (index + 2) % coordinates.length;
    twiceArea += coordinates[index] * coordinates[next + 1] - coordinates[next] * coordinates[index + 1];
  }
  return Math.abs(twiceArea) / 2;
}

function radialSpread(path: string, center = 180): number {
  const coordinates = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const radii = Array.from({ length: coordinates.length / 2 }, (_, index) => {
    const x = coordinates[index * 2] - center;
    const y = coordinates[index * 2 + 1] - center;
    return Math.hypot(x, y);
  });
  return Math.max(...radii) - Math.min(...radii);
}

describe('data-driven scene visuals', () => {
  it('scales ice-cap area in direct proportion to extent', () => {
    const lower = iceCapRadius(3.57, 7.67, 150);
    const higher = iceCapRadius(7.14, 7.67, 150);

    expect((higher * higher) / (lower * lower)).toBeCloseTo(2, 8);
  });

  it('creates stable, year-seeded floe texture and edge fraying', () => {
    const cracks = iceFloeCrackPaths(2012, 148);
    const edge = iceCapEdgePath(2012, 96, 0.8);

    expect(iceFloeCrackPaths(2012, 148)).toEqual(cracks);
    expect(iceCapEdgePath(2012, 96, 0.8)).toBe(edge);
    expect(iceFloeCrackPaths(2013, 148)).not.toEqual(cracks);
    expect(iceCapEdgePath(2012, 96, 0)).not.toBe(edge);
    expect(radialSpread(edge)).toBeGreaterThan(radialSpread(iceCapEdgePath(2012, 96, 0)));
  });

  it('keeps the frayed ice silhouette area proportional to its extent', () => {
    const smooth = polygonArea(iceCapEdgePath(2012, 96, 0));
    const frayed = polygonArea(iceCapEdgePath(2012, 96, 1));

    expect(frayed / smooth).toBeCloseTo(1, 4);
  });

  it('colors temperature stripes on opposite sides of zero with different hues', () => {
    expect(temperatureStripeColor(-0.48, -0.48, 1.28)).not.toBe(temperatureStripeColor(1.28, -0.48, 1.28));
    expect(temperatureStripeColor(-0.48, -0.48, 1.28)).not.toBe(temperatureStripeColor(0, -0.48, 1.28));
  });

  it('rejects invalid extent and temperature ranges', () => {
    expect(() => iceCapRadius(8, 7, 150)).toThrow('within a positive scale');
    expect(() => temperatureStripeColor(0, 1, 1)).toThrow('max is greater than min');
  });
});
