import React, { useEffect, useRef } from 'react';
import { Linking, LogBox, Platform, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import HelpButton from '../src/components/HelpButton';
import OfflineBanner from '../src/components/OfflineBanner';
import { registerForPushNotifications } from '../src/notifications';
import { initSentry } from '../src/sentry';
import { supabase } from '../src/supabase';
import { ThemeProvider } from '../src/theme';

// Stripe ne supporte pas le web — chargé uniquement sur mobile
const StripeProvider: React.ComponentType<any> = Platform.OS === 'web'
  ? ({ children }: any) => children
  : require('@stripe/stripe-react-native').StripeProvider;

// Supprimer les warnings non-bloquants en développement
LogBox.ignoreLogs([
  'expo-notifications',
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported',
  'Network request failed',
  'TypeError: Network request failed',
]);

// Initialiser Sentry au démarrage
initSentry();

const HIDE_HELP_ON = ['index', 'login', 'onboarding', 'maintenance', 'welcome'];

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const currentScreen = segments[0] ?? 'index';
  const showHelp = !HIDE_HELP_ON.includes(currentScreen);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    registerForPushNotifications();
    checkMaintenance();
    setupDeepLinks();
    return () => { mountedRef.current = false; };
  }, []);

  const checkMaintenance = async () => {
    if (__DEV__) return; // Pas de check maintenance en développement
    try {
      const { data } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();
      if (mountedRef.current && data?.value === true) {
        router.replace('/maintenance' as any);
      }
    } catch {
      // Table pas encore créée — ignorer silencieusement
    }
  };

  const setupDeepLinks = () => {
    const handleUrl = (url: string) => {
      if (!url) return;
      if (url.includes('washnow://booking')) router.push('/booking' as any);
      else if (url.includes('washnow://profile')) router.push('/profile' as any);
      else if (url.includes('washnow://referral')) router.push('/referral' as any);
      else if (url.includes('washnow://history')) router.push('/history' as any);
      else if (url.includes('type=signup') || url.includes('confirmation_token')) {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) router.replace('/welcome' as any);
        });
      }
      else if (url.includes('type=recovery')) router.push('/login' as any);
    };

    Linking.getInitialURL().then(url => { if (url) handleUrl(url); });
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  };

  return (
    <ThemeProvider>
      <StripeProvider publishableKey="pk_test_51T5SSA6QAoOMqjsf8NohyWePnvHDoQiBEKZHwdomkMKbdVOPDO0nYX99gVod0WpmTMyj7A3v0RxeA1SfWteebFTV00a8f7nnik">
        <View style={{ flex: 1 }}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="home" />
            <Stack.Screen name="booking" />
            <Stack.Screen name="confirmation" />
            <Stack.Screen name="tracking" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="subscription" />
            <Stack.Screen name="payment-sheet" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="vehicles" />
            <Stack.Screen name="history" />
            <Stack.Screen name="referral" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="payment-methods" />
            <Stack.Screen name="rewards" />
            <Stack.Screen name="chat" />
            <Stack.Screen name="photos" />
            <Stack.Screen name="widget-preview" />
            <Stack.Screen name="legal" />
            <Stack.Screen name="delete-account" />
            <Stack.Screen name="maintenance" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="support" />
            <Stack.Screen name="washer-profile" />
            <Stack.Screen name="select-washer" />
            <Stack.Screen name="modify-booking" />
            <Stack.Screen name="post-service" />
          </Stack>
          {showHelp && <HelpButton />}
          <OfflineBanner />
        </View>
      </StripeProvider>
    </ThemeProvider>
  );
}
