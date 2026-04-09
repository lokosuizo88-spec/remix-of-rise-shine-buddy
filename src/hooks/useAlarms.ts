import { useState, useEffect, useCallback } from 'react';
import { AlarmState, DifficultyLevel, ChallengeType } from '@/types/alarm';
import { SoundType } from '@/lib/alarmSounds';

const ALARMS_KEY = 'wakeup_alarms';
const STATE_KEY = 'wakeup_alarm_state';
const STATS_KEY = 'wakeup_stats';

export interface Alarm {
  id: string;
  time: string; // HH:mm
  days: number[]; // 0=Sun, 1=Mon, ...
  enabled: boolean;
  label: string;
  difficulty: DifficultyLevel;
  challengeType: ChallengeType | 'random';
  sound: SoundType;
}

export interface AlarmStats {
  streak: number;
  totalWakeups: number;
  avgTimeToDisable: number;
  lastWakeup: string | null;
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

const defaultState: AlarmState = {
  isRinging: false,
  currentDifficulty: 'suave',
  escapedCount: 0,
  challengeType: 'math',
};

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>(() => loadJSON(ALARMS_KEY, []));
  const [alarmState, setAlarmState] = useState<AlarmState>(() => loadJSON(STATE_KEY, defaultState));
  const [stats, setStats] = useState<AlarmStats>(() => loadJSON(STATS_KEY, {
    streak: 0, totalWakeups: 0, avgTimeToDisable: 0, lastWakeup: null,
  }));

  // Persist alarm state changes
  useEffect(() => {
    localStorage.setItem(STATE_KEY, JSON.stringify(alarmState));
  }, [alarmState]);

  const addAlarm = useCallback((alarm: Omit<Alarm, 'id'>) => {
    const newAlarm: Alarm = { ...alarm, id: crypto.randomUUID() };
    const current = loadJSON<Alarm[]>(ALARMS_KEY, []);
    const updated = [...current, newAlarm];
    localStorage.setItem(ALARMS_KEY, JSON.stringify(updated));
    setAlarms(updated);
    return newAlarm;
  }, []);

  const updateAlarm = useCallback((id: string, changes: Partial<Alarm>) => {
    const current = loadJSON<Alarm[]>(ALARMS_KEY, []);
    const updated = current.map(a => a.id === id ? { ...a, ...changes } : a);
    localStorage.setItem(ALARMS_KEY, JSON.stringify(updated));
    setAlarms(updated);
  }, []);

  const deleteAlarm = useCallback((id: string) => {
    const current = loadJSON<Alarm[]>(ALARMS_KEY, []);
    const updated = current.filter(a => a.id !== id);
    localStorage.setItem(ALARMS_KEY, JSON.stringify(updated));
    setAlarms(updated);
  }, []);

  const toggleAlarm = useCallback((id: string) => {
    const current = loadJSON<Alarm[]>(ALARMS_KEY, []);
    const updated = current.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
    localStorage.setItem(ALARMS_KEY, JSON.stringify(updated));
    setAlarms(updated);
  }, []);

  const recordWakeup = useCallback((timeToDisable: number) => {
    const current = loadJSON<AlarmStats>(STATS_KEY, stats);
    const today = new Date().toDateString();
    const isConsecutive = current.lastWakeup === new Date(Date.now() - 86400000).toDateString();
    const updated: AlarmStats = {
      streak: isConsecutive ? current.streak + 1 : 1,
      totalWakeups: current.totalWakeups + 1,
      avgTimeToDisable: Math.round(
        (current.avgTimeToDisable * current.totalWakeups + timeToDisable) / (current.totalWakeups + 1)
      ),
      lastWakeup: today,
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
    setStats(updated);
  }, [stats]);

  return {
    alarms,
    alarmState,
    setAlarmState,
    stats,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    recordWakeup,
  };
}
