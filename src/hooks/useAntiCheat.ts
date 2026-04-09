import { useEffect, useRef } from 'react';
import { AlarmState, DifficultyLevel } from '@/types/alarm';

const STATE_KEY = 'wakeup_alarm_state';
const ESCAPE_TS_KEY = 'wakeup_escape_ts';

const nextDifficulty: Record<DifficultyLevel, DifficultyLevel> = {
  suave: 'medio',
  medio: 'bestia',
  bestia: 'imposible',
  imposible: 'imposible',
};

interface UseAntiCheatOptions {
  isRinging: boolean;
  alarmState: AlarmState;
  onEscapeDetected: (newDifficulty: DifficultyLevel, escapeCount: number) => void;
}

/**
 * Anti-cheat system:
 * 1. Detects tab visibility changes (switching to another app/tab)
 * 2. Detects beforeunload (closing the app/tab)
 * 3. Persists ringing state so reopening bumps difficulty
 * 4. Prevents back navigation during alarm
 */
export function useAntiCheat({ isRinging, alarmState, onEscapeDetected }: UseAntiCheatOptions) {
  const escapeCountRef = useRef(alarmState.escapedCount);

  // Track visibility changes (tab/app switch)
  useEffect(() => {
    if (!isRinging) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away — record timestamp
        localStorage.setItem(ESCAPE_TS_KEY, Date.now().toString());
      } else {
        // User came back — penalize
        const escapeTs = localStorage.getItem(ESCAPE_TS_KEY);
        if (escapeTs) {
          const elapsed = Date.now() - parseInt(escapeTs);
          // Only penalize if they were away more than 2 seconds (not accidental)
          if (elapsed > 2000) {
            escapeCountRef.current += 1;
            const newDiff = nextDifficulty[alarmState.currentDifficulty];
            onEscapeDetected(newDiff, escapeCountRef.current);
          }
          localStorage.removeItem(ESCAPE_TS_KEY);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRinging, alarmState.currentDifficulty, onEscapeDetected]);

  // Prevent beforeunload
  useEffect(() => {
    if (!isRinging) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '¡No puedes escapar! 😈';
      // Mark as escape attempt
      localStorage.setItem(ESCAPE_TS_KEY, Date.now().toString());
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isRinging]);

  // Prevent back navigation
  useEffect(() => {
    if (!isRinging) return;

    const pushState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    pushState();

    const handlePopState = () => {
      pushState();
      escapeCountRef.current += 1;
      const newDiff = nextDifficulty[alarmState.currentDifficulty];
      onEscapeDetected(newDiff, escapeCountRef.current);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isRinging, alarmState.currentDifficulty, onEscapeDetected]);

  // Request fullscreen and re-request if exited
  useEffect(() => {
    if (!isRinging) return;

    const requestFS = () => {
      try {
        document.documentElement.requestFullscreen?.();
      } catch {
        // Fullscreen might be blocked by browser policy
      }
    };

    requestFS();

    const handleFSChange = () => {
      if (!document.fullscreenElement && isRinging) {
        // They exited fullscreen — penalize and re-request
        escapeCountRef.current += 1;
        const newDiff = nextDifficulty[alarmState.currentDifficulty];
        onEscapeDetected(newDiff, escapeCountRef.current);
        setTimeout(requestFS, 500);
      }
    };

    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, [isRinging, alarmState.currentDifficulty, onEscapeDetected]);

  // Keep wake lock active
  useEffect(() => {
    if (!isRinging) return;

    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        wakeLock = await navigator.wakeLock?.request('screen');
      } catch {
        // Wake lock might not be supported or permission denied
      }
    };

    requestWakeLock();

    return () => {
      wakeLock?.release();
    };
  }, [isRinging]);
}
