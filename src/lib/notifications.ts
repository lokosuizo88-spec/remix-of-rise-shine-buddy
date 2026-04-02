import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Alarm } from '@/types/alarm';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleAlarmNotification(alarm: Alarm): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const [hours, minutes] = alarm.time.split(':').map(Number);

  // Cancel existing notification for this alarm
  await cancelAlarmNotification(alarm.id);

  // Build schedule: if days specified, schedule for each day; otherwise schedule for next occurrence
  const now = new Date();

  if (alarm.days.length > 0) {
    // Schedule repeating notifications for each day
    const notifications = alarm.days.map((day, index) => {
      const scheduleDate = getNextOccurrence(hours, minutes, day);
      return {
        id: hashAlarmId(alarm.id) + index,
        title: '🔔 ¡¡DESPIERTA!!',
        body: alarm.label || '¡Es hora de levantarse! 💪',
        schedule: {
          at: scheduleDate,
          repeats: true,
          every: 'week' as const,
          allowWhileIdle: true, // Critical: fires even in Doze mode
        },
        sound: 'alarm.wav',
        channelId: 'wakeup-alarm',
        extra: { alarmId: alarm.id },
        ongoing: true, // Cannot be swiped away
        autoCancel: false, // Stays until dismissed by app
      };
    });

    await LocalNotifications.schedule({ notifications });
  } else {
    // One-time alarm
    const scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);
    if (scheduleDate <= now) scheduleDate.setDate(scheduleDate.getDate() + 1);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: hashAlarmId(alarm.id),
          title: '🔔 ¡¡DESPIERTA!!',
          body: alarm.label || '¡Es hora de levantarse! 💪',
          schedule: {
            at: scheduleDate,
            allowWhileIdle: true,
          },
          sound: 'alarm.wav',
          channelId: 'wakeup-alarm',
          extra: { alarmId: alarm.id },
          ongoing: true,
          autoCancel: false,
        },
      ],
    });
  }
}

export async function cancelAlarmNotification(alarmId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    // Cancel all possible notification IDs for this alarm (base + 7 days)
    const baseId = hashAlarmId(alarmId);
    const ids = Array.from({ length: 7 }, (_, i) => ({ id: baseId + i }));
    await LocalNotifications.cancel({ notifications: ids });
  } catch {}
}

export async function setupNotificationChannel(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: 'wakeup-alarm',
      name: 'Alarmas WakeUp!',
      description: 'Notificaciones de alarma que te despiertan',
      importance: 5, // MAX importance
      visibility: 1, // PUBLIC - shows on lock screen
      vibration: true,
      sound: 'alarm.wav',
      lights: true,
      lightColor: '#a855f7',
    });
  } catch {}
}

export function setupNotificationListeners(onAlarmTrigger: (alarmId: string) => void): void {
  if (!Capacitor.isNativePlatform()) return;

  // When user taps the notification
  LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    const alarmId = action.notification.extra?.alarmId;
    if (alarmId) onAlarmTrigger(alarmId);
  });

  // When notification fires (app in foreground)
  LocalNotifications.addListener('localNotificationReceived', (notification) => {
    const alarmId = notification.extra?.alarmId;
    if (alarmId) onAlarmTrigger(alarmId);
  });
}

// Simple hash to convert UUID string to stable numeric ID
function hashAlarmId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash) % 1000000;
}

function getNextOccurrence(hours: number, minutes: number, targetDay: number): Date {
  const now = new Date();
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  const currentDay = now.getDay();
  let daysUntil = targetDay - currentDay;
  if (daysUntil < 0 || (daysUntil === 0 && date <= now)) {
    daysUntil += 7;
  }
  date.setDate(date.getDate() + daysUntil);
  return date;
}
