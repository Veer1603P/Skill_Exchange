// Local session reminders using expo-notifications.
// Everything is wrapped in try/catch, so if notifications are unavailable the app still works.
import { Platform } from 'react-native';

export const REMINDER_MINUTES = 15;

// When the reminder should fire: 15 minutes before, or at the start if that is too close. null = too late.
export const reminderTime = (startsAtISO) => {
  const start = new Date(startsAtISO).getTime();
  const now = Date.now();
  let at = start - REMINDER_MINUTES * 60 * 1000;
  if (at < now + 5000) at = start;
  if (at < now + 5000) return null;
  return new Date(at);
};

export async function scheduleSessionReminder({ title, body, date }) {
  try {
    const Notifications = require('expo-notifications');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const current = await Notifications.getPermissionsAsync();
    let status = current.status;
    if (status !== 'granted') {
      const asked = await Notifications.requestPermissionsAsync();
      status = asked.status;
    }
    if (status !== 'granted') return { ok: false, reason: 'permission' };

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('sessions', {
        name: 'Sessions',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const types = Notifications.SchedulableTriggerInputTypes;
    const trigger = types ? { type: types.DATE, date, channelId: 'sessions' } : date;

    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger,
    });
    return { ok: true, id };
  } catch (e) {
    return { ok: false, reason: 'error' };
  }
}

export async function cancelReminder(id) {
  if (!id) return;
  try {
    const Notifications = require('expo-notifications');
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {
    // nothing to cancel
  }
}
