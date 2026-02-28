import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { scheduleBookingReminder } from '../src/notifications';

const WATER_SAVED_LITERS = 145; // 150L traditionnel - 5L WashNow
const CO2_SAVED_KG = 0.5;

export default function Confirmation() {
  const router = useRouter();

  useEffect(() => {
    // Programmer un rappel 5 secondes après confirmation (démo)
    // En production : calculer le vrai delta jusqu'au RDV
    scheduleBookingReminder('Lavage complet', 'Dim. 2 mars, 10h00', 5);
  }, []);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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

      {/* Éco-impact */}
      <View style={styles.ecoCard}>
        <Text style={styles.ecoTitle}>🌱 Votre impact écologique</Text>
        <Text style={styles.ecoSub}>Ce lavage WashNow vs un lavage traditionnel (150L)</Text>
        <View style={styles.ecoRow}>
          <View style={styles.ecoStat}>
            <Text style={styles.ecoStatNum}>{WATER_SAVED_LITERS}L</Text>
            <Text style={styles.ecoStatLabel}>💧 eau économisée</Text>
          </View>
          <View style={styles.ecoSep} />
          <View style={styles.ecoStat}>
            <Text style={styles.ecoStatNum}>{CO2_SAVED_KG}kg</Text>
            <Text style={styles.ecoStatLabel}>♻️ CO₂ évité</Text>
          </View>
          <View style={styles.ecoSep} />
          <View style={styles.ecoStat}>
            <Text style={styles.ecoStatNum}>5L</Text>
            <Text style={styles.ecoStatLabel}>🚿 utilisés</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/tracking')}>
        <Text style={styles.btnPrimaryText}>Suivre la mission</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/home')}>
        <Text style={styles.btnSecondaryText}>Retour à l'accueil</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'white' },
  container: { alignItems: 'center', padding: 32, paddingTop: 60 },
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
  ecoCard: { backgroundColor: '#e8faf0', borderRadius: 16, padding: 18, width: '100%', marginBottom: 20 },
  ecoTitle: { fontSize: 15, fontWeight: '700', color: '#0a0a0a', marginBottom: 4 },
  ecoSub: { fontSize: 12, color: '#555', marginBottom: 14 },
  ecoRow: { flexDirection: 'row', alignItems: 'center' },
  ecoStat: { flex: 1, alignItems: 'center' },
  ecoStatNum: { fontSize: 20, fontWeight: '700', color: '#00c853' },
  ecoStatLabel: { fontSize: 11, color: '#555', marginTop: 3, textAlign: 'center' },
  ecoSep: { width: 1, height: 40, backgroundColor: '#c8e6c9' },
});