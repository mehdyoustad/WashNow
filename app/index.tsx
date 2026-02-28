import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(async () => {
      const seen = await AsyncStorage.getItem('onboarding_done');
      if (seen) {
        router.push('/login');
      } else {
        router.push('/login');
      }
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.circle} />
      <View style={styles.circleSmall} />
      <View style={styles.logo}>
        <Text style={styles.logoIcon}>🚿</Text>
      </View>
      <Text style={styles.title}>WashNow</Text>
      <Text style={styles.subtitle}>Votre voiture lavée à domicile</Text>
      <View style={styles.dots}>
        <View style={[styles.dot, { backgroundColor: '#1a6bff' }]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' },
  circle: { position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: 'rgba(26,107,255,0.08)', top: -100, right: -100 },
  circleSmall: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(26,107,255,0.05)', bottom: 50, left: -50 },
  logo: { width: 90, height: 90, backgroundColor: '#1a6bff', borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#1a6bff', shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  logoIcon: { fontSize: 44 },
  title: { color: 'white', fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 15, marginTop: 8 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 40 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
});