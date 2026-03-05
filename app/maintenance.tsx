import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Maintenance() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔧</Text>
      <Text style={styles.title}>Maintenance en cours</Text>
      <Text style={styles.subtitle}>
        Nous améliorons WashNow pour vous offrir une meilleure expérience.{'\n'}
        Revenez dans quelques instants !
      </Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💬 Pour toute urgence, contactez-nous sur{'\n'}
          <Text style={styles.infoEmail}>support@washnow.fr</Text>
        </Text>
      </View>
      <View style={styles.dots}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 32 },
  emoji: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: 'white', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  infoBox: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, width: '100%', marginBottom: 40 },
  infoText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  infoEmail: { color: '#1a6bff', fontWeight: '700' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { backgroundColor: '#1a6bff', width: 24 },
});
