import type * as ToneTypes from 'tone';
import type { SonificationMapping } from './sonification';

interface VoiceChannel {
  filter: ToneTypes.Filter;
  lead: ToneTypes.Synth;
  tensionVoice: ToneTypes.Synth;
  noise: ToneTypes.Noise;
  noiseGain: ToneTypes.Gain;
  panner: ToneTypes.Panner;
}

interface AudioGraph {
  tone: typeof import('tone');
  limiter: ToneTypes.Limiter;
  masterGain: ToneTypes.Gain;
  channels: Map<string, VoiceChannel>;
}

export interface PlayOptions {
  channel?: string;
  pan?: number;
  duration?: number;
}

const MASTER_GAIN = 0.7;

function clampPan(pan: number): number {
  if (!Number.isFinite(pan)) {
    throw new Error('Stereo pan must be a finite number.');
  }

  return Math.min(1, Math.max(-1, pan));
}

export class AudioEngine {
  private graph: AudioGraph | null = null;
  private initialization: Promise<void> | null = null;
  private muted = false;

  async start(): Promise<void> {
    if (!this.initialization) {
      this.initialization = this.initialize();
    }

    try {
      await this.initialization;
    } catch (error) {
      this.initialization = null;
      throw error;
    }
  }

  private async initialize(): Promise<void> {
    const Tone = await import('tone');
    await Tone.start();

    const masterGain = new Tone.Gain(this.muted ? 0 : MASTER_GAIN);
    const limiter = new Tone.Limiter(-1);
    masterGain.connect(limiter);
    limiter.toDestination();
    this.graph = { tone: Tone, masterGain, limiter, channels: new Map() };
  }

  play(mapping: SonificationMapping, options: PlayOptions = {}): void {
    const graph = this.requireGraph();
    const Tone = graph.tone;
    const channelName = options.channel ?? 'main';
    const duration = options.duration ?? 0.22;

    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error('Note duration must be a positive finite number.');
    }

    const channel = this.getChannel(graph, channelName, clampPan(options.pan ?? 0));
    const now = graph.tone.now();
    const frequency = Tone.Frequency(mapping.midi, 'midi').toFrequency();

    channel.panner.pan.rampTo(clampPan(options.pan ?? 0), 0.04, now);
    channel.filter.frequency.rampTo(700 + mapping.filterBrightness * 4300, 0.05, now);
    channel.lead.triggerAttackRelease(frequency, duration, now, 0.28);
    channel.lead.detune.rampTo(mapping.detuneCents, 0.05, now);

    if (mapping.tension >= 0.65) {
      channel.tensionVoice.triggerAttackRelease(
        Tone.Frequency(mapping.midi + 1, 'midi').toFrequency(),
        duration * 0.8,
        now,
        mapping.tension * 0.16,
      );
    }

    channel.noiseGain.gain.cancelScheduledValues(now);
    channel.noiseGain.gain.setValueAtTime(0, now);
    channel.noiseGain.gain.linearRampToValueAtTime(mapping.noiseGain, now + 0.025);
    channel.noiseGain.gain.linearRampToValueAtTime(0, now + duration);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.graph?.masterGain.gain.rampTo(muted ? 0 : MASTER_GAIN, 0.04);
  }

  stop(): void {
    if (!this.graph) {
      return;
    }

    const now = this.graph.tone.now();
    for (const channel of this.graph.channels.values()) {
      channel.lead.triggerRelease(now);
      channel.tensionVoice.triggerRelease(now);
      channel.noiseGain.gain.cancelScheduledValues(now);
      channel.noiseGain.gain.setValueAtTime(0, now);
    }
  }

  dispose(): void {
    if (!this.graph) {
      return;
    }

    for (const channel of this.graph.channels.values()) {
      channel.noise.stop();
      channel.noise.dispose();
      channel.noiseGain.dispose();
      channel.tensionVoice.dispose();
      channel.lead.dispose();
      channel.filter.dispose();
      channel.panner.dispose();
    }

    this.graph.masterGain.dispose();
    this.graph.limiter.dispose();
    this.graph = null;
    this.initialization = null;
  }

  private requireGraph(): AudioGraph {
    if (!this.graph) {
      throw new Error('Audio is not started. Call start() from a user gesture first.');
    }

    return this.graph;
  }

  private getChannel(graph: AudioGraph, name: string, pan: number): VoiceChannel {
    const existing = graph.channels.get(name);
    if (existing) {
      return existing;
    }

    const Tone = graph.tone;
    const filter = new Tone.Filter(700, 'lowpass');
    const panner = new Tone.Panner(pan);
    const lead = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.015, decay: 0.08, sustain: 0.18, release: 0.16 },
    });
    const tensionVoice = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.08, sustain: 0.12, release: 0.14 },
    });
    const noise = new Tone.Noise('pink');
    const noiseGain = new Tone.Gain(0);

    lead.connect(filter);
    tensionVoice.connect(filter);
    noise.connect(noiseGain);
    noiseGain.connect(filter);
    filter.connect(panner);
    panner.connect(graph.masterGain);
    noise.start();

    const channel = { filter, panner, lead, tensionVoice, noise, noiseGain };
    graph.channels.set(name, channel);
    return channel;
  }
}
