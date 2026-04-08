import { useState, useEffect, useCallback, useRef } from 'react';
import { Alarm, AlarmState, AlarmStats, DifficultyLevel } from '@/types/alarm';
import {
  scheduleAlarmNotification,
  cancelAlarmNotification,
  setupNotificationChannel,
  setupNotificationListeners,
  requestNotificationPermission,
} from '@/lib/notifications';

const ALARMS_KEY = 'wakeup_alarms';
const STATE_KEY = 'wakeup_alarm_state';
const STATS_KEY = 'wakeup_stats';

const nextDifficulty: Record<DifficultyLevel, DifficultyLevel> = {
  suave: 'medio',
  medio: 'bestia',
  bestia: 'imposible',
  imposible: 'imposible',
};

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>(() => loadJSON(ALARMS_KEY, []));
  const [alarmState, setAlarmState] = useState<AlarmState>(() =>
    loadJSON(STATE_KEY, {
      isRinging: false,
      alarmId: null,
      currentDifficulty: 'suave' as DifficultyLevel,
      escapedCount: 0,
      challengeIndex: 0,
      totalChallenges: 1,
      startedAt: null,
    })
  );
  const [stats, setStats] = useState<AlarmStats>(() =>
    loadJSON(STATS_KEY, {
      streak: 0,
      totalAlarms: 0,
      avgTimeToDisable: 0,
      lastWakeUp: null,
      weeklyTimes: [0, 0, 0, 0, 0, 0, 0],
    })
  );

  const checkIntervalRef = useRef<number>();

  useEffect(() => {
    localStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem(STATE_KEY, JSON.stringify(alarmState));
  }, [alarmState]);

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  // Check on mount if alarm was ringing (anti-cheat)
  useEffect(() => {
    const saved = loadJSON<AlarmState>(STATE_KEY, alarmState);
    if (saved.isRinging) {
      const newDifficulty = nextDifficulty[saved.currentDifficulty];
      setAlarmState({
        ...saved,
        currentDifficulty: newDifficulty,
        escapedCount: saved.escapedCount + 1,
      });
    }
  }, []);

  // Initialize native notifications on mount
  useEffect(() => {
    (async () => {
      await requestNotificationPermission();
      await setupNotificationChannel();
      setupNotificationListeners((alarmId) => {
        const alarm = alarms.find(a => a.id === alarmId);
        if (alarm) triggerAlarm(alarm);
      });
    })();
  }, []);

  // Sync native notifications whenever alarms change
  useEffect(() => {
    (async () => {
      for (const alarm of alarms) {
        if (alarm.enabled) {
          await scheduleAlarmNotification(alarm);
        } else {
          await cancelAlarmNotification(alarm.id);
        }
      }
    })();
  }, [alarms]);

  const addAlarm = useCallback((alarm: Omit<Alarm, 'id'>) => {
    const newAlarm: Alarm = { ...alarm, id: crypto.randomUUID() };
    const current = loadJSON<Alarm[]>(ALARMS_KEY, []);
    const updated = [...current, newAlarm];
    localStorage.setItem(ALARMS_KEY, JSON.stringify(updated));
    setAlarms(updated);
    return newAlarm;
  }, []);

  const updateAlarm = useCallback((id: string, updates: Partial<Alarm>) => {
    const current = loadJSON<Alarm[]>(ALARMS_KEY, []);
    const updated = current.map(a => (a.id === id ? { ...a, ...updates } : a));
    localStorage.setItem(ALARMS_KEY, JSON.stringify(updated));
    setAlarms(updated);
  }, []);

  const deleteAlarm = useCallback((id: string) => {
    cancelAlarmNotification(id);
    const current = loadJSON<Alarm[]>(ALARMS_KEY, []);
    const updated = current.filter(a => a.id !== id);
    localStorage.setItem(ALARMS_KEY, JSON.stringify(updated));
    setAlarms(updated);
  }, []);

  const toggleAlarm = useCallback((id: string) => {
    const current = loadJSON<Alarm[]>(ALARMS_KEY, []);
    const updated = current.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    localStorage.setItem(ALARMS_KEY, JSON.stringify(updated));
    setAlarms(updated);
  }, []);

  const triggerAlarm = useCallback((alarm: Alarm) => {
    setAlarmState({
      isRinging: true,
      alarmId: alarm.id,
      currentDifficulty: alarm.difficulty,
      escapedCount: 0,
      challengeIndex: 0,
      totalChallenges: 1,
      startedAt: Date.now(),
    });
  }, []);

  const dismissAlarm = useCallback(() => {
    const elapsed = alarmState.startedAt ? (Date.now() - alarmState.startedAt) / 1000 : 0;
    const today = new Date().toISOString().split('T')[0];

    setStats(prev => {
      const newTotal = prev.totalAlarms + 1;
      const newAvg = (prev.avgTimeToDisable * prev.totalAlarms + elapsed) / newTotal;
      const isConsecutive = prev.lastWakeUp
        ? new Date(today).getTime() - new Date(prev.lastWakeUp).getTime() <= 86400000 * 1.5
        : true;
      const weeklyTimes = [...prev.weeklyTimes.slice(1), Math.round(elapsed)];

      return {
        streak: isConsecutive ? prev.streak + 1 : 1,
        totalAlarms: newTotal,
        avgTimeToDisable: Math.round(newAvg),
        lastWakeUp: today,
        weeklyTimes,
      };
    });

    setAlarmState({
      isRinging: false,
      alarmId: null,
      currentDifficulty: 'suave',
      escapedCount: 0,
      challengeIndex: 0,
      totalChallenges: 1,
      startedAt: null,
    });
  }, [alarmState.startedAt]);

  // Check alarms every second
  useEffect(() => {
    checkIntervalRef.current = window.setInterval(() => {
      if (alarmState.isRinging) return;

      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentDay = now.getDay();

      const matchingAlarm = alarms.find(
        a => a.enabled && a.time === currentTime && (a.days.length === 0 || a.days.includes(currentDay))
      );

      if (matchingAlarm) {
        triggerAlarm(matchingAlarm);
      }
    }, 1000);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [alarms, alarmState.isRinging, triggerAlarm]);

  const getNextAlarm = useCallback((): Alarm | null => {
    const enabled = alarms.filter(a => a.enabled);
    if (enabled.length === 0) return null;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let closest: Alarm | null = null;
    let minDiff = Infinity;

    for (const alarm of enabled) {
      const [h, m] = alarm.time.split(':').map(Number);
      const alarmMinutes = h * 60 + m;
      let diff = alarmMinutes - nowMinutes;
      if (diff <= 0) diff += 1440;
      if (diff < minDiff) {
        minDiff = diff;
        closest = alarm;
      }
    }

    return closest;
  }, [alarms]);

  return {
    alarms,
    alarmState,
    stats,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    triggerAlarm,
    dismissAlarm,
    getNextAlarm,
  };
}
