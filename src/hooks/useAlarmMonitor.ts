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

      // Prevent re-triggering same minute
      const triggerKey = `${hhmm}-${now.toDateString()}`;
      if (lastTriggeredRef.current === triggerKey) return;

      const match = alarms.find(a => {
        if (!a.enabled) return false;
        if (a.time !== hhmm) return false;
        // If days are set, check if today is included
        if (a.days.length > 0 && !a.days.includes(today)) return false;
        return true;
      });

      if (match) {
        lastTriggeredRef.current = triggerKey;
        // Store which alarm is ringing
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
