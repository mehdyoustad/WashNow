import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Confirmation() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={{ fontSize: 52 }}>✅</Text>
      </View>
      <Text style={styles.title}>Réservation confirmée !</Text>
      <Text style={styles.sub}>Votre laveur sera chez vous à l'heure choisie. Vous recevrez une notification.</Text>
      <View style={styles.details}>
        {[
          { label: 'Service', value: 'Lavage complet' },
          { label: 'Date', value: 'Dim. 2 mars, 10h00' },
          { label: 'Adresse', value: '12 rue de Paris, Drancy' },
          { label: 'Total', value: '39€', blue: true },
        ].map((row, i) => (
          <View key={i} style={[styles.detailRow, i > 0 && { borderTopWidth: 1, borderTopColor: '#e8e8e8' }]}>
            <Text style={styles.detailLabel}>{row.label}</Text>
            <Text style={[styles.detailValue, row.blue && { color: '#1a6bff' }]}>{row.value}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/tracking')}>
        <Text style={styles.btnPrimaryText}>Suivre la mission</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/home')}>
        <Text style={styles.btnSecondaryText}>Retour à l'accueil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 32 },
  iconWrap: { width: 100, height: 100, backgroundColor: '#e8faf0', borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '700', color: '#0a0a0a', textAlign: 'center' },
  sub: { color: '#999', fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  details: { backgroundColor: '#f5f5f5', borderRadius: 16, padding: 20, width: '100%', marginTop: 28, marginBottom: 28 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  detailLabel: { fontSize: 14, color: '#999' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#0a0a0a' },
  btnPrimary: { backgroundColor: '#1a6bff', borderRadius: 50, padding: 18, alignItems: 'center', width: '100%', marginBottom: 12 },
  btnPrimaryText: { color: 'white', fontSize: 16, fontWeight: '700' },
  btnSecondary: { backgroundColor: '#f5f5f5', borderRadius: 50, padding: 18, alignItems: 'center', width: '100%' },
  btnSecondaryText: { color: '#0a0a0a', fontSize: 15, fontWeight: '600' },
});