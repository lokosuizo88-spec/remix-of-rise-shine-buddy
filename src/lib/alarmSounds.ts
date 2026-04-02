export type AlarmSoundId = 'default' | 'siren' | 'chainsaw' | 'earthquake' | 'helicopter' | 'nuclear';

export interface AlarmSoundConfig {
  id: AlarmSoundId;
  label: string;
  emoji: string;
  description: string;
  play: (ctx: AudioContext) => void;
}

function playTone(ctx: AudioContext, freq: number, type: OscillatorType, vol: number, start: number, dur: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.setValueAtTime(vol, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur);
}

function playSweep(ctx: AudioContext, from: number, to: number, type: OscillatorType, vol: number, start: number, dur: number) {
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

export const ALARM_SOUNDS: AlarmSoundConfig[] = [
  {
    id: 'default',
    label: 'Clásica',
    emoji: '🔔',
    description: 'Pitidos agudos',
    play: (ctx) => {
      playTone(ctx, 880, 'square', 0.4, 0, 0.5);
      playTone(ctx, 1100, 'square', 0.4, 0.2, 0.3);
    },
  },
  {
    id: 'siren',
    label: 'Sirena',
    emoji: '🚨',
    description: 'Policía a tu puerta',
    play: (ctx) => {
      playSweep(ctx, 600, 1400, 'sawtooth', 0.4, 0, 0.8);
      playSweep(ctx, 1400, 600, 'sawtooth', 0.4, 0.8, 0.8);
    },
  },
  {
    id: 'chainsaw',
    label: 'Motosierra',
    emoji: '🪚',
    description: 'Imposible ignorar',
    play: (ctx) => {
      // Harsh buzzing
      for (let i = 0; i < 6; i++) {
        playTone(ctx, 80 + Math.random() * 40, 'sawtooth', 0.5, i * 0.15, 0.15);
        playTone(ctx, 160 + Math.random() * 80, 'square', 0.3, i * 0.15, 0.15);
      }
    },
  },
  {
    id: 'earthquake',
    label: 'Terremoto',
    emoji: '🌋',
    description: 'Vibración infernal',
    play: (ctx) => {
      playSweep(ctx, 40, 200, 'sawtooth', 0.5, 0, 0.6);
      playSweep(ctx, 200, 40, 'sawtooth', 0.5, 0.6, 0.6);
      playTone(ctx, 1200, 'square', 0.3, 0.3, 0.2);
      playTone(ctx, 1500, 'square', 0.3, 0.9, 0.2);
    },
  },
  {
    id: 'helicopter',
    label: 'Helicóptero',
    emoji: '🚁',
    description: 'Taca-taca-taca',
    play: (ctx) => {
      for (let i = 0; i < 12; i++) {
        playTone(ctx, 200, 'square', 0.45, i * 0.1, 0.05);
        playTone(ctx, 400, 'sawtooth', 0.2, i * 0.1 + 0.05, 0.05);
      }
    },
  },
  {
    id: 'nuclear',
    label: 'Apocalipsis',
    emoji: '☢️',
    description: 'Alerta nuclear máxima',
    play: (ctx) => {
      playSweep(ctx, 400, 1800, 'sawtooth', 0.5, 0, 1.2);
      playTone(ctx, 1800, 'square', 0.4, 0.4, 0.3);
      playTone(ctx, 900, 'square', 0.4, 0.8, 0.3);
      playSweep(ctx, 1800, 400, 'sawtooth', 0.3, 1.2, 0.6);
    },
  },
];

export function getAlarmSound(id: string): AlarmSoundConfig {
  return ALARM_SOUNDS.find(s => s.id === id) || ALARM_SOUNDS[0];
}
