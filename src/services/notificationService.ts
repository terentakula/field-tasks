import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// В Expo Go модуль уведомлений падает при загрузке, поэтому подключаем его только в APK
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const Notifications: typeof import('expo-notifications') | null = isExpoGo
  ? null
  : require('expo-notifications');

export const notificationsSupported = !isExpoGo;

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const REMINDER_MS = 30 * 60 * 1000;
const DEMO_MS = 45 * 1000;

async function ensurePermission(): Promise<boolean> {
    if (!Notifications) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Task reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const request = await Notifications.requestPermissionsAsync();
  return request.granted;
}

// Возвращает id уведомления или undefined, если не запланировано
export async function scheduleReminder(
  taskId: string,
  title: string,
  dueDateIso: string,
  demoMode: boolean
): Promise<string | undefined> {
    if (!Notifications) return undefined;
  const allowed = await ensurePermission();
  if (!allowed) return undefined;

  const due = new Date(dueDateIso).getTime();
  let fireAt: number;

  if (demoMode) {
    fireAt = Date.now() + DEMO_MS;
  } else {
    if (due <= Date.now()) return undefined; // срок уже прошёл
    // Если до срока меньше 30 минут — напоминаем через 5 секунд
    fireAt = Math.max(due - REMINDER_MS, Date.now() + 5000);
  }

  return Notifications.scheduleNotificationAsync({
    content: { title: 'Task due soon', body: `"${title}" is due in 30 minutes or less`, data: { taskId } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(fireAt),
      channelId: 'reminders',
    },
  });
}

export async function cancelReminder(notificationId?: string) {
  if (Notifications && notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}