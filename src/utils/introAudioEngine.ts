export interface VoiceCue {
  atSeconds: number;
  label: string;
  text: string;
}

export const INTRO_VOICE_CUES: VoiceCue[] = [
  {
    atSeconds: 0.8,
    label: 'QUANTUM IGNITION // 00:00',
    text: 'Quantum core online. Synchronizing sovereign Deephat architecture in ultra high definition.'
  },
  {
    atSeconds: 9.5,
    label: 'HYPER-GYRO SURGE // 00:10',
    text: 'Five-axis cryptographic containment accelerating. Live global threat telemetry locked.'
  },
  {
    atSeconds: 18.0,
    label: 'SOVEREIGN LOCK // 00:18',
    text: 'Sixteen enterprise security suites, SHA-256 manifests, and TRC-20 settlement verified.'
  },
  {
    atSeconds: 24.5,
    label: 'WARP LAUNCH // 00:25',
    text: 'All systems armed. Welcome to DeepSeek. Launching your 4K command grid now.'
  }
];

export class IntroAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFifth: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private pulseInterval: number | null = null;
  private shimmerInterval: number | null = null;
  private isMuted = false;
  private isStarted = false;
  private isDisposed = false;
  private spokenIndices = new Set<number>();

  public async start(): Promise<boolean> {
    if (this.isDisposed) return false;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;

      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      if (this.ctx.state !== 'running') {
        return false;
      }

      if (!this.isStarted) {
        this.setupContinuousBed();
        this.isStarted = true;
      }
      return true;
    } catch {
      return false;
    }
  }

  public getState(): 'uninitialized' | 'suspended' | 'running' {
    if (!this.ctx) return 'uninitialized';
    if (this.ctx.state === 'running') return 'running';
    return 'suspended';
  }

  public isAudioMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.52, this.ctx.currentTime, 0.06);
    }
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  private setupContinuousBed() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.52, now + 0.75);
    this.masterGain.connect(this.ctx.destination);

    // Warm cinematic lowpass filter for futuristic Hans-Zimmer-style synth pad
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(240, now);
    this.droneFilter.Q.setValueAtTime(3.2, now);
    this.droneFilter.connect(this.masterGain);

    // Slow breathing filter LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.35, now);
    lfoGain.gain.setValueAtTime(110, now);
    lfo.connect(lfoGain);
    lfoGain.connect(this.droneFilter.frequency);
    lfo.start(now);

    // Rich harmonic D1 + detuned D1 + fifth A1 cinematic power chord
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(36.71, now);
    const g1 = this.ctx.createGain();
    g1.gain.setValueAtTime(0.28, now);
    this.droneOsc1.connect(g1);
    g1.connect(this.droneFilter);
    this.droneOsc1.start(now);

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sawtooth';
    this.droneOsc2.frequency.setValueAtTime(36.96, now);
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.26, now);
    this.droneOsc2.connect(g2);
    g2.connect(this.droneFilter);
    this.droneOsc2.start(now);

    this.droneFifth = this.ctx.createOscillator();
    this.droneFifth.type = 'triangle';
    this.droneFifth.frequency.setValueAtTime(55.0, now);
    const g5 = this.ctx.createGain();
    g5.gain.setValueAtTime(0.24, now);
    this.droneFifth.connect(g5);
    g5.connect(this.droneFilter);
    this.droneFifth.start(now);

    // Deep sub-bass foundation
    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.setValueAtTime(36.71, now);
    const gSub = this.ctx.createGain();
    gSub.gain.setValueAtTime(0.55, now);
    this.subOsc.connect(gSub);
    gSub.connect(this.masterGain);
    this.subOsc.start(now);

    // Opening cinematic bass drop
    this.triggerHorrorHorn(0.95);

    // Steady kinetic sub pulse every 0.75s
    this.pulseInterval = window.setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running' || this.isMuted || this.isDisposed) return;
      this.triggerSubHeartbeat(0.85);
    }, 750);

    // Crystalline quantum harmonic chime every 2.4s
    this.shimmerInterval = window.setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running' || this.isMuted || this.isDisposed) return;
      this.triggerQuantumChime();
    }, 2400);
  }

  public triggerSubHeartbeat(scale = 1.0) {
    if (!this.ctx || !this.masterGain || this.isMuted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(92, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.45 * scale, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public triggerHorrorHorn(intensity = 1.0) {
    if (!this.ctx || !this.masterGain || this.isMuted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.35);
    filter.frequency.exponentialRampToValueAtTime(240, now + 2.2);
    filter.Q.setValueAtTime(2.6, now);

    const hornGain = this.ctx.createGain();
    hornGain.gain.setValueAtTime(0.001, now);
    hornGain.gain.linearRampToValueAtTime(0.42 * intensity, now + 0.14);
    hornGain.gain.exponentialRampToValueAtTime(0.001, now + 2.35);

    filter.connect(hornGain);
    hornGain.connect(this.masterGain);

    [36.71, 55.0, 73.42, 110.0].forEach((freq) => {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(freq, now);
      o.connect(filter);
      o.start(now);
      o.stop(now + 2.4);
    });

    this.triggerImpactBoom(intensity);
  }

  public triggerQuantumPulse() {
    if (!this.ctx || !this.masterGain || this.isMuted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    // Smooth futuristic synth riser + impact drop
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(146.83, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.28);
    osc.frequency.exponentialRampToValueAtTime(73.42, now + 0.72);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.24, now + 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.78);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.8);

    this.triggerQuantumChime();
    this.triggerImpactBoom(0.82);
  }

  public triggerBreachGlitchAndAlarm() {
    this.triggerQuantumPulse();
  }

  public triggerImpactBoom(intensity = 0.9) {
    if (!this.ctx || !this.masterGain || this.isMuted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(24, now + 1.1);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.8 * intensity, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.35);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.4);
  }

  public triggerQuantumChime() {
    if (!this.ctx || !this.masterGain || this.isMuted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    // Harmonic D-minor pentatonic crystal frequencies
    const freqs = [587.33, 659.25, 880.0, 1046.5, 1174.66];
    const freq = freqs[Math.floor(Math.random() * freqs.length)];

    const carrier = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(freq, now);

    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(0.11, now + 0.03);
    env.gain.exponentialRampToValueAtTime(0.001, now + 1.65);

    carrier.connect(env);
    env.connect(this.masterGain);
    carrier.start(now);
    carrier.stop(now + 1.7);
  }

  public shiftActTone(act: 1 | 2 | 3 | 4) {
    if (!this.ctx || !this.droneFilter || !this.droneOsc1 || !this.droneOsc2) return;
    const now = this.ctx.currentTime;
    if (act === 2) {
      this.droneFilter.frequency.setTargetAtTime(520, now, 0.8);
      this.droneOsc1.frequency.setTargetAtTime(44.0, now, 0.6);
      this.droneOsc2.frequency.setTargetAtTime(44.32, now, 0.6);
      this.droneFifth?.frequency.setTargetAtTime(65.93, now, 0.6);
      this.triggerHorrorHorn(0.95);
    } else if (act >= 3) {
      this.droneFilter.frequency.setTargetAtTime(880, now, 0.7);
      this.droneOsc1.frequency.setTargetAtTime(55.0, now, 0.6);
      this.droneOsc2.frequency.setTargetAtTime(55.38, now, 0.6);
      this.droneFifth?.frequency.setTargetAtTime(82.41, now, 0.6);
      this.triggerHorrorHorn(1.0);
    }
  }

  public updateVoiceCues(elapsedSeconds: number): number {
    let activeIdx = 0;
    for (let i = 0; i < INTRO_VOICE_CUES.length; i++) {
      if (elapsedSeconds >= INTRO_VOICE_CUES[i].atSeconds) {
        activeIdx = i;
      }
    }

    if (this.isMuted || this.isDisposed) return activeIdx;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return activeIdx;

    if (!this.spokenIndices.has(activeIdx) && elapsedSeconds >= INTRO_VOICE_CUES[activeIdx].atSeconds) {
      this.spokenIndices.add(activeIdx);
      const cue = INTRO_VOICE_CUES[activeIdx];
      try {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        const utter = new SpeechSynthesisUtterance(cue.text);
        utter.rate = 0.96;
        utter.pitch = 0.78;
        utter.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find((v) => /en/i.test(v.lang) && /male|daniel|david|google uk|alex|mark/i.test(v.name)) ||
          voices.find((v) => /^en/i.test(v.lang));
        if (preferred) utter.voice = preferred;

        window.speechSynthesis.speak(utter);
      } catch {
        // Ignore SpeechSynthesis restrictions silently
      }
    }

    return activeIdx;
  }

  public dispose() {
    this.isDisposed = true;
    if (this.pulseInterval !== null) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }
    if (this.shimmerInterval !== null) {
      clearInterval(this.shimmerInterval);
      this.shimmerInterval = null;
    }
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // Ignore
    }
    try {
      this.droneOsc1?.stop();
      this.droneOsc2?.stop();
      this.droneFifth?.stop();
      this.subOsc?.stop();
    } catch {
      // Already stopped
    }
    try {
      if (this.ctx && this.ctx.state !== 'closed') {
        void this.ctx.close();
      }
    } catch {
      // Ignore
    }
    this.ctx = null;
  }
}
