import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

const devLog = (...args: any[]) => {
  if (__DEV__) console.log(...args);
};
const devError = (...args: any[]) => {
  if (__DEV__) console.error(...args);
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    devLog('[Notifications] Push tokens not supported on web');
    return null;
  }

  if (Application.applicationId === 'host.exp.Exponent') {
    devLog('[Notifications] Push tokens not supported in Expo Go — skipping');
    return null;
  }

  if (!Device.isDevice) {
    devLog('[Notifications] Push tokens only work on physical devices');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      devLog('[Notifications] Permission not granted');
      return null;
    }

    let token: string;
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      token = tokenData.data;
      devLog('[Notifications] Expo push token:', token);
    } catch (err: any) {
      devError('[Notifications] getExpoPushTokenAsync failed (missing projectId?):', err.message);
      return null;
    }

    const platform = Platform.OS === 'ios' ? 'ios' : 'android';

    const { error } = await supabase.from('push_tokens').upsert(
      { user_id: userId, token, platform },
      { onConflict: 'user_id,token' },
    );

    if (error) {
      devError('[Notifications] Failed to upsert push token:', error.message);
      return null;
    }

    devLog('[Notifications] Push token registered successfully');
    return token;
  } catch (err: any) {
    devError('[Notifications] registerForPushNotifications error:', err.message);
    return null;
  }
}

export async function setNotificationsEnabled(
  userId: string,
  enabled: boolean,
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('profiles')
    .update({ notifications_enabled: enabled })
    .eq('id', userId);

  if (error) {
    devError('[Notifications] Failed to update notifications_enabled:', error.message);
    return { error: error.message };
  }

  return {};
}

export async function getNotificationsEnabled(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('notifications_enabled')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return true; // default to enabled
  return data.notifications_enabled ?? true;
}
