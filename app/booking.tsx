import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../src/supabase';

const GOOGLE_API_KEY = 'AIzaSyA_9xvfaad4vBdv-twfVOLdZ_yfGsOmv1g';

const times = ['08h00', '09h00', '10h00', '11h00', '14h00', '15h00', '16h00'];

export default function Booking() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [address, setAddress] = useState<string>('Recherche en cours...');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [placeSuggestions, setPlaceSuggestions] = useState<any[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recurrenceType, setRecurrenceType] = useState<'none' | 'weekly' | 'biweekly' | 'monthly'>('none');

  useEffect(() => { fetchServices(); fetchVehicles(); }, []);

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').eq('active', true).order('created_at');
    setServices(data || []);
    setLoadingServices(false);
  };

  const fetchVehicles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('vehicles').select('*').eq('user_id', user.id).order('is_default', { ascending: false });
    setVehicles(data || []);
    if (data && data.length > 0) {
      const def = data.find((v: any) => v.is_default) ?? data[0];
      setSelectedVehicle(def.id);
    }
  };

  const getLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setAddress('Permission refusée'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const geocode = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (geocode.length > 0) {
        const g = geocode[0];
        setAddress(`${g.streetNumber ?? ''} ${g.street ?? ''}, ${g.city ?? ''}`.trim());
      }
    } catch (e) { setAddress('Impossible de détecter la position'); }
    finally { setLoadingLocation(false); }
  };

  useEffect(() => { if (step === 2) getLocation(); }, [step]);

  const fetchPlaces = (input: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (input.length < 3) { setPlaceSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoadingPlaces(true);
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_API_KEY}&language=fr&components=country:fr`;
        const res = await fetch(url);
        const json = await res.json();
        setPlaceSuggestions(json.predictions ?? []);
      } catch { setPlaceSuggestions([]); }
      finally { setLoadingPlaces(false); }
    }, 350);
  };

  const selectPlace = (prediction: any) => {
    setAddress(prediction.description);
    setAddressInput(prediction.description);
    setPlaceSuggestions([]);
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  const createRecurringBookings = async (baseBookingId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || recurrenceType === 'none') return;
    const daysMap = { weekly: 7, biweekly: 14, monthly: 30 };
    const interval = daysMap[recurrenceType];
    const bookings = [1, 2, 3].map(i => ({
      user_id: user.id,
      service_id: selectedService,
      vehicle_id: selectedVehicle,
      address,
      time_slot: selectedTime,
      status: 'planifié',
      recurring: true,
      parent_booking_id: baseBookingId,
      scheduled_at: new Date(Date.now() + i * interval * 24 * 60 * 60 * 1000).toISOString(),
    }));
    await supabase.from('bookings').insert(bookings);
  };

  const next = async () => {
    if (step < 4) { setStep(step + 1); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const price = recurrenceType !== 'none'
        ? Math.round((selectedServiceData?.price ?? 0) * 0.9)
        : (selectedServiceData?.price ?? 0);
      const { data } = await supabase.from('bookings').insert({
        user_id: user.id,
        service_id: selectedService,
        vehicle_id: selectedVehicle,
        address,
        time_slot: selectedTime,
        status: 'en attente',
        recurring: recurrenceType !== 'none',
        recurrence_type: recurrenceType,
        price,
      }).select().single();
      if (data) await createRecurringBookings(data.id);
    }
    router.push('/payment-sheet');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => step === 1 ? router.back() : setStep(step - 1)}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {step === 1 ? 'Choisir un service' : step === 2 ? 'Votre adresse' : step === 3 ? 'Choisir un créneau' : 'Paiement'}
        </Text>
      </View>

      <View style={styles.progressBar}>
        {[1,2,3,4].map(i => (
          <View key={i} style={[styles.progressStep, i <= step && styles.progressStepDone]} />
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* STEP 1 — Services + Véhicule */}
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Sélectionner un service</Text>
            {loadingServices ? (
              <ActivityIndicator size="large" color="#1a6bff" style={{ marginTop: 40 }} />
            ) : (
              services.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.serviceCard, selectedService === s.id && styles.serviceCardSelected]}
                  onPress={() => setSelectedService(s.id)}
                >
                  <View style={styles.serviceIcon}><Text style={{ fontSize: 24 }}>{s.icon}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceName}>{s.name}</Text>
                    <Text style={styles.serviceDesc}>{s.description}</Text>
                    <View style={styles.serviceTag}><Text style={styles.serviceTagText}>⏱ {s.duration}</Text></View>
                  </View>
                  <Text style={[styles.servicePrice, selectedService === s.id && { color: '#1a6bff' }]}>{s.price}€</Text>
                </TouchableOpacity>
              ))
            )}

            {/* Sélection véhicule */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Votre véhicule</Text>
            {vehicles.length === 0 ? (
              <TouchableOpacity style={styles.addVehicleCard} onPress={() => router.push('/vehicles')}>
                <Text style={styles.addVehicleIcon}>🚗</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addVehicleTitle}>Aucun véhicule enregistré</Text>
                  <Text style={styles.addVehicleSub}>Ajoutez-en un pour continuer</Text>
                </View>
                <Text style={styles.addVehicleArrow}>›</Text>
              </TouchableOpacity>
            ) : (
              vehicles.map((v: any) => (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vehicleCard, selectedVehicle === v.id && styles.vehicleCardSelected]}
                  onPress={() => setSelectedVehicle(v.id)}
                >
                  <View style={styles.vehicleCardIcon}>
                    <Text style={{ fontSize: 22 }}>🚗</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vehicleCardName}>{v.brand} {v.model}</Text>
                    <Text style={styles.vehicleCardDetail}>{v.color} · {v.type}{v.plate ? ` · ${v.plate}` : ''}</Text>
                  </View>
                  <View style={[styles.radio, selectedVehicle === v.id && styles.radioSelected]}>
                    {selectedVehicle === v.id && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* STEP 2 — Adresse avec autocomplétion Google Places */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Votre adresse</Text>

            {/* Champ de recherche */}
            <View style={styles.placeInputWrap}>
              <Text style={styles.placeSearchIcon}>🔍</Text>
              <TextInput
                style={styles.placeInput}
                placeholder="Ex: 12 rue de la Paix, Paris"
                value={addressInput}
                onChangeText={t => { setAddressInput(t); fetchPlaces(t); }}
                placeholderTextColor="#999"
                autoFocus={addressInput === ''}
              />
              {loadingPlaces && <ActivityIndicator size="small" color="#1a6bff" />}
            </View>

            {/* Suggestions */}
            {placeSuggestions.length > 0 && (
              <View style={styles.suggestionsBox}>
                {placeSuggestions.map((p, i) => (
                  <TouchableOpacity
                    key={p.place_id}
                    style={[styles.suggestionItem, i > 0 && styles.suggestionBorder]}
                    onPress={() => selectPlace(p)}
                  >
                    <Text style={styles.suggestionIcon}>📍</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggestionMain} numberOfLines={1}>
                        {p.structured_formatting?.main_text ?? p.description}
                      </Text>
                      <Text style={styles.suggestionSub} numberOfLines={1}>
                        {p.structured_formatting?.secondary_text ?? ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Séparateur */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>ou</Text>
              <View style={styles.orLine} />
            </View>

            {/* Détection GPS */}
            <TouchableOpacity style={styles.gpsBtn} onPress={() => { getLocation(); setPlaceSuggestions([]); }}>
              <Text style={styles.gpsIcon}>{loadingLocation ? '⏳' : '📡'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.gpsBtnTitle}>Utiliser ma position GPS</Text>
                {address && address !== 'Recherche en cours...' && !loadingLocation && (
                  <Text style={styles.gpsBtnAddr} numberOfLines={1}>{address}</Text>
                )}
              </View>
              {loadingLocation
                ? <ActivityIndicator size="small" color="#1a6bff" />
                : <Text style={styles.gpsArrow}>›</Text>}
            </TouchableOpacity>

            {/* Adresse sélectionnée */}
            {address && address !== 'Recherche en cours...' && !loadingLocation && (
              <View style={styles.zoneBanner}>
                <Text style={styles.zoneText}>✅ Zone couverte par WashNow</Text>
              </View>
            )}
          </View>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>Créneaux disponibles</Text>
            <View style={styles.timesGrid}>
              {times.map(t => (
                <TouchableOpacity key={t} style={[styles.timeSlot, selectedTime === t && styles.timeSlotSelected]} onPress={() => setSelectedTime(t)}>
                  <Text style={[styles.timeText, selectedTime === t && { color: '#1a6bff' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.urgentBanner}>
              <Text style={{ fontSize: 24 }}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.urgentTitle}>Intervention urgente</Text>
                <Text style={styles.urgentSub}>Laveur disponible dans l'heure</Text>
              </View>
              <Text style={styles.urgentPrice}>+15€</Text>
            </TouchableOpacity>

            {/* Récurrence */}
            <View style={styles.recurrenceBox}>
              <Text style={styles.recurrenceTitle}>🔄 Répéter ce lavage</Text>
              <Text style={styles.recurrenceSub}>Économisez 10% sur les réservations récurrentes</Text>
              <View style={styles.recurrenceOptions}>
                {([
                  { key: 'none', label: 'Une fois' },
                  { key: 'weekly', label: 'Chaque semaine' },
                  { key: 'biweekly', label: 'Toutes les 2 sem.' },
                  { key: 'monthly', label: 'Chaque mois' },
                ] as const).map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.recurrenceChip, recurrenceType === opt.key && styles.recurrenceChipSelected]}
                    onPress={() => setRecurrenceType(opt.key)}
                  >
                    <Text style={[styles.recurrenceChipText, recurrenceType === opt.key && { color: '#1a6bff' }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {recurrenceType !== 'none' && (
                <View style={styles.recurrenceSavings}>
                  <Text style={styles.recurrenceSavingsText}>✅ -10% appliqué · Prochaines réservations créées automatiquement</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <View>
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{selectedServiceData?.name}</Text>
                <Text style={styles.summaryValue}>{selectedServiceData?.price}€</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Déplacement</Text>
                <Text style={styles.summaryValue}>Gratuit</Text>
              </View>
              {recurrenceType !== 'none' && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Réduction récurrence</Text>
                  <Text style={[styles.summaryValue, { color: '#00c853' }]}>-10%</Text>
                </View>
              )}
              <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#e8e8e8', marginTop: 4, paddingTop: 12 }]}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0a0a0a' }}>Total</Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a6bff' }}>
                  {recurrenceType !== 'none'
                    ? `${Math.round((selectedServiceData?.price ?? 0) * 0.9)}€`
                    : `${selectedServiceData?.price}€`}
                </Text>
              </View>
              {recurrenceType !== 'none' && (
                <View style={{ backgroundColor: '#e8f0ff', borderRadius: 10, padding: 10, marginTop: 6 }}>
                  <Text style={{ fontSize: 12, color: '#1a6bff', fontWeight: '600' }}>
                    🔄 {recurrenceType === 'weekly' ? 'Répété chaque semaine' : recurrenceType === 'biweekly' ? 'Répété toutes les 2 semaines' : 'Répété chaque mois'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.sectionTitle}>Moyen de paiement</Text>
            {[
              { id: 'card', icon: '💳', name: 'Carte bancaire', desc: '•••• •••• •••• 4242' },
              { id: 'apple', icon: '🍎', name: 'Apple Pay', desc: 'Paiement rapide et sécurisé' },
              { id: 'google', icon: 'G', name: 'Google Pay', desc: 'Paiement rapide et sécurisé' },
            ].map(p => (
              <TouchableOpacity key={p.id} style={[styles.paymentMethod, selectedPayment === p.id && styles.paymentMethodSelected]} onPress={() => setSelectedPayment(p.id)}>
                <View style={styles.pmIcon}><Text style={{ fontSize: 20 }}>{p.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pmName}>{p.name}</Text>
                  <Text style={styles.pmDesc}>{p.desc}</Text>
                </View>
                <View style={[styles.radio, selectedPayment === p.id && styles.radioSelected]}>
                  {selectedPayment === p.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnNext} onPress={next}>
          <Text style={styles.btnNextText}>{step === 4 ? 'Confirmer et payer' : 'Continuer'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  backBtn: { width: 40, height: 40, backgroundColor: '#f5f5f5', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 18, color: '#0a0a0a' },
  title: { fontSize: 18, fontWeight: '700', color: '#0a0a0a' },
  progressBar: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingVertical: 14 },
  progressStep: { flex: 1, height: 4, backgroundColor: '#e8e8e8', borderRadius: 2 },
  progressStepDone: { backgroundColor: '#1a6bff' },
  scroll: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginBottom: 14 },
  serviceCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderColor: '#e8e8e8', borderRadius: 16, padding: 16, marginBottom: 12 },
  serviceCardSelected: { borderColor: '#1a6bff', backgroundColor: '#e8f0ff' },
  serviceIcon: { width: 52, height: 52, backgroundColor: '#f5f5f5', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  serviceName: { fontSize: 15, fontWeight: '700', color: '#0a0a0a' },
  serviceDesc: { fontSize: 12, color: '#999', marginTop: 3 },
  serviceTag: { backgroundColor: '#f5f5f5', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginTop: 6 },
  serviceTagText: { fontSize: 11, color: '#555' },
  servicePrice: { fontSize: 18, fontWeight: '700', color: '#0a0a0a' },
  mapPreview: { width: '100%', height: 160, backgroundColor: '#e8f4fd', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  locationBox: { backgroundColor: '#f5f5f5', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  locLabel: { fontSize: 12, color: '#999' },
  locAddr: { fontSize: 15, fontWeight: '600', color: '#0a0a0a', marginTop: 2 },
  modifyText: { color: '#1a6bff', fontWeight: '700', fontSize: 18 },
  zoneBanner: { backgroundColor: '#e8faf0', padding: 14, borderRadius: 10, marginBottom: 16 },
  zoneText: { fontSize: 13, color: '#00c853', fontWeight: '600' },
  timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  timeSlot: { width: '30%', padding: 14, borderWidth: 2, borderColor: '#e8e8e8', borderRadius: 10, alignItems: 'center' },
  timeSlotSelected: { borderColor: '#1a6bff', backgroundColor: '#e8f0ff' },
  timeText: { fontSize: 14, fontWeight: '600', color: '#0a0a0a' },
  urgentBanner: { backgroundColor: '#fff8e6', borderWidth: 2, borderColor: '#FFB800', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  urgentTitle: { fontSize: 14, fontWeight: '700', color: '#0a0a0a' },
  urgentSub: { fontSize: 12, color: '#999', marginTop: 2 },
  urgentPrice: { fontSize: 14, fontWeight: '700', color: '#cc8800' },
  summary: { backgroundColor: '#f5f5f5', borderRadius: 16, padding: 18, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { fontSize: 14, color: '#555' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#0a0a0a' },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderColor: '#e8e8e8', borderRadius: 16, padding: 16, marginBottom: 12 },
  paymentMethodSelected: { borderColor: '#1a6bff', backgroundColor: '#e8f0ff' },
  pmIcon: { width: 44, height: 44, backgroundColor: '#f5f5f5', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  pmName: { fontSize: 15, fontWeight: '600', color: '#0a0a0a' },
  pmDesc: { fontSize: 12, color: '#999', marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#e8e8e8', justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: '#1a6bff' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1a6bff' },
  footer: { padding: 20, paddingBottom: 34, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  btnNext: { backgroundColor: '#1a6bff', borderRadius: 50, padding: 18, alignItems: 'center' },
  btnNextText: { color: 'white', fontSize: 16, fontWeight: '700' },
  addVehicleCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderColor: '#e8e8e8', borderRadius: 16, padding: 16, marginBottom: 12, borderStyle: 'dashed' },
  addVehicleIcon: { fontSize: 28 },
  addVehicleTitle: { fontSize: 14, fontWeight: '700', color: '#0a0a0a' },
  addVehicleSub: { fontSize: 12, color: '#999', marginTop: 2 },
  addVehicleArrow: { fontSize: 22, color: '#999' },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderColor: '#e8e8e8', borderRadius: 16, padding: 16, marginBottom: 10 },
  vehicleCardSelected: { borderColor: '#1a6bff', backgroundColor: '#e8f0ff' },
  vehicleCardIcon: { width: 44, height: 44, backgroundColor: '#f5f5f5', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  vehicleCardName: { fontSize: 15, fontWeight: '700', color: '#0a0a0a' },
  vehicleCardDetail: { fontSize: 12, color: '#999', marginTop: 2 },
  recurrenceBox: { marginTop: 20, backgroundColor: '#f5f5f5', borderRadius: 16, padding: 16 },
  recurrenceTitle: { fontSize: 15, fontWeight: '700', color: '#0a0a0a', marginBottom: 4 },
  recurrenceSub: { fontSize: 12, color: '#999', marginBottom: 12 },
  recurrenceOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recurrenceChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, borderWidth: 2, borderColor: '#e8e8e8', backgroundColor: 'white' },
  recurrenceChipSelected: { borderColor: '#1a6bff', backgroundColor: '#e8f0ff' },
  recurrenceChipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  recurrenceSavings: { marginTop: 12, backgroundColor: '#e8faf0', borderRadius: 10, padding: 10 },
  recurrenceSavingsText: { fontSize: 12, color: '#00c853', fontWeight: '600' },
  placeInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 8, gap: 8 },
  placeSearchIcon: { fontSize: 18 },
  placeInput: { flex: 1, fontSize: 15, color: '#0a0a0a', paddingVertical: 14 },
  suggestionsBox: { backgroundColor: 'white', borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: '#e8e8e8', overflow: 'hidden' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  suggestionBorder: { borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  suggestionIcon: { fontSize: 16 },
  suggestionMain: { fontSize: 14, fontWeight: '600', color: '#0a0a0a' },
  suggestionSub: { fontSize: 12, color: '#999', marginTop: 1 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 14 },
  orLine: { flex: 1, height: 1, backgroundColor: '#e8e8e8' },
  orText: { fontSize: 13, color: '#999' },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f0f4ff', borderRadius: 14, padding: 16, marginBottom: 14 },
  gpsIcon: { fontSize: 22 },
  gpsBtnTitle: { fontSize: 14, fontWeight: '700', color: '#1a6bff' },
  gpsBtnAddr: { fontSize: 12, color: '#555', marginTop: 2 },
  gpsArrow: { fontSize: 22, color: '#1a6bff' },
});