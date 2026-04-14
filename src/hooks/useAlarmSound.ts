import { useEffect, useRef } from 'react';
import { SoundType, playSound, stopAllSounds, setVolume } from '@/lib/alarmSounds';

interface UseAlarmSoundOptions {
  isPlaying: boolean;
  soundType: SoundType;
}

export function useAlarmSound({ isPlaying, soundType }: UseAlarmSoundOptions) {
  const intervalRef = useRef<number>();
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      stopAllSounds();
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    startTimeRef.current = Date.now();

    // Start playing with initial volume
    playSound(soundType, 0.3);

    // Ramp volume from 30% to 100% over 30 seconds
    intervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const vol = Math.min(1, 0.3 + (0.7 * elapsed) / 30);
      setVolume(vol);

      // For non-despertador sounds (Web Audio synth), re-trigger every 2s
      if (soundType !== 'despertador' && elapsed > 0) {
        playSound(soundType, vol);
      }
    }, 2000);

    // Wake Lock to keep screen on while alarm rings
    let wakeLock: WakeLockSentinel | null = null;
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(wl => {
        wakeLock = wl;
      }).catch(() => {});
    }

    return () => {
      stopAllSounds();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (wakeLock) wakeLock.release().catch(() => {});
    };
  }, [isPlaying, soundType]);
}
