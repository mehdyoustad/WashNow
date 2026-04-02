import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure le comportement d'affichage des notifications en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  // Canal Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('washnow', {
      name: 'WashNow',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1a6bff',
    });
  }

  try {
    // getExpoPushTokenAsync n'est pas disponible dans Expo Go SDK 53+
    // Fonctionne uniquement avec un development build ou en production
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch {
    // Silencieux en dev / Expo Go — pas bloquant
    return null;
  }
}

// Programmer un rappel de RDV (X secondes avant - en prod : timestamp réel)
export async function scheduleBookingReminder(
  serviceLabel: string,
  dateLabel: string,
  secondsFromNow: number = 5
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🚿 Rappel WashNow',
      body: `Votre ${serviceLabel} est prévu le ${dateLabel}. Préparez votre véhicule !`,
      data: { type: 'reminder' },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: secondsFromNow },
  });
}

// Notification immédiate "laveur en route"
export async function notifyWasherEnRoute(washerName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🚗 Laveur en route !',
      body: `${washerName} est en chemin vers vous. Arrivée estimée : 10 min.`,
      data: { type: 'en_route' },
    },
    trigger: null,
  });
}

// Notification immédiate "prestation terminée"
export async function notifyWashingDone(serviceLabel: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✅ Lavage terminé !',
      body: `Votre ${serviceLabel} est terminé. Bonne route !`,
      data: { type: 'done' },
    },
    trigger: null,
  });
}
