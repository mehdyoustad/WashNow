import { StripeProvider } from '@stripe/stripe-react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { registerForPushNotifications } from '../src/notifications';

export default function RootLayout() {
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  return (
    <StripeProvider publishableKey="pk_test_51T5SSA6QAoOMqjsf8NohyWePnvHDoQiBEKZHwdomkMKbdVOPDO0nYX99gVod0WpmTMyj7A3v0RxeA1SfWteebFTV00a8f7nnik">
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
      </Stack>
    </StripeProvider>
  );
}