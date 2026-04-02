import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { PulseIndicator } from '../src/components';
import TabBar from '../src/components/TabBar';
import { notifyWasherEnRoute, notifyWashingDone } from '../src/notifications';
import { useTheme } from '../src/theme';

const steps = [
  { label: 'Réservation confirmée', time: '09:32', done: true },
  { label: 'Laveur en route', time: 'Arrivée dans ~8 min', active: true },
  { label: 'Prestation en cours', time: '—', done: false },
  { label: 'Terminé', time: '—', done: false },
];

const washerLocation = { latitude: 48.9200, longitude: 2.4300 };
const clientLocation = { latitude: 48.9350, longitude: 2.4500 };

export default function Tracking() {
  const router = useRouter();
  const { colors } = useTheme();
  const notifiedRef = useRef(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    notifyWasherEnRoute('Karim B.');
    const t = setTimeout(() => notifyWashingDone('Lavage complet'), 30000);
    return () => clearTimeout(t);
  }, []);

  const handleCancel = () => {
    Alert.alert(
      'Annuler la réservation ?',
      'Karim B. est en route. Annuler maintenant est gratuit.\nAprès son arrivée, des frais de 5€ s\'appliquent.',
      [
        { text: 'Garder ma réservation', style: 'cancel' },
        {
          text: 'Annuler quand même',
          style: 'destructive',
          onPress: () => {
            setCancelling(true);
            // TODO: supabase.from('bookings').update({ status: 'annulé' })
            Alert.alert(
              'Réservation annulée',
              'Votre réservation a été annulée. Le remboursement apparaîtra sous 3-5 jours ouvrés.',
              [{ text: 'OK', onPress: () => router.replace('/home' as any) }]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>

      {/* Carte */}
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
          <Marker coordinate={washerLocation} title="Karim B." description="Votre laveur">
            <View style={styles.washerMarker}>
              <View style={styles.washerMarkerDot} />
            </View>
          </Marker>
          <Marker coordinate={clientLocation} title="Votre adresse">
            <View style={styles.clientMarker}>
              <View style={styles.clientMarkerDot} />
            </View>
          </Marker>
          <Polyline
            coordinates={[washerLocation, clientLocation]}
            strokeColor="#1558E7"
            strokeWidth={3}
            lineDashPattern={[8, 4]}
          />
        </MapView>

        <View style={styles.statusPill}>
          <PulseIndicator />
          <Text style={styles.statusText}>En route · ~8 min</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Laveur */}
        <View style={[styles.washerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.washerRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>K</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.washerName, { color: colors.text }]}>Karim B.</Text>
              <View style={styles.ratingRow}>
                <View style={[styles.ratingBadge, { backgroundColor: colors.cardAlt }]}>
                  <Text style={[styles.ratingText, { color: colors.text }]}>4.9 / 5</Text>
                </View>
                <Text style={[styles.washerJobs, { color: colors.textSub }]}>247 lavages</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.profileBtn, { borderColor: colors.border }]}
              onPress={() => router.push('/washer-profile' as any)}
            >
              <Text style={[styles.profileBtnText, { color: colors.primary }]}>Voir profil</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contactRow}>
            <TouchableOpacity style={[styles.contactBtn, { borderColor: colors.border }]}>
              <Text style={[styles.contactText, { color: colors.text }]}>Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactBtn, { borderColor: colors.border }]}
              onPress={() => router.push('/chat' as any)}
            >
              <Text style={[styles.contactText, { color: colors.text }]}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Étapes */}
        <View style={[styles.stepsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {steps.map((s, i) => (
            <View key={i}>
              <View style={styles.stepRow}>
                <View style={[
                  styles.stepDot,
                  s.done && { backgroundColor: colors.success },
                  (s as any).active && { backgroundColor: colors.primary },
                  !s.done && !(s as any).active && { backgroundColor: colors.border },
                ]}>
                  {s.done && <Text style={styles.stepCheck}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.stepLabel,
                    { color: (s as any).active || s.done ? colors.text : colors.textMuted },
                    (s as any).active && { fontWeight: '700' },
                  ]}>
                    {s.label}
                  </Text>
                  <Text style={[styles.stepTime, { color: colors.textSub }]}>{s.time}</Text>
                </View>
              </View>
              {i < steps.length - 1 && (
                <View style={[
                  styles.stepLine,
                  { backgroundColor: s.done ? colors.success : colors.border },
                ]} />
              )}
            </View>
          ))}
        </View>

        {/* Info */}
        <View style={[styles.infoBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoText, { color: colors.textSub }]}>
            Lavage complet · Peugeot 308 ·{' '}
            <Text style={[styles.infoPrice, { color: colors.primary }]}>49€</Text>
          </Text>
        </View>

        {/* Photos */}
        <TouchableOpacity
          style={[styles.actionRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/photos' as any)}
        >
          <View style={[styles.actionIconBox, { backgroundColor: colors.cardAlt }]}>
            <Text style={[styles.actionIconText, { color: colors.primary }]}>PH</Text>
          </View>
          <Text style={[styles.actionText, { color: colors.text }]}>Photos avant / après</Text>
          <Text style={[styles.actionArrow, { color: colors.textSub }]}>›</Text>
        </TouchableOpacity>

        {/* Annulation */}
        <TouchableOpacity
          style={[styles.cancelRow, { borderColor: colors.danger + '40' }]}
          onPress={handleCancel}
        >
          <Text style={[styles.cancelText, { color: colors.danger }]}>Annuler la réservation</Text>
          <Text style={[styles.cancelPolicy, { color: colors.textMuted }]}>Gratuit avant l'arrivée du laveur</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      <TabBar active="tracking" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { height: 280, position: 'relative' },
  map: { width: '100%', height: '100%' },
  washerMarker: { width: 36, height: 36, backgroundColor: '#FFFFFF', borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 4, borderWidth: 2, borderColor: '#1558E7' },
  washerMarkerDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#1558E7' },
  clientMarker: { width: 30, height: 30, backgroundColor: '#FFFFFF', borderRadius: 15, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, elevation: 3, borderWidth: 2, borderColor: '#6B7280' },
  clientMarkerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6B7280' },
  statusPill: { position: 'absolute', top: 16, alignSelf: 'center', left: '15%', right: '15%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  statusText: { fontSize: 13, fontWeight: '700', color: '#1558E7' },
  scroll: { flex: 1, padding: 16 },
  washerCard: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  washerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  avatar: { width: 52, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  washerName: { fontSize: 16, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  ratingBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  ratingText: { fontSize: 12, fontWeight: '600' },
  washerJobs: { fontSize: 12 },
  profileBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  profileBtnText: { fontSize: 12, fontWeight: '600' },
  contactRow: { flexDirection: 'row', gap: 10 },
  contactBtn: { flex: 1, padding: 12, borderWidth: 1.5, borderRadius: 8, alignItems: 'center' },
  contactText: { fontSize: 13, fontWeight: '600' },
  stepsCard: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  stepDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  stepCheck: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  stepLabel: { fontSize: 14, marginTop: 4 },
  stepTime: { fontSize: 12, marginTop: 2 },
  stepLine: { width: 2, height: 18, marginLeft: 13, marginVertical: 4 },
  infoBar: { borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 10, borderWidth: 1 },
  infoText: { fontSize: 13 },
  infoPrice: { fontWeight: '700' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1 },
  actionIconBox: { width: 38, height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  actionIconText: { fontSize: 11, fontWeight: '800' },
  actionText: { flex: 1, fontSize: 14, fontWeight: '600' },
  actionArrow: { fontSize: 20 },
  cancelRow: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  cancelText: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  cancelPolicy: { fontSize: 11 },
});
