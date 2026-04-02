import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../src/supabase';
import { useTheme } from '../src/theme';

// En production: recevoir via route params
const BOOKING = {
  id: 'b1',
  service: 'Lavage complet',
  currentDate: 'Sam. 15 mars 2025',
  currentTime: '10h00',
  address: '12 rue de Paris, Drancy',
  washer: 'Karim B.',
  vehicle: 'Peugeot 308',
  price: '39€',
  status: 'confirmé',
};

const DATES = [
  { label: 'Aujourd\'hui', sublabel: '15 mars', value: '2025-03-15' },
  { label: 'Demain', sublabel: '16 mars', value: '2025-03-16' },
  { label: 'Lun.', sublabel: '17 mars', value: '2025-03-17' },
  { label: 'Mar.', sublabel: '18 mars', value: '2025-03-18' },
  { label: 'Mer.', sublabel: '19 mars', value: '2025-03-19' },
  { label: 'Jeu.', sublabel: '20 mars', value: '2025-03-20' },
  { label: 'Ven.', sublabel: '21 mars', value: '2025-03-21' },
];

const TIME_SLOTS = [
  { time: '08h00', available: true },
  { time: '09h00', available: true },
  { time: '10h00', available: false },
  { time: '11h00', available: true },
  { time: '14h00', available: true },
  { time: '15h00', available: true },
  { time: '16h00', available: false },
  { time: '17h00', available: true },
];

export default function ModifyBooking() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(DATES[0].value);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const hasChanges = selectedTime !== null && (
    selectedDate !== '2025-03-15' || selectedTime !== BOOKING.currentTime
  );

  const handleSave = async () => {
    if (!selectedTime) {
      Alert.alert('Choisissez un créneau', 'Sélectionnez une date et un horaire pour modifier votre réservation.');
      return;
    }
    setSaving(true);
    try {
      // TODO: supabase.from('bookings').update({ scheduled_at: `${selectedDate}T${selectedTime}` }).eq('id', BOOKING.id)
      Alert.alert(
        'Réservation modifiée',
        `Votre réservation a été déplacée au ${DATES.find(d => d.value === selectedDate)?.sublabel} à ${selectedTime}.\n\nKarim B. a été notifié.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Erreur', 'Impossible de modifier la réservation. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier la réservation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Résumé actuel */}
        <View style={[styles.currentCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.currentLabel, { color: colors.textSub }]}>Réservation actuelle</Text>
          <Text style={[styles.currentService, { color: colors.text }]}>{BOOKING.service}</Text>
          <View style={styles.currentDetails}>
            {[
              { abbr: 'CAL', text: `${BOOKING.currentDate} à ${BOOKING.currentTime}` },
              { abbr: 'LOC', text: BOOKING.address },
              { abbr: 'LV', text: BOOKING.washer },
            ].map((row, i) => (
              <View key={i} style={styles.currentRow}>
                <View style={[styles.pill, { backgroundColor: colors.cardAlt }]}>
                  <Text style={[styles.pillText, { color: colors.textSub }]}>{row.abbr}</Text>
                </View>
                <Text style={[styles.currentRowText, { color: colors.textSub }]}>{row.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Avertissement */}
        <View style={[styles.warningCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.warningText, { color: '#92400E' }]}>
            Modification gratuite jusqu'à 2h avant le rendez-vous. Au-delà, des frais de 5€ s'appliquent.
          </Text>
        </View>

        {/* Sélection date */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Nouvelle date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll} contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}>
          {DATES.map(d => (
            <TouchableOpacity
              key={d.value}
              style={[
                styles.dateChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedDate === d.value && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => { setSelectedDate(d.value); setSelectedTime(null); }}
            >
              <Text style={[styles.dateChipLabel, { color: selectedDate === d.value ? 'rgba(255,255,255,0.75)' : colors.textSub }]}>
                {d.label}
              </Text>
              <Text style={[styles.dateChipSub, { color: selectedDate === d.value ? 'white' : colors.text }]}>
                {d.sublabel}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sélection heure */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Nouveau créneau</Text>
        <View style={styles.timesGrid}>
          {TIME_SLOTS.map(slot => (
            <TouchableOpacity
              key={slot.time}
              style={[
                styles.timeChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                !slot.available && { opacity: 0.35 },
                selectedTime === slot.time && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => slot.available && setSelectedTime(slot.time)}
              disabled={!slot.available}
            >
              <Text style={[
                styles.timeChipText,
                { color: selectedTime === slot.time ? 'white' : colors.text },
              ]}>
                {slot.time}
              </Text>
              {!slot.available && (
                <Text style={[styles.unavailableText, { color: colors.textMuted }]}>Indispo</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: hasChanges ? colors.primary : colors.border }]}
          onPress={handleSave}
          disabled={!hasChanges || saving}
        >
          <Text style={[styles.saveBtnText, { color: hasChanges ? 'white' : colors.textMuted }]}>
            {saving ? 'Modification...' : 'Confirmer la modification'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: '#0D0D0D', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 30, color: 'white', lineHeight: 34 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: 'white' },
  scroll: { flex: 1 },
  currentCard: { margin: 16, borderRadius: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  currentLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  currentService: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  currentDetails: { gap: 8 },
  currentRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  pillText: { fontSize: 9, fontWeight: '800' },
  currentRowText: { fontSize: 13 },
  warningCard: { marginHorizontal: 16, marginBottom: 20, borderRadius: 12, padding: 14 },
  warningText: { fontSize: 13, lineHeight: 19 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, marginHorizontal: 16 },
  datesScroll: { marginBottom: 24 },
  dateChip: { borderRadius: 14, borderWidth: 1.5, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center', minWidth: 72 },
  dateChipLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  dateChipSub: { fontSize: 14, fontWeight: '700' },
  timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16 },
  timeChip: { width: '22%', borderRadius: 12, borderWidth: 1.5, padding: 12, alignItems: 'center' },
  timeChipText: { fontSize: 14, fontWeight: '700' },
  unavailableText: { fontSize: 9, marginTop: 2 },
  footer: { padding: 16, paddingBottom: 30, borderTopWidth: 1 },
  saveBtn: { borderRadius: 14, padding: 18, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700' },
});
