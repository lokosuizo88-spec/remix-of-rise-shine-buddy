import { useEffect, useRef } from 'react';
import { SoundType, playSound, stopAllSounds } from '@/lib/alarmSounds';

interface UseAlarmSoundOptions {
  isPlaying: boolean;
  soundType: SoundType;
}

export function useAlarmSound({ isPlaying, soundType }: UseAlarmSoundOptions) {
  const intervalRef = useRef<number>();
  const volumeRef = useRef(0.3);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      stopAllSounds();
      if (intervalRef.current) clearInterval(intervalRef.current);
      volumeRef.current = 0.3;
      return;
    }

    startTimeRef.current = Date.now();
    volumeRef.current = 0.3;

    const play = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      volumeRef.current = Math.min(1, 0.3 + (0.7 * elapsed) / 30);
      playSound(soundType, volumeRef.current);
    };

    play();
    // Repeat sound every 2 seconds for continuous alarm
    intervalRef.current = window.setInterval(play, 2000);

    return () => {
      stopAllSounds();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, soundType]);
}
