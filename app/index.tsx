import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Splash() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoIcon}>🚿</Text>
      </View>
      <Text style={styles.title}>WashNow</Text>
      <Text style={styles.subtitle}>Le lavage auto à la demande</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.push('/login')}>
        <Text style={styles.btnText}>Commencer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  logo: { width: 90, height: 90, backgroundColor: '#1a6bff', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  logoIcon: { fontSize: 40 },
  title: { fontSize: 36, fontWeight: '700', color: 'white', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#888', marginTop: 8 },
  btn: { marginTop: 60, backgroundColor: '#1a6bff', paddingHorizontal: 48, paddingVertical: 18, borderRadius: 50 },
  btnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});