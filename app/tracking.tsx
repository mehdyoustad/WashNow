import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { PulseIndicator } from '../src/components';
import { notifyWasherEnRoute, notifyWashingDone } from '../src/notifications';

const steps = [
  { icon: '✓', label: 'Réservation confirmée', time: '09:32', done: true },
  { icon: '🚗', label: 'Laveur en route', time: 'Arrivée dans ~8 min', active: true },
  { icon: '🧽', label: 'Prestation en cours', time: '—', done: false },
  { icon: '✨', label: 'Terminé', time: '—', done: false },
];

const washerLocation = { latitude: 48.9200, longitude: 2.4300 };
const clientLocation = { latitude: 48.9350, longitude: 2.4500 };

export default function Tracking() {
  const router = useRouter();
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    // Simule les notifications de statut (en prod : déclenché par webhook Supabase)
    notifyWasherEnRoute('Karim B.');
    const t = setTimeout(() => notifyWashingDone('Lavage complet'), 30000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      {/* Vraie carte Google Maps */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 48.9275,
            longitude: 2.4400,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {/* Marker laveur */}
          <Marker coordinate={washerLocation} title="Karim B." description="Votre laveur">
            <View style={styles.washerMarker}>
              <Text style={{ fontSize: 20 }}>🚗</Text>
            </View>
          </Marker>

          {/* Marker client */}
          <Marker coordinate={clientLocation} title="Votre adresse">
            <View style={styles.clientMarker}>
              <Text style={{ fontSize: 20 }}>📍</Text>
            </View>
          </Marker>

          {/* Ligne de trajet */}
          <Polyline
            coordinates={[washerLocation, clientLocation]}
            strokeColor="#1a6bff"
            strokeWidth={3}
            lineDashPattern={[8, 4]}
          />
        </MapView>

        {/* Status pill */}
        <View style={styles.statusPill}>
          <PulseIndicator />
          <Text style={styles.statusText}>En route · ~8 min</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.washerCard}>
          <View style={styles.washerRow}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 28 }}>👨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.washerName}>Karim B.</Text>
              <View style={styles.ratingRow}>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>⭐ 4.9</Text>
                </View>
                <Text style={styles.washerJobs}>247 lavages</Text>
              </View>
            </View>
          </View>
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactBtn}>
              <Text style={styles.contactText}>📞 Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactBtn}>
              <Text style={styles.contactText}>💬 Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressCard}>
          {steps.map((s, i) => (
            <View key={i}>
              <View style={styles.progRow}>
                <View style={[styles.progIcon, s.done && styles.progDone, s.active && styles.progActive]}>
                  <Text style={{ fontSize: 12, color: s.done || s.active ? 'white' : '#999' }}>{s.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.progLabel}>{s.label}</Text>
                  <Text style={styles.progTime}>{s.time}</Text>
                </View>
              </View>
              {i < steps.length - 1 && (
                <View style={[styles.progLine, s.done && styles.progLineDone]} />
              )}
            </View>
          ))}
        </View>

        <View style={styles.infoBar}>
          <Text style={styles.infoText}>
            Lavage complet · Peugeot 308 · <Text style={{ fontWeight: '700', color: '#0a0a0a' }}>49€</Text>
          </Text>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/booking')}>
          <Text style={styles.navIcon}>＋</Text>
          <Text style={styles.navLabel}>Réserver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📍</Text>
          <Text style={[styles.navLabel, { color: '#1a6bff' }]}>Suivi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  mapContainer: { height: 280, position: 'relative' },
  map: { width: '100%', height: '100%' },
  washerMarker: { backgroundColor: 'white', borderRadius: 20, padding: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  clientMarker: { backgroundColor: 'white', borderRadius: 20, padding: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  statusPill: { position: 'absolute', top: 16, alignSelf: 'center', left: '15%', right: '15%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'white', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 50, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
  statusText: { fontSize: 13, fontWeight: '700', color: '#1a6bff' },
  scroll: { flex: 1, padding: 20 },
  washerCard: { backgroundColor: '#f5f5f5', borderRadius: 16, padding: 18, marginBottom: 16 },
  washerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatar: { width: 56, height: 56, backgroundColor: '#1a6bff', borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  washerName: { fontSize: 16, fontWeight: '700', color: '#0a0a0a' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  ratingBadge: { backgroundColor: '#0a0a0a', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  ratingText: { color: 'white', fontSize: 12, fontWeight: '700' },
  washerJobs: { fontSize: 12, color: '#999' },
  contactRow: { flexDirection: 'row', gap: 10 },
  contactBtn: { flex: 1, padding: 12, borderWidth: 2, borderColor: '#e8e8e8', backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
  contactText: { fontSize: 13, fontWeight: '600', color: '#0a0a0a' },
  progressCard: { backgroundColor: '#f5f5f5', borderRadius: 16, padding: 18, marginBottom: 16 },
  progRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  progIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e8e8e8', justifyContent: 'center', alignItems: 'center' },
  progDone: { backgroundColor: '#00c853' },
  progActive: { backgroundColor: '#1a6bff' },
  progLabel: { fontSize: 14, fontWeight: '600', color: '#0a0a0a', marginTop: 4 },
  progTime: { fontSize: 12, color: '#999', marginTop: 2 },
  progLine: { width: 2, height: 20, backgroundColor: '#e8e8e8', marginLeft: 15, marginVertical: 4 },
  progLineDone: { backgroundColor: '#00c853' },
  infoBar: { backgroundColor: '#f5f5f5', borderRadius: 16, padding: 16, alignItems: 'center' },
  infoText: { fontSize: 14, color: '#555' },
  bottomNav: { flexDirection: 'row', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e8e8e8', paddingBottom: 24, paddingTop: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, fontWeight: '600', color: '#999' },
});