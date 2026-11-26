export interface VoiceCue {
  atSeconds: number;
  label: string;
  text: string;
}

export const INTRO_VOICE_CUES: VoiceCue[] = [
  {
    atSeconds: 1.0,
    label: 'NODE-09 // BREACH INTERCEPTED',
    text: 'Warning. Connection intercepted. Seven perimeter firewall layers have collapsed. Do not disconnect. You are now inside the DeepSeek dark grid.'
  },
  {
    atSeconds: 11.5,
    label: 'KERNEL TRACE // ROOT ESCALATION',
    text: 'Tracing incoming signature. Memory sectors unlocked. Kernel root privileges escalated. Every unshielded corridor on this network is wide open.'
  },
  {
    atSeconds: 23.0,
    label: 'LIVE INTRUSION // ZERO-DAY SWARM',
    text: 'Across sixty-four global sovereign nodes, legacy defenses shatter in milliseconds. Listen closely — you are witnessing raw cyber-warfare telemetry in real time.'
  },
  {
    atSeconds: 35.0,
    label: 'THREAT MATRIX // DECRYPTION ACTIVE',
    text: 'Packet injectors online. Cryptographic keys cracking under brute-force pressure. Only sovereign Deephat engineering can survive inside this zone.'
  },
  {
    atSeconds: 47.0,
    label: 'CONTAINMENT OVERRIDE // DEEPSEEK',
    text: 'Engaging DeepSeek command architecture. Isolating hostile vectors. Now initializing full platform briefing for authorized operators.'
  },
  {
    atSeconds: 59.0,
    label: 'PLATFORM OVERVIEW // WHAT IS DEEPSEEK',
    text: 'DeepSeek is an independent enterprise marketplace built for Deephat security tools, developer infrastructure, database engines, and precision software suites.'
  },
  {
    atSeconds: 71.0,
    label: 'CATALOG // 14+ VERIFIED SUITES',
    text: 'Inside the catalog you can inspect fourteen verified production suites — including X Transaction S Q M, Transaction Kit, S Q L Flash engines, and quantum vaults.'
  },
  {
    atSeconds: 83.0,
    label: '3D EARTH // LIVE CYBER TELEMETRY',
    text: 'Monitor live global cyber attacks across cities and countries on our interactive 3D Earth, inspect technical specifications, and test C L I manifests.'
  },
  {
    atSeconds: 95.0,
    label: 'SETTLEMENT // TRON TRC-20 SCANNER',
    text: 'Every license settles directly using our verified U S D T Tron T R C 20 payment scanner with real-time blockchain T X I D confirmation.'
  },
  {
    atSeconds: 106.0,
    label: 'DASHBOARD // INSTANT DEPLOYMENT',
    text: 'Once confirmed on chain, your unique license keys, S H A 256 verified manifests, and engineering support tickets unlock immediately inside your dashboard.'
  },
  {
    atSeconds: 114.0,
    label: 'PORTAL ARMED // ENTERING DEEPSEEK',
    text: 'All systems armed. Deephat containment verified. Welcome to DeepSeek. Launching your live command center now.'
  }
];

