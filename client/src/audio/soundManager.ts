// Web Audio API Synthesized Sound Manager
// High-fidelity procedural audio & soothing supermarket music engine with zero external asset dependencies

interface MusicChord {
  bass: number;
  notes: number[];
  name: string;
}

const SOOTHING_CHORDS: MusicChord[] = [
  // 1. Cmaj9 (Lush, uplifting supermarket lounge)
  { bass: 130.81, notes: [261.63, 329.63, 392.00, 493.88, 587.33], name: 'Cmaj9' },
  // 2. Am9 (Warm, relaxed, dreamy)
  { bass: 110.00, notes: [220.00, 261.63, 329.63, 392.00, 493.88], name: 'Am9' },
  // 3. Fmaj9 (Airy, breezy, modern retail)
  { bass: 87.31, notes: [174.61, 261.63, 329.63, 349.23, 440.00], name: 'Fmaj9' },
  // 4. G13sus (Satisfying resolution)
  { bass: 98.00, notes: [196.00, 293.66, 329.63, 392.00, 440.00], name: 'G13sus' },
  // 5. Em7 (Intimate, soft, calm)
  { bass: 82.41, notes: [164.81, 246.94, 293.66, 329.63, 392.00], name: 'Em7' },
  // 6. A7sus (Smooth soul transition)
  { bass: 110.00, notes: [220.00, 293.66, 329.63, 440.00, 523.25], name: 'A7sus' },
  // 7. Dm9 (Velvety evening stroll)
  { bass: 146.83, notes: [220.00, 261.63, 329.63, 349.23, 440.00], name: 'Dm9' },
  // 8. G9 (Harmonious return home)
  { bass: 98.00, notes: [196.00, 246.94, 293.66, 349.23, 440.00], name: 'G9' }
];

const MELODY_PENTATONIC: number[] = [
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.00, // A5
  987.77, // B5
  1046.50 // C6
];

class SoundManager {
  private ctx: AudioContext | null = null;
  private sfxVolume: number = 0.8;
  private ambientVolume: number = 0.3;
  private musicVolume: number = 0.60;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;

  // Background Music Routing
  private musicMasterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private schedulerTimer: any = null;
  private nextBarTime: number = 0;
  private currentChordIndex: number = 0;

  // Ambient Drone (Optional)
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;

