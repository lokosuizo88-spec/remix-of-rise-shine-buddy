export type SoundType = 'sirena' | 'motosierra' | 'helicoptero' | 'megafono' | 'despertador';

export const SOUND_OPTIONS: { value: SoundType; label: string; emoji: string }[] = [
  { value: 'despertador', label: 'Despertador', emoji: '⏰' },
  { value: 'sirena', label: 'Sirena', emoji: '🚨' },
  { value: 'motosierra', label: 'Motosierra', emoji: '🪚' },
  { value: 'helicoptero', label: 'Helicóptero', emoji: '🚁' },
  { value: 'megafono', label: 'Megáfono', emoji: '📢' },
];

let audioCtx: AudioContext | null = null;
let activeNodes: AudioScheduledSourceNode[] = [];
let activeMasterGain: GainNode | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function createNoise(ctx: AudioContext, duration: number, gain: number): AudioBufferSourceNode {
  const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * gain;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

export function stopAllSounds() {
  activeNodes.forEach(n => { try { n.stop(); } catch {} });
  activeNodes = [];
  if (activeMasterGain) {
    try { activeMasterGain.disconnect(); } catch {}
    activeMasterGain = null;
  }
}

export function playSound(type: SoundType, volume: number = 1): void {
  // Stop previous sounds before playing new ones
  stopAllSounds();

  const ctx = getCtx();
  const masterGain = ctx.createGain();
  masterGain.gain.value = volume;
  masterGain.connect(ctx.destination);
  activeMasterGain = masterGain;

  const nodes: AudioScheduledSourceNode[] = [];
  const now = ctx.currentTime;

  switch (type) {
    case 'despertador': {
      for (let i = 0; i < 6; i++) {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 880;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.6, now + i * 0.25);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.25 + 0.12);
        osc.connect(g).connect(masterGain);
        osc.start(now + i * 0.25);
        osc.stop(now + i * 0.25 + 0.12);
        nodes.push(osc);
      }
      break;
    }
    case 'sirena': {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.5);
      osc.frequency.linearRampToValueAtTime(400, now + 1.0);
      osc.frequency.linearRampToValueAtTime(1200, now + 1.5);
      osc.frequency.linearRampToValueAtTime(400, now + 2.0);
      const g = ctx.createGain();
      g.gain.value = 0.5;
      osc.connect(g).connect(masterGain);
      osc.start(now);
      osc.stop(now + 2.0);
      nodes.push(osc);

      const noise = createNoise(ctx, 2.0, 0.05);
      const ng = ctx.createGain();
      ng.gain.value = 0.15;
      noise.connect(ng).connect(masterGain);
      noise.start(now);
      noise.stop(now + 2.0);
      nodes.push(noise);
      break;
    }
    case 'motosierra': {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 80;
      const g = ctx.createGain();
      g.gain.value = 0.4;
      osc.connect(g).connect(masterGain);
      osc.start(now);
      osc.stop(now + 2.0);
      nodes.push(osc);

      const noise = createNoise(ctx, 2.0, 0.2);
      const ng = ctx.createGain();
      ng.gain.value = 0.5;
      noise.connect(ng).connect(masterGain);
      noise.start(now);
      noise.stop(now + 2.0);
      nodes.push(noise);

      const osc2 = ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.value = 40;
      const g2 = ctx.createGain();
      g2.gain.value = 0.25;
      osc2.connect(g2).connect(masterGain);
      osc2.start(now);
      osc2.stop(now + 2.0);
      nodes.push(osc2);
      break;
    }
    case 'helicoptero': {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 20;
      const g = ctx.createGain();
      g.gain.value = 0.6;
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(-1, now);
      panner.pan.linearRampToValueAtTime(1, now + 1);
      panner.pan.linearRampToValueAtTime(-1, now + 2);
      osc.connect(g).connect(panner).connect(masterGain);
      osc.start(now);
      osc.stop(now + 2);
      nodes.push(osc);

      const noise = createNoise(ctx, 2, 0.12);
      const ng = ctx.createGain();
      ng.gain.value = 0.25;
      noise.connect(ng).connect(masterGain);
      noise.start(now);
      noise.stop(now + 2);
      nodes.push(noise);
      break;
    }
    case 'megafono': {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.3);
      osc.frequency.setValueAtTime(600, now + 0.6);
      osc.frequency.linearRampToValueAtTime(900, now + 0.9);
      osc.frequency.setValueAtTime(600, now + 1.2);
      osc.frequency.linearRampToValueAtTime(900, now + 1.5);
      const g = ctx.createGain();
      g.gain.value = 0.45;
      osc.connect(g).connect(masterGain);
      osc.start(now);
      osc.stop(now + 2.0);
      nodes.push(osc);
      break;
    }
  }

  activeNodes = nodes;
}
