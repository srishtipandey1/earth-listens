import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('tone', () => ({ start: vi.fn() }));

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
  });

  it('does not start Tone or play before an explicit user gesture', () => {
    const engine = new AudioEngine();

    engine.setMuted(true);

    expect(Tone.start).not.toHaveBeenCalled();
    expect(() => engine.play(silentMapping)).toThrow('Call start() from a user gesture first');
    expect(Tone.start).not.toHaveBeenCalled();
  });
});
