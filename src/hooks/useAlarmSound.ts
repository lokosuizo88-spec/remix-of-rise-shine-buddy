import { useEffect, useRef } from 'react';
import { getAlarmSound } from '@/lib/alarmSounds';

const MAX_VOLUME = 1.0;
const RAMP_DURATION_MS = 30_000; // 30 seconds to reach max volume
const PLAY_INTERVAL_MS = 1800;

export function useAlarmSound(isPlaying: boolean, soundId: string = 'default') {
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number>();
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      gainNodeRef.current = null;
      return;
    }

    const sound = getAlarmSound(soundId);
    startTimeRef.current = Date.now();

    const getVolume = (): number => {
      const elapsed = Date.now() - startTimeRef.current;
      // Start at 20% volume, ramp to 100% over RAMP_DURATION
      const progress = Math.min(elapsed / RAMP_DURATION_MS, 1);
      return 0.2 + progress * (MAX_VOLUME - 0.2);
    };

    const ensureContext = (): AudioContext => {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
      }
      return audioContextRef.current;
    };

    const playSound = () => {
      try {
        const ctx = ensureContext();
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.setValueAtTime(getVolume(), ctx.currentTime);
        }
        sound.play(ctx);
      } catch {
        // Audio not supported
      }
    };

    const vibrate = () => {
      try {
        navigator.vibrate?.([500, 200, 500, 200, 500]);
      } catch {}
    };

    playSound();
    vibrate();
    intervalRef.current = window.setInterval(() => {
      playSound();
      vibrate();
    }, PLAY_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, soundId]);
}

/** Preview a sound for a short burst */
export function previewAlarmSound(soundId: string): () => void {
  const ctx = new AudioContext();
  const sound = getAlarmSound(soundId);
  sound.play(ctx);
  const timeout = setTimeout(() => ctx.close(), 2000);
  return () => {
    clearTimeout(timeout);
    ctx.close();
  };
}
