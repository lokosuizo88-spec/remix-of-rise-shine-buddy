import { useEffect, useRef } from 'react';
import { getAlarmSound } from '@/lib/alarmSounds';

export function useAlarmSound(isPlaying: boolean, soundId: string = 'default') {
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number>();

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      return;
    }

    const sound = getAlarmSound(soundId);

    const playSound = () => {
      try {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new AudioContext();
        }
        sound.play(audioContextRef.current);
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
    }, 2000);

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
