export type AlarmSoundId = 'default' | 'siren' | 'chainsaw' | 'earthquake' | 'helicopter' | 'nuclear';

export interface AlarmSoundConfig {
  id: AlarmSoundId;
  label: string;
  emoji: string;
  description: string;
  play: (ctx: AudioContext) => void;
}

function playTone(
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
  vol: number,
  start: number,
  dur: number,
  pan: number = 0
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const panner = ctx.createStereoPanner();
  osc.connect(gain);
  gain.connect(panner);
  panner.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  panner.pan.value = pan;
  gain.gain.setValueAtTime(vol, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur);
}

function playSweep(
  ctx: AudioContext,
  from: number,
  to: number,
  type: OscillatorType,
  vol: number,
  start: number,
  dur: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(from, ctx.currentTime + start);
  osc.frequency.linearRampToValueAtTime(to, ctx.currentTime + start + dur);
  gain.gain.setValueAtTime(vol, ctx.currentTime + start);
  gain.gain.setValueAtTime(vol, ctx.currentTime + start + dur * 0.8);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur);
}

function playNoise(ctx: AudioContext, vol: number, start: number, dur: number) {
  const bufferSize = ctx.sampleRate * dur;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * vol;
  }
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  source.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(vol, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
  source.start(ctx.currentTime + start);
  source.stop(ctx.currentTime + start + dur);
}

export const ALARM_SOUNDS: AlarmSoundConfig[] = [
  {
    id: 'default',
    label: 'Clásica',
    emoji: '🔔',
    description: 'Pitidos agudos insistentes',
    play: (ctx) => {
      // Rapid alternating high-pitched beeps with stereo panning
      for (let i = 0; i < 4; i++) {
        playTone(ctx, 880, 'square', 0.35, i * 0.25, 0.12, i % 2 === 0 ? -0.5 : 0.5);
        playTone(ctx, 1100, 'square', 0.35, i * 0.25 + 0.12, 0.12, i % 2 === 0 ? 0.5 : -0.5);
      }
      // Add a piercing overtone
      playTone(ctx, 1760, 'sine', 0.15, 0, 1.0);
    },
  },
  {
    id: 'siren',
    label: 'Sirena',
    emoji: '🚨',
    description: 'Policía a tu puerta',
    play: (ctx) => {
      // Two-tone siren with harmonics
      playSweep(ctx, 600, 1400, 'sawtooth', 0.35, 0, 0.7);
      playSweep(ctx, 1400, 600, 'sawtooth', 0.35, 0.7, 0.7);
      // Add urgency overtone
      playSweep(ctx, 1200, 2800, 'sine', 0.12, 0, 0.7);
      playSweep(ctx, 2800, 1200, 'sine', 0.12, 0.7, 0.7);
      // Clicking urgency
      for (let i = 0; i < 8; i++) {
        playTone(ctx, 3000, 'square', 0.08, i * 0.18, 0.02);
      }
    },
  },
  {
    id: 'chainsaw',
    label: 'Motosierra',
    emoji: '🪚',
    description: 'Imposible ignorar',
    play: (ctx) => {
      // Harsh buzzing with noise layer
      for (let i = 0; i < 8; i++) {
        const baseFreq = 70 + Math.random() * 50;
        playTone(ctx, baseFreq, 'sawtooth', 0.4, i * 0.12, 0.12);
        playTone(ctx, baseFreq * 2, 'square', 0.25, i * 0.12, 0.12);
        playTone(ctx, baseFreq * 3, 'sawtooth', 0.1, i * 0.12, 0.12);
      }
      // Add engine noise
      playNoise(ctx, 0.2, 0, 0.96);
      // Screaming high pitch
      playSweep(ctx, 2000, 4000, 'sawtooth', 0.08, 0, 0.5);
      playSweep(ctx, 4000, 2000, 'sawtooth', 0.08, 0.5, 0.46);
    },
  },
  {
    id: 'earthquake',
    label: 'Terremoto',
    emoji: '🌋',
    description: 'Vibración infernal',
    play: (ctx) => {
      // Deep rumble with sub-bass
      playSweep(ctx, 30, 180, 'sawtooth', 0.5, 0, 0.5);
      playSweep(ctx, 180, 30, 'sawtooth', 0.5, 0.5, 0.5);
      // Cracking sounds
      for (let i = 0; i < 6; i++) {
        playTone(ctx, 1000 + Math.random() * 2000, 'square', 0.2, Math.random() * 0.8, 0.05);
      }
      // Deep noise layer
      playNoise(ctx, 0.25, 0, 1.0);
      // Alert beeps on top
      playTone(ctx, 1200, 'square', 0.25, 0.25, 0.15);
      playTone(ctx, 1500, 'square', 0.25, 0.6, 0.15);
      playTone(ctx, 1800, 'square', 0.25, 0.85, 0.15);
    },
  },
  {
    id: 'helicopter',
    label: 'Helicóptero',
    emoji: '🚁',
    description: 'Taca-taca-taca',
    play: (ctx) => {
      // Fast chopper blades with stereo rotation
      for (let i = 0; i < 16; i++) {
        const pan = Math.sin((i / 16) * Math.PI * 2);
        playTone(ctx, 180, 'square', 0.4, i * 0.075, 0.035, pan);
        playTone(ctx, 360, 'sawtooth', 0.15, i * 0.075 + 0.035, 0.035, -pan);
      }
      // Engine whine
      playSweep(ctx, 800, 1200, 'sawtooth', 0.1, 0, 1.2);
      // Turbine noise
      playNoise(ctx, 0.1, 0, 1.2);
    },
  },
  {
    id: 'nuclear',
    label: 'Apocalipsis',
    emoji: '☢️',
    description: 'Alerta nuclear máxima',
    play: (ctx) => {
      // Rising alarm sweep
      playSweep(ctx, 400, 2000, 'sawtooth', 0.4, 0, 0.8);
      // Sustained high-pitched alert
      playTone(ctx, 2000, 'square', 0.35, 0.8, 0.4);
      // Falling sweep
      playSweep(ctx, 2000, 400, 'sawtooth', 0.35, 1.2, 0.6);
      // Pulsing sub-alarm
      for (let i = 0; i < 6; i++) {
        playTone(ctx, 1800, 'square', 0.3, i * 0.3, 0.1);
        playTone(ctx, 900, 'square', 0.2, i * 0.3 + 0.15, 0.1);
      }
      // Add harsh noise burst
      playNoise(ctx, 0.15, 0.4, 0.3);
      playNoise(ctx, 0.2, 1.0, 0.3);
    },
  },
];

export function getAlarmSound(id: string): AlarmSoundConfig {
  return ALARM_SOUNDS.find(s => s.id === id) || ALARM_SOUNDS[0];
}
