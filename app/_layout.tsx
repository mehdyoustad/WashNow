import { StripeProvider } from '@stripe/stripe-react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Linking, View } from 'react-native';
import HelpButton from '../src/components/HelpButton';
import OfflineBanner from '../src/components/OfflineBanner';
import { registerForPushNotifications } from '../src/notifications';
import { initSentry } from '../src/sentry';
import { supabase } from '../src/supabase';
import { track } from '../src/analytics';

// Initialiser Sentry au démarrage
initSentry();

// Écrans sur lesquels le bouton Aide ne doit PAS apparaître
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
    track('app_opened');
    setupDeepLinks();
    return () => { mountedRef.current = false; };
  }, []);

  // --- Maintenance ---
  const checkMaintenance = async () => {
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
      // Ignorer les erreurs (table peut ne pas exister encore)
    }
  };

  // --- Deep Links ---
  const setupDeepLinks = () => {
    const handleUrl = (url: string) => {
      if (!url) return;
      // washnow://booking → /booking
      if (url.includes('washnow://booking')) router.push('/booking' as any);
      else if (url.includes('washnow://profile')) router.push('/profile' as any);
      else if (url.includes('washnow://referral')) router.push('/referral' as any);
      else if (url.includes('washnow://history')) router.push('/history' as any);
      // Lien de confirmation email Supabase
      else if (url.includes('type=signup') || url.includes('confirmation_token')) {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) router.replace('/welcome' as any);
        });
      }
      // Reset password
      else if (url.includes('type=recovery')) router.push('/login' as any);
    };

    // Lien initial (app fermée)
    Linking.getInitialURL().then(url => { if (url) handleUrl(url); });

    // Liens entrants (app en fond)
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  };

  return (
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
        </Stack>
        {showHelp && <HelpButton />}
        <OfflineBanner />
      </View>
    </StripeProvider>
  );
}
