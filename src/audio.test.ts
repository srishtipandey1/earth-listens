import { beforeEach, describe, expect, it, vi } from 'vitest';

const toneMocks = vi.hoisted(() => {
  const panValues: number[] = [];
  const makeParam = () => ({
    rampTo: vi.fn(),
    cancelScheduledValues: vi.fn(),
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  });

  class Gain {
    gain = makeParam();
    connect(): this { return this; }
    dispose(): this { return this; }
  }

  class Limiter {
    connect(): this { return this; }
    toDestination(): this { return this; }
    dispose(): this { return this; }
  }

  class Filter {
    frequency = makeParam();
    connect(): this { return this; }
    dispose(): this { return this; }
  }

  class Panner {
    pan = { rampTo: vi.fn((value: number) => panValues.push(value)) };
    connect(): this { return this; }
    dispose(): this { return this; }
  }

  class Synth {
    detune = makeParam();
    triggerAttackRelease = vi.fn();
    triggerRelease = vi.fn();
    connect(): this { return this; }
    dispose(): this { return this; }
  }

  class Noise {
    connect(): this { return this; }
    start(): this { return this; }
    stop(): this { return this; }
    dispose(): this { return this; }
  }

  return {
    start: vi.fn(async () => {}),
    now: vi.fn(() => 1),
    Frequency: vi.fn((midi: number) => ({ toFrequency: () => midi })),
    Gain,
    Limiter,
    Filter,
    Panner,
    Synth,
    Noise,
    panValues,
  };
});

vi.mock('tone', () => toneMocks);

import * as Tone from 'tone';
import { AudioEngine } from './audio';
import type { SonificationMapping } from './sonification';

const silentMapping: SonificationMapping = {
  normalized: 0.5,
  midi: 60,
  tension: 0,
  detuneCents: 0,
  filterBrightness: 0,
  rateOfChange: 0,
  noteDensity: 1,
  noiseGain: 0,
};

describe('AudioEngine gesture gate', () => {
  beforeEach(() => {
    vi.mocked(Tone.start).mockClear();
    toneMocks.panValues.length = 0;
  });

  it('does not start Tone or play before an explicit user gesture', () => {
    const engine = new AudioEngine();

    engine.setMuted(true);

    expect(Tone.start).not.toHaveBeenCalled();
    expect(() => engine.play(silentMapping)).toThrow('Call start() from a user gesture first');
    expect(() => engine.createRecordingStream()).toThrow('Call start() from a user gesture first');
    expect(Tone.start).not.toHaveBeenCalled();
  });

  it('routes compared periods to opposite stereo positions', async () => {
    const engine = new AudioEngine();
    await engine.start();

    engine.play(silentMapping, { channel: 'left-period', pan: -0.78 });
    engine.play(silentMapping, { channel: 'right-period', pan: 0.78 });

    expect(toneMocks.panValues).toEqual([-0.78, 0.78]);
    engine.dispose();
  });
});
