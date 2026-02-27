import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const plans = [
  { id: 1, name: 'Essentiel', washes: '2 lavages / mois', price: '49', features: ['2 lavages extérieur inclus', 'Report possible', 'Sans engagement'] },
  { id: 2, name: 'Premium', washes: '4 lavages / mois', price: '89', popular: true, features: ['4 lavages au choix inclus', 'Priorité de réservation', 'Points fidélité x2', 'Sans engagement'] },
  { id: 3, name: 'Entreprise', washes: 'Flotte & B2B', price: null, features: ['Flotte multi-véhicules', 'Facturation entreprise', 'Account manager dédié'] },
];

export default function Subscription() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(2);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Abonnements</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Économisez jusqu'à 20% sur chaque lavage avec un abonnement mensuel.</Text>
        {plans.map(p => (
          <TouchableOpacity key={p.id} style={[styles.card, p.popular && styles.cardPopular, selected === p.id && styles.cardSelected]} onPress={() => setSelected(p.id)}>
            {p.popular && <View style={styles.popularTag}><Text style={styles.popularText}>⭐ Le plus populaire</Text></View>}
            <Text style={styles.planName}>{p.name}</Text>
            <Text style={styles.planWashes}>{p.washes}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{p.price ? `${p.price}€` : 'Sur devis'}</Text>
              {p.price && <Text style={styles.period}>/mois</Text>}
            </View>
            {p.features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.check}>✓</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.btnPrimary}>
          <Text style={styles.btnPrimaryText}>Choisir mon abonnement</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  backBtn: { width: 40, height: 40, backgroundColor: '#f5f5f5', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 18 },
  title: { fontSize: 18, fontWeight: '700', color: '#0a0a0a' },
  scroll: { flex: 1, padding: 20 },
  subtitle: { fontSize: 14, color: '#999', marginBottom: 20, lineHeight: 20 },
  card: { borderWidth: 2, borderColor: '#e8e8e8', borderRadius: 16, padding: 20, marginBottom: 16, position: 'relative', paddingTop: 24 },
  cardPopular: { borderColor: '#1a6bff' },
  cardSelected: { backgroundColor: '#e8f0ff' },
  popularTag: { position: 'absolute', top: -14, alignSelf: 'center', backgroundColor: '#1a6bff', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  popularText: { color: 'white', fontSize: 11, fontWeight: '700' },
  planName: { fontSize: 20, fontWeight: '700', color: '#0a0a0a' },
  planWashes: { fontSize: 14, color: '#999', marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginVertical: 14 },
  price: { fontSize: 32, fontWeight: '700', color: '#0a0a0a' },
  period: { fontSize: 14, color: '#999', paddingBottom: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  check: { color: '#00c853', fontWeight: '700', fontSize: 14 },
  featureText: { fontSize: 13, color: '#555' },
  btnPrimary: { backgroundColor: '#1a6bff', borderRadius: 50, padding: 18, alignItems: 'center', marginTop: 8 },
  btnPrimaryText: { color: 'white', fontSize: 16, fontWeight: '700' },
});