import { useEffect, useRef } from 'react';
import { SoundType, playSound } from '@/lib/alarmSounds';

interface UseAlarmSoundOptions {
  isPlaying: boolean;
  soundType: SoundType;
}

export function useAlarmSound({ isPlaying, soundType }: UseAlarmSoundOptions) {
  const intervalRef = useRef<number>();
  const volumeRef = useRef(0.2);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      volumeRef.current = 0.2;
      return;
    }

    startTimeRef.current = Date.now();
    volumeRef.current = 0.2;

    const play = () => {
      // Gradual volume: 20% → 100% over 30 seconds
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      volumeRef.current = Math.min(1, 0.2 + (0.8 * elapsed) / 30);
      playSound(soundType, volumeRef.current);
    };

    play();
    intervalRef.current = window.setInterval(play, 1800);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, soundType]);
}
