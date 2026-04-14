import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alarm } from '@/hooks/useAlarms';

/**
 * Monitors alarms every second.
 * When an enabled alarm matches the current time, navigates to /alarm/ringing.
 * Prevents re-triggering the same alarm within the same minute.
 */
export function useAlarmMonitor(alarms: Alarm[]) {
  const navigate = useNavigate();
  const location = useLocation();
  const lastTriggeredRef = useRef<string>('');

  useEffect(() => {
    const check = () => {
      // Don't trigger if already ringing or on victory
      if (location.pathname === '/alarm/ringing' || location.pathname === '/victory') return;

      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const today = now.getDay(); // 0=Sun

      // Check snooze (web fallback)
      const snoozeUntil = localStorage.getItem('wakeup_snooze_until');
      if (snoozeUntil && Date.now() >= Number(snoozeUntil)) {
        localStorage.removeItem('wakeup_snooze_until');
        const snoozeAlarmId = localStorage.getItem('wakeup_snooze_alarm_id');
        if (snoozeAlarmId) {
          localStorage.setItem('wakeup_ringing_alarm_id', snoozeAlarmId);
          localStorage.removeItem('wakeup_snooze_alarm_id');
        }
        navigate('/alarm/ringing');
        return;
      }

      // Prevent re-triggering same minute
      const triggerKey = `${hhmm}-${now.toDateString()}`;
      if (lastTriggeredRef.current === triggerKey) return;

      const match = alarms.find(a => {
        if (!a.enabled) return false;
        if (a.time !== hhmm) return false;
        if (a.days.length > 0 && !a.days.includes(today)) return false;
        return true;
      });

      if (match) {
        lastTriggeredRef.current = triggerKey;
        localStorage.setItem('wakeup_ringing_alarm_id', match.id);
        navigate('/alarm/ringing');
      }
    };

    // Check immediately, then every second
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [alarms, navigate, location.pathname]);
}