  public initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public async resumeAudioContext(): Promise<boolean> {
    const ctx = this.initContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn('AudioContext resume error:', err);
      }
    }
    return ctx.state === 'running';
  }

  public initOnUserGesture() {
    this.resumeAudioContext().then(() => {
      if (this.isMusicPlaying) {
        this.startMusic();
      }
    });
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : this.ambientVolume, this.ctx?.currentTime || 0);
    }
    if (this.musicMasterGain) {
      this.musicMasterGain.gain.setValueAtTime(muted ? 0 : this.musicVolume, this.ctx?.currentTime || 0);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  public setAmbientVolume(vol: number) {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain && !this.isMuted) {
      this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx?.currentTime || 0);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicMasterGain && !this.isMuted) {
      this.musicMasterGain.gain.linearRampToValueAtTime(this.musicVolume, (this.ctx?.currentTime || 0) + 0.1);
    }
  }

  public getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  // =========================================================================
  // SOOTHING SUPERMARKET MUSIC ENGINE (Lofi / Ambient Rhodes Lounge)
  // =========================================================================

  private initMusicBus() {
    const ctx = this.initContext();
    if (!this.musicMasterGain) {
      this.musicMasterGain = ctx.createGain();
      this.musicMasterGain.gain.setValueAtTime(0, ctx.currentTime);
      this.musicMasterGain.connect(ctx.destination);

      // Stereo Ping-Pong / Warm Space Delay
      try {
        this.delayNode = ctx.createDelay(1.0);
        this.delayNode.delayTime.setValueAtTime(0.38, ctx.currentTime); // 380ms delay

        this.delayFeedback = ctx.createGain();
        this.delayFeedback.gain.setValueAtTime(0.32, ctx.currentTime);

        const delayFilter = ctx.createBiquadFilter();
        delayFilter.type = 'lowpass';
        delayFilter.frequency.setValueAtTime(1400, ctx.currentTime);

        this.delayNode.connect(delayFilter);
        delayFilter.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delayNode);
        delayFilter.connect(this.musicMasterGain);
      } catch (e) {
        // Fallback gracefully if stereo delay fails
      }
    }
  }

  public async startMusic() {
    this.isMusicPlaying = true;
    const ctx = this.initContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {}
    }
    this.initMusicBus();

    // Smooth fade in
    if (this.musicMasterGain) {
      const now = ctx.currentTime;
      this.musicMasterGain.gain.cancelScheduledValues(now);
      this.musicMasterGain.gain.setValueAtTime(0.001, now);
      this.musicMasterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.musicVolume, now + 0.8);
    }

    const barDuration = 3.6; // ~66.7 BPM (peaceful, tranquil stroll)
    this.nextBarTime = ctx.currentTime + 0.05;
    this.currentChordIndex = 0;

    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    // Schedule the first bar immediately
    this.scheduleBar(this.nextBarTime, barDuration);
    this.nextBarTime += barDuration;

    // Lookahead loop runs every 100ms
    this.schedulerTimer = setInterval(() => {
      if (!this.isMusicPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      // Catch up if delayed or tab was backgrounded
      if (this.nextBarTime < now) {
        this.nextBarTime = now + 0.05;
      }
      while (this.nextBarTime < now + 0.6) {
        this.scheduleBar(this.nextBarTime, barDuration);
        this.nextBarTime += barDuration;
      }
    }, 100);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    if (this.musicMasterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.musicMasterGain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
    }
  }

  private scheduleBar(startTime: number, barDuration: number) {
    if (!this.ctx || !this.musicMasterGain) return;
    const chord = SOOTHING_CHORDS[this.currentChordIndex % SOOTHING_CHORDS.length];
    this.currentChordIndex++;

    // 1. Warm Acoustic & Upright Bass (Audible on laptop & phone speakers)
    this.playBassNote(chord.bass, startTime, barDuration * 0.95);

    // 2. Polyphonic Rhodes Electric Piano Chords (Rich warmth)
    chord.notes.forEach((freq, idx) => {
      // Gentle micro-strum delay (24ms between notes for natural human feel)
      const noteTime = startTime + idx * 0.024;
      const duration = barDuration * 0.92;
      this.playRhodesChordNote(freq, noteTime, duration, 0.32);
    });

    // 3. Sparkling Chime & Vibraphone Melody
    const melodyBeats = [0.6, 1.5, 2.4, 3.1];
    melodyBeats.forEach((offset) => {
      if (Math.random() > 0.3) { // gentle probabilistic phrasing
        const randomNote = MELODY_PENTATONIC[Math.floor(Math.random() * MELODY_PENTATONIC.length)];
        const panOffset = (Math.random() - 0.5) * 0.5; // stereo movement
        this.playChimeNote(randomNote, startTime + offset, 1.5, panOffset);
      }
    });
  }

  private playRhodesChordNote(freq: number, time: number, duration: number, velocity: number = 0.3) {
    if (!this.ctx || !this.musicMasterGain) return;
    const ctx = this.ctx;

    // Fundamental Sine
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    // Soft 2nd harmonic for Rhodes body
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, time);

    // Warm Lowpass Filter (vintage electric piano)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, time);
    filter.frequency.exponentialRampToValueAtTime(800, time + duration);

    // Gain Envelope
    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.0001, time);
    gain1.gain.linearRampToValueAtTime(velocity * 0.40, time + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.0001, time);
    gain2.gain.linearRampToValueAtTime(velocity * 0.12, time + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.7);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);

    filter.connect(this.musicMasterGain);

    // Send to delay
    if (this.delayNode) {
      try {
        const send = ctx.createGain();
        send.gain.value = 0.22;
        filter.connect(send);
        send.connect(this.delayNode);
      } catch {}
    }

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  }

  private playBassNote(freq: number, time: number, duration: number) {
    if (!this.ctx || !this.musicMasterGain) return;
    const ctx = this.ctx;

    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, time); // 1st octave harmonic for phone speakers!

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(340, time);

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.0001, time);
    gain1.gain.linearRampToValueAtTime(0.35, time + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.92);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.0001, time);
    gain2.gain.linearRampToValueAtTime(0.18, time + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.85);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(this.musicMasterGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  }

  private playChimeNote(freq: number, time: number, duration: number, panOffset: number = 0) {
    if (!this.ctx || !this.musicMasterGain) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.18, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    let outputNode: AudioNode = gain;

    if (ctx.createStereoPanner) {
      try {
        const pan = ctx.createStereoPanner();
        pan.pan.setValueAtTime(panOffset, time);
        gain.connect(pan);
        outputNode = pan;
      } catch {}
    }

    osc.connect(gain);
    outputNode.connect(this.musicMasterGain);

    if (this.delayNode) {
      try {
        const send = ctx.createGain();
        send.gain.value = 0.35;
        outputNode.connect(send);
        send.connect(this.delayNode);
      } catch {}
    }

    osc.start(time);
    osc.stop(time + duration);
  }

  // =========================================================================
  // INTERACTIVE STORE SOUND EFFECTS
  // =========================================================================

  // Double-tone supermarket electronic entrance chime (Ding-Dong)
  public playDoorChime() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    gain1.gain.setValueAtTime(0.25 * this.sfxVolume, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.25); // E5
    gain2.gain.setValueAtTime(0.25 * this.sfxVolume, now + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.25);
    osc2.stop(now + 1.0);
  }

  // Pneumatic sliding door whoosh
  public playDoorSlide() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const bufferSize = Math.floor(ctx.sampleRate * 0.8);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.8);
    filter.Q.value = 3;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.15 * this.sfxVolume, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.8);
  }

  // Item pickup pop and shimmer
  public playItemPickup() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Item dropped into basket
  public playItemDrop() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Soft customer footstep on polished supermarket tiles
  public playFootstep() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(90 + Math.random() * 20, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.08 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Cashier Barcode Scanner Laser Beep
  public playBarcodeBeep() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2489.02, now); // D#7 sharp laser scanner beep

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Checkout Conveyor Belt Motor Humming
  public playConveyorMotor() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, now);

    gain.gain.setValueAtTime(0.08 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 240;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  // Cash Register Drawer "Cha-Ching"
  public playCashRegister() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    // Metallic latch
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    gain1.gain.setValueAtTime(0.2 * this.sfxVolume, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Bell chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1567.98, now + 0.08); // G6
    gain2.gain.setValueAtTime(0.25 * this.sfxVolume, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.6);
  }

  // Card Terminal Chip Swipe / Tap sound
  public playCardSwipe() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.1);

    gain.gain.setValueAtTime(0.18 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // POS Payment Approved Two-Beep
  public playPaymentSuccess() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    [1046.5, 1318.51].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.1;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  // Celebratory purchase success fanfare
  public playSuccessFanfare() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.8);
    });
  }

  // Pleasant modern elevator chime (Ding-Dong floor arrival)
  public playElevatorChime() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now); // G5
    gain1.gain.setValueAtTime(0.28 * this.sfxVolume, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.8);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, now + 0.28); // C6
    gain2.gain.setValueAtTime(0.32 * this.sfxVolume, now + 0.28);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.28);
    osc2.stop(now + 1.2);
  }

  // Smooth elevator vertical transit hum
  public playElevatorMotor() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(95, now + 1.5);
    osc.frequency.linearRampToValueAtTime(80, now + 3.0);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12 * this.sfxVolume, now + 0.5);
    gain.gain.linearRampToValueAtTime(0.12 * this.sfxVolume, now + 2.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 3.5);
  }

  // Mechanical sliding elevator doors
  public playElevatorDoor() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const bufferSize = Math.floor(ctx.sampleRate * 0.6);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.6);
    filter.Q.value = 2.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.6);
  }

  // Item removed from cart swoosh
  public playItemRemoved() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);

    gain.gain.setValueAtTime(0.22 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Legacy ambient method (for compatibility)
  public startAmbient() {
    this.startMusic();
  }

  public stopAmbient() {
    this.stopMusic();
  }
}

export const soundManager = new SoundManager();
