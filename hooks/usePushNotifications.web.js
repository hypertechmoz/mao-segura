export function usePushNotifications() {
  // Web does not support expo-notifications by default without service workers.
  // We return empty values so the app doesn't crash on web.
  return { expoPushToken: '', notification: false };
}
