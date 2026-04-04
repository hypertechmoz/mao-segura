import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Only load expo-notifications if we're NOT on Android Expo Go
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const shouldLoadNotifications = !(isExpoGo && Platform.OS === 'android');

let Notifications = null;
if (shouldLoadNotifications) {
  try {
    Notifications = require('expo-notifications');
    
    // Set handler globally if loaded
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    console.warn('Falha ao carregar expo-notifications:', e.message);
  }
}

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Skip everything if notifications are not loaded
    if (!Notifications || !shouldLoadNotifications) {
      if (isExpoGo && Platform.OS === 'android') {
        console.log('Modo Expo Go (Android): Notificações desativadas para evitar erros de sistema.');
      }
      return;
    }

    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Logic for deep linking or handling notifications
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync() {
  if (!Notifications || !shouldLoadNotifications) return undefined;

  let token;

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Padrão',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2E7D32',
      });
    } catch (e) {
      console.warn('Erro ao configurar canal de notificação:', e.message);
    }
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Permissão para notificações não concedida!');
      return undefined;
    }

    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.expoConfig?.projectId;
        if (projectId) {
            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        } else {
            console.warn('Aviso: Nenhum "projectId" encontrado no app.json. Necessário correr "eas init" para notificações reais.');
            return undefined;
        }
    } catch (e) {
        console.warn('Erro ao obter token do Expo:', e.message);
    }
  } else {
    console.log('Push Notifications requerem um dispositivo físico.');
  }

  return token;
}
