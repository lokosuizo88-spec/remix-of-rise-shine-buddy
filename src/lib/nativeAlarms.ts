import { Capacitor } from '@capacitor/core';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Alarm } from '@/hooks/useAlarms';

const NOTIFICATION_CHANNEL_ID = 'wakeup-alarm-channel';

/**
 * Native alarm service using Capacitor LocalNotifications.
 * Schedules repeating notifications with alarm sound for each enabled alarm.
 * On notification tap, opens the app to /alarm/ringing.
 */

export async function initNativeAlarms() {
  if (!Capacitor.isNativePlatform()) return;

  // Request permissions
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== 'granted') {
    console.warn('Notification permissions not granted');
    return;
  }

  // Create alarm channel (Android)
  try {
    await LocalNotifications.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: 'Alarmas WakeUp!',
      description: 'Canal de alarmas con sonido fuerte',
      importance: 5, // MAX importance
      visibility: 1, // PUBLIC
      sound: 'alarm.wav',
      vibration: true,
      lights: true,
    });
  } catch (e) {
    console.log('Channel creation skipped (iOS or already exists)');
  }

  // Listen for notification actions (tap)
  LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    console.log('Notification tapped:', action);
    // Store which alarm was tapped
    const alarmId = action.notification.extra?.alarmId;
    if (alarmId) {
      localStorage.setItem('wakeup_ringing_alarm_id', alarmId);
      localStorage.setItem('wakeup_is_ringing', 'true');
    }
    // Navigate to ringing screen
    window.location.hash = '';
    window.location.href = '/alarm/ringing';
  });

  // Listen for notification received while in foreground
  LocalNotifications.addListener('localNotificationReceived', (notification) => {
    console.log('Notification received in foreground:', notification);
    const alarmId = notification.extra?.alarmId;
    if (alarmId) {
      localStorage.setItem('wakeup_ringing_alarm_id', alarmId);
      localStorage.setItem('wakeup_is_ringing', 'true');
    }
    // Auto-navigate to ringing
    window.location.href = '/alarm/ringing';
  });
}

/**
 * Schedule all enabled alarms as native notifications.
 * Cancels all existing and reschedules from scratch.
 */
export async function syncAlarmsToNative(alarms: Alarm[]) {
  if (!Capacitor.isNativePlatform()) return;

  // Cancel all pending notifications first
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel({ notifications: pending.notifications });
  }

  const enabledAlarms = alarms.filter(a => a.enabled);
  if (enabledAlarms.length === 0) return;

  const notifications: ScheduleOptions['notifications'] = [];

  for (const alarm of enabledAlarms) {
    const [hours, minutes] = alarm.time.split(':').map(Number);

    if (alarm.days.length === 0) {
      // One-time alarm: schedule for next occurrence
      const now = new Date();
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }

      notifications.push({
        id: hashId(alarm.id + '-once'),
        title: '⏰ ¡DESPIERTA!',
        body: alarm.label || '¡Es hora de levantarse! 💪',
        schedule: {
          at: target,
          allowWhileIdle: true,
        },
        sound: 'alarm.wav',
        channelId: NOTIFICATION_CHANNEL_ID,
        actionTypeId: 'ALARM_ACTION',
        extra: { alarmId: alarm.id },
      });
    } else {
      // Repeating alarm: schedule for each day of the week
      for (const day of alarm.days) {
        // Capacitor uses 1=Sunday, 2=Monday... but our days are 0=Sunday
        const weekday = day + 1;

        notifications.push({
          id: hashId(alarm.id + '-day-' + day),
          title: '⏰ ¡DESPIERTA!',
          body: alarm.label || '¡Es hora de levantarse! 💪',
          schedule: {
            on: {
              weekday,
              hour: hours,
              minute: minutes,
            },
            allowWhileIdle: true,
            every: 'week' as any,
          },
          sound: 'alarm.wav',
          channelId: NOTIFICATION_CHANNEL_ID,
          actionTypeId: 'ALARM_ACTION',
          extra: { alarmId: alarm.id },
        });
      }
    }
  }

  if (notifications.length > 0) {
    try {
      await LocalNotifications.schedule({ notifications });
      console.log(`Scheduled ${notifications.length} native alarm(s)`);
    } catch (e) {
      console.error('Failed to schedule notifications:', e);
    }
  }
}

/**
 * Cancel all native alarm notifications
 */
export async function cancelAllNativeAlarms() {
  if (!Capacitor.isNativePlatform()) return;
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel({ notifications: pending.notifications });
  }
}

/**
 * Schedule a snooze notification after N minutes
 */
export async function scheduleSnooze(alarmId: string, minutes: number = 5) {
  if (!Capacitor.isNativePlatform()) {
    // Web fallback: use setTimeout
    localStorage.setItem('wakeup_snooze_until', String(Date.now() + minutes * 60000));
    localStorage.setItem('wakeup_snooze_alarm_id', alarmId);
    return;
  }

  const snoozeTime = new Date(Date.now() + minutes * 60000);
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: hashId('snooze-' + alarmId),
        title: '⏰ ¡DESPIERTA! (Snooze)',
        body: `¡Se acabó el descanso de ${minutes} min! 💪`,
        schedule: {
          at: snoozeTime,
          allowWhileIdle: true,
        },
        sound: 'alarm.wav',
        channelId: NOTIFICATION_CHANNEL_ID,
        actionTypeId: 'ALARM_ACTION',
        extra: { alarmId },
      }],
    });
    console.log(`Snooze scheduled for ${minutes} min`);
  } catch (e) {
    console.error('Failed to schedule snooze:', e);
  }
}

/**
 * Generate a stable numeric ID from a string
 */
function hashId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
