import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function getPenaltyMessage(daysMissed) {
  if (daysMissed === 0) return '오늘도 햄찌랑 운동했어요! 내일도 화이팅 💪';
  if (daysMissed === 1) return '햄찌가 오늘 밥을 못 먹었어요 🐹';
  if (daysMissed === 2) return '햄찌가 아파요... 빨리 와줘 🤒';
  return '햄찌가 쓰러졌어요!! 빨리 운동하러 가요 😵';
}

export function usePushNotifications(lastLogDate) {
  useEffect(() => {
    if (lastLogDate === undefined) return; // skip during onboarding
    scheduleDailyReminder(lastLogDate);
  }, [lastLogDate]);
}

export async function scheduleDailyReminder(lastLogDate) {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    // Cancel previous scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const today = new Date().toDateString();
    const last = lastLogDate ? new Date(lastLogDate) : null;
    const daysMissed = last
      ? Math.floor((new Date(today) - last) / 86400000)
      : 0;

    const body = getPenaltyMessage(daysMissed);

    // Schedule daily at 20:00
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🐹 햄찌는 영차영차',
        body,
        sound: true,
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      },
    });
  } catch (e) {
    // silently fail
  }
}