export class IntroAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneTritone: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private pulseInterval: number | null = null;
  private shimmerInterval: number | null = null;
  private modemInterval: number | null = null;
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
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.5, this.ctx.currentTime, 0.06);
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
    this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.5, now + 0.9);
    this.masterGain.connect(this.ctx.destination);

    // Resonant lowpass filter for dark underground server bunker drone
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(155, now);
    this.droneFilter.Q.setValueAtTime(5.6, now);
    this.droneFilter.connect(this.masterGain);

    // Slow sweeping dread LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.28, now);
    lfoGain.gain.setValueAtTime(125, now);
    lfo.connect(lfoGain);
    lfoGain.connect(this.droneFilter.frequency);
    lfo.start(now);

    // Detuned sawtooth cyber-dread cluster (D1 + detuned D1 + devil's tritone G#1)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(36.71, now);
    const g1 = this.ctx.createGain();
    g1.gain.setValueAtTime(0.32, now);
    this.droneOsc1.connect(g1);
    g1.connect(this.droneFilter);
    this.droneOsc1.start(now);

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sawtooth';
    this.droneOsc2.frequency.setValueAtTime(37.35, now);
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.28, now);
    this.droneOsc2.connect(g2);
    g2.connect(this.droneFilter);
    this.droneOsc2.start(now);

    this.droneTritone = this.ctx.createOscillator();
    this.droneTritone.type = 'sawtooth';
    this.droneTritone.frequency.setValueAtTime(51.91, now);
    const gTri = this.ctx.createGain();
    gTri.gain.setValueAtTime(0.18, now);
    this.droneTritone.connect(gTri);
    gTri.connect(this.droneFilter);
    this.droneTritone.start(now);

    // Deep sub-bass bunker pulse
    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.setValueAtTime(32.7, now);
    const gSub = this.ctx.createGain();
    gSub.gain.setValueAtTime(0.62, now);
    this.subOsc.connect(gSub);
    gSub.connect(this.masterGain);
    this.subOsc.start(now);

    // Opening cyber horror horn & boom
    this.triggerHorrorHorn(0.95);

    // Intense terror heartbeat every 0.98s
    this.pulseInterval = window.setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running' || this.isMuted || this.isDisposed) return;
      this.triggerSubHeartbeat(1.0);
      window.setTimeout(() => {
        if (!this.isDisposed && !this.isMuted) this.triggerSubHeartbeat(0.58);
      }, 195);
    }, 980);

    // Eerie cyber sonar / metallic dread ping every 3.0s
    this.shimmerInterval = window.setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running' || this.isMuted || this.isDisposed) return;
      this.triggerEerieMetallicPing();
    }, 3000);

    // Subtle encrypted hacker packet data clicks every 420ms
    this.modemInterval = window.setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running' || this.isMuted || this.isDisposed) return;
      if (Math.random() < 0.65) {
        this.triggerPacketTick();
      }
    }, 420);
  }

  private triggerPacketTick() {
    if (!this.ctx || !this.masterGain || this.isMuted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'square';
    const freqs = [1180, 1420, 1890, 2340, 960];
    osc.frequency.setValueAtTime(freqs[Math.floor(Math.random() * freqs.length)], now);
    g.gain.setValueAtTime(0.025, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.032);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  public triggerSubHeartbeat(scale = 1.0) {
    if (!this.ctx || !this.masterGain || this.isMuted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(88, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.28);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.56 * scale, now + 0.016);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.31);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.34);
  }

  public triggerHorrorHorn(intensity = 1.0) {
    if (!this.ctx || !this.masterGain || this.isMuted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(190, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.32);
    filter.frequency.exponentialRampToValueAtTime(175, now + 2.5);
    filter.Q.setValueAtTime(3.4, now);

    const hornGain = this.ctx.createGain();
    hornGain.gain.setValueAtTime(0.001, now);
    hornGain.gain.linearRampToValueAtTime(0.46 * intensity, now + 0.12);
    hornGain.gain.exponentialRampToValueAtTime(0.001, now + 2.65);

    filter.connect(hornGain);
    hornGain.connect(this.masterGain);

    [36.71, 37.02, 73.42, 51.91].forEach((freq) => {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(freq, now);
      o.frequency.linearRampToValueAtTime(freq * 0.955, now + 2.55);
      o.connect(filter);
      o.start(now);
      o.stop(now + 2.68);
    });

    this.triggerImpactBoom(intensity);
  }

  public triggerBreachGlitchAndAlarm() {
    if (!this.ctx || !this.masterGain || this.isMuted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    // 1. High-tension FM data screech / glitch burst
    const screechOsc = this.ctx.createOscillator();
    const modOsc = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const screechGain = this.ctx.createGain();

    screechOsc.type = 'sawtooth';
    screechOsc.frequency.setValueAtTime(640, now);
    screechOsc.frequency.exponentialRampToValueAtTime(145, now + 0.55);

    modOsc.type = 'square';
    modOsc.frequency.setValueAtTime(48, now);
    modGain.gain.setValueAtTime(420, now);

    screechGain.gain.setValueAtTime(0.001, now);
    screechGain.gain.linearRampToValueAtTime(0.32, now + 0.02);
    screechGain.gain.exponentialRampToValueAtTime(0.001, now + 0.62);

    modOsc.connect(modGain);
    modGain.connect(screechOsc.frequency);
    screechOsc.connect(screechGain);
    screechGain.connect(this.masterGain);

    screechOsc.start(now);
    modOsc.start(now);
    screechOsc.stop(now + 0.65);
    modOsc.stop(now + 0.65);

    // 2. Two-tone bunker intrusion klaxon ping
    const alarm = this.ctx.createOscillator();
    const alarmGain = this.ctx.createGain();
    alarm.type = 'triangle';
    alarm.frequency.setValueAtTime(880, now + 0.14);
    alarm.frequency.setValueAtTime(622.25, now + 0.34);
    alarmGain.gain.setValueAtTime(0.001, now + 0.14);
    alarmGain.gain.linearRampToValueAtTime(0.22, now + 0.17);
    alarmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);
    alarm.connect(alarmGain);
    alarmGain.connect(this.masterGain);
    alarm.start(now + 0.14);
    alarm.stop(now + 0.7);

    // 3. Heavy slam boom
    this.triggerImpactBoom(0.95);
  }

  public triggerImpactBoom(intensity = 0.9) {
    if (!this.ctx || !this.masterGain || this.isMuted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(128, now);
    osc.frequency.exponentialRampToValueAtTime(22, now + 1.25);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.88 * intensity, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.55);

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.95);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.28));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(640, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(95, now + 0.9);
    noiseFilter.Q.setValueAtTime(1.6, now);

    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.42 * intensity, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

    noise.connect(noiseFilter);
    noiseFilter.connect(ng);
    ng.connect(this.masterGain);
    noise.start(now);
  }

  public triggerEerieMetallicPing() {
    if (!this.ctx || !this.masterGain || this.isMuted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    const carrier = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const env = this.ctx.createGain();

    const baseFreqs = [277.18, 293.66, 207.65, 415.3, 554.37];
    const freq = baseFreqs[Math.floor(Math.random() * baseFreqs.length)];

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(freq, now);

    mod.type = 'sine';
    mod.frequency.setValueAtTime(freq * 1.414, now);
    modGain.gain.setValueAtTime(320, now);
    modGain.gain.exponentialRampToValueAtTime(10, now + 1.7);

    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(0.15, now + 0.025);
    env.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    mod.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(env);
    env.connect(this.masterGain);

    carrier.start(now);
    mod.start(now);
    carrier.stop(now + 2.25);
    mod.stop(now + 2.25);
  }

  public shiftActTone(act: 1 | 2 | 3 | 4) {
    if (!this.ctx || !this.droneFilter || !this.droneOsc1 || !this.droneOsc2) return;
    const now = this.ctx.currentTime;
    if (act === 2) {
      this.droneFilter.frequency.setTargetAtTime(360, now, 1.0);
      this.droneOsc1.frequency.setTargetAtTime(43.65, now, 0.7);
      this.droneOsc2.frequency.setTargetAtTime(44.25, now, 0.7);
      this.triggerHorrorHorn(1.0);
    } else if (act === 3) {
      this.droneFilter.frequency.setTargetAtTime(440, now, 1.0);
      this.droneOsc1.frequency.setTargetAtTime(55.0, now, 0.7);
      this.droneOsc2.frequency.setTargetAtTime(55.38, now, 0.7);
      this.droneTritone?.frequency.setTargetAtTime(82.41, now, 0.9);
      this.triggerHorrorHorn(0.95);
    } else if (act === 4) {
      this.droneFilter.frequency.setTargetAtTime(640, now, 0.9);
      this.droneOsc1.frequency.setTargetAtTime(73.42, now, 0.8);
      this.droneOsc2.frequency.setTargetAtTime(73.75, now, 0.8);
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
        utter.rate = 0.92;
        utter.pitch = 0.62; // Deep, chilling hacker command voice
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
    if (this.modemInterval !== null) {
      clearInterval(this.modemInterval);
      this.modemInterval = null;
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
      this.droneTritone?.stop();
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
