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
    } catch {
      setAddress('Impossible de détecter la position');
    } finally {
      setLoadingLocation(false);
    }
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

  const STEP_TITLES = ['Choisir un service', 'Votre adresse', 'Choisir un créneau', 'Récapitulatif'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => step === 1 ? router.back() : setStep(step - 1)}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{STEP_TITLES[step - 1]}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        {[1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[
              styles.progressStep,
              { backgroundColor: i <= step ? '#1558E7' : '#E5E7EB' },
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* STEP 1 — Services + Véhicule */}
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Sélectionner un service</Text>
            {loadingServices ? (
              <ActivityIndicator size="large" color="#1558E7" style={{ marginTop: 40 }} />
            ) : (
              services.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.serviceCard, selectedService === s.id && styles.serviceCardSelected]}
                  onPress={() => setSelectedService(s.id)}
                >
                  <View style={[styles.serviceAbbrBox, selectedService === s.id && { backgroundColor: '#EEF3FF' }]}>
                    <Text style={[styles.serviceAbbrText, { color: selectedService === s.id ? '#1558E7' : '#6B7280' }]}>
                      {(s.name ?? '').slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceName}>{s.name}</Text>
                    <Text style={styles.serviceDesc}>{s.description}</Text>
                    <View style={styles.serviceTag}>
                      <Text style={styles.serviceTagText}>{s.duration}</Text>
                    </View>
                  </View>
                  <Text style={[styles.servicePrice, selectedService === s.id && { color: '#1558E7' }]}>
                    {s.price}€
                  </Text>
                </TouchableOpacity>
              ))
            )}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Votre véhicule</Text>
            {vehicles.length === 0 ? (
              <TouchableOpacity style={styles.addVehicleCard} onPress={() => router.push('/vehicles')}>
                <View style={styles.addVehicleIcon}>
                  <Text style={{ color: '#9CA3AF', fontSize: 16, fontWeight: '700' }}>+</Text>
                </View>
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
                  <View style={styles.vehicleIconBox}>
                    <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: '700' }}>
                      {(v.brand ?? '?').slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vehicleName}>{v.brand} {v.model}</Text>
                    <Text style={styles.vehicleDetail}>
                      {v.color} · {v.type}{v.plate ? ` · ${v.plate}` : ''}
                    </Text>
                  </View>
                  <View style={[styles.radio, selectedVehicle === v.id && styles.radioSelected]}>
                    {selectedVehicle === v.id && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* STEP 2 — Adresse */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Votre adresse</Text>

            <View style={styles.searchWrap}>
              <TextInput
                style={styles.searchInput}
                placeholder="Ex: 12 rue de la Paix, Paris"
                value={addressInput}
                onChangeText={t => { setAddressInput(t); fetchPlaces(t); }}
                placeholderTextColor="#9CA3AF"
                autoFocus={addressInput === ''}
              />
              {loadingPlaces && <ActivityIndicator size="small" color="#1558E7" style={{ marginRight: 12 }} />}
            </View>

            {placeSuggestions.length > 0 && (
              <View style={styles.suggestionsBox}>
                {placeSuggestions.map((p, i) => (
                  <TouchableOpacity
                    key={p.place_id}
                    style={[styles.suggestionItem, i > 0 && styles.suggestionBorder]}
                    onPress={() => selectPlace(p)}
                  >
                    <View style={styles.suggestionDot} />
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

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>ou</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity
              style={styles.gpsBtn}
              onPress={() => { getLocation(); setPlaceSuggestions([]); }}
            >
              <View style={styles.gpsDot}>
                <View style={styles.gpsDotInner} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gpsBtnTitle}>Utiliser ma position GPS</Text>
                {address && address !== 'Recherche en cours...' && !loadingLocation && (
                  <Text style={styles.gpsBtnAddr} numberOfLines={1}>{address}</Text>
                )}
              </View>
              {loadingLocation
                ? <ActivityIndicator size="small" color="#1558E7" />
                : <Text style={styles.gpsArrow}>›</Text>}
            </TouchableOpacity>

            {address && address !== 'Recherche en cours...' && !loadingLocation && (
              <View style={styles.zoneBanner}>
                <View style={[styles.zoneDot, { backgroundColor: '#16A34A' }]} />
                <Text style={styles.zoneText}>Zone couverte par WashNow</Text>
              </View>
            )}
          </View>
        )}

        {/* STEP 3 — Créneau */}
        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>Créneaux disponibles</Text>
            <View style={styles.timesGrid}>
              {times.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeSlot, selectedTime === t && styles.timeSlotSelected]}
                  onPress={() => setSelectedTime(t)}
                >
                  <Text style={[styles.timeText, selectedTime === t && { color: '#1558E7' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.urgentBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.urgentTitle}>Intervention urgente</Text>
                <Text style={styles.urgentSub}>Laveur disponible dans l'heure</Text>
              </View>
              <Text style={styles.urgentPrice}>+15€</Text>
            </View>

            <View style={styles.recurrenceBox}>
              <Text style={styles.recurrenceTitle}>Répéter ce lavage</Text>
              <Text style={styles.recurrenceSub}>
                Économisez 10% sur les réservations récurrentes
              </Text>
              <View style={styles.recurrenceOptions}>
                {([
                  { key: 'none', label: 'Une fois' },
                  { key: 'weekly', label: 'Chaque semaine' },
                  { key: 'biweekly', label: 'Toutes les 2 sem.' },
                  { key: 'monthly', label: 'Chaque mois' },
                ] as const).map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.recurrenceChip,
                      recurrenceType === opt.key && styles.recurrenceChipSelected,
                    ]}
                    onPress={() => setRecurrenceType(opt.key)}
                  >
                    <Text style={[
                      styles.recurrenceChipText,
                      recurrenceType === opt.key && { color: '#1558E7' },
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {recurrenceType !== 'none' && (
                <View style={styles.recurrenceSavings}>
                  <View style={styles.recurrenceDot} />
                  <Text style={styles.recurrenceSavingsText}>
                    -10% appliqué · Prochaines réservations créées automatiquement
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* STEP 4 — Récapitulatif */}
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
                  <Text style={[styles.summaryValue, { color: '#16A34A' }]}>-10%</Text>
                </View>
              )}
              <View style={styles.summaryTotal}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>
                  {recurrenceType !== 'none'
                    ? `${Math.round((selectedServiceData?.price ?? 0) * 0.9)}€`
                    : `${selectedServiceData?.price}€`}
                </Text>
              </View>
              {recurrenceType !== 'none' && (
                <View style={styles.recurrenceNote}>
                  <Text style={styles.recurrenceNoteText}>
                    {recurrenceType === 'weekly' ? 'Répété chaque semaine'
                      : recurrenceType === 'biweekly' ? 'Répété toutes les 2 semaines'
                      : 'Répété chaque mois'}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.sectionTitle}>Moyen de paiement</Text>
            {[
              { id: 'card', abbr: 'CB', name: 'Carte bancaire', desc: '•••• •••• •••• 4242' },
              { id: 'apple', abbr: 'AP', name: 'Apple Pay', desc: 'Paiement rapide et sécurisé' },
              { id: 'google', abbr: 'GP', name: 'Google Pay', desc: 'Paiement rapide et sécurisé' },
            ].map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.paymentMethod, selectedPayment === p.id && styles.paymentMethodSelected]}
                onPress={() => setSelectedPayment(p.id)}
              >
                <View style={[styles.pmAbbrBox, selectedPayment === p.id && { backgroundColor: '#EEF3FF' }]}>
                  <Text style={[styles.pmAbbrText, { color: selectedPayment === p.id ? '#1558E7' : '#6B7280' }]}>
                    {p.abbr}
                  </Text>
                </View>
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
          <Text style={styles.btnNextText}>
            {step === 4 ? 'Confirmer et payer' : 'Continuer'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 38,
    height: 38,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: { fontSize: 18, color: '#0D0D0D' },
  title: { fontSize: 17, fontWeight: '700', color: '#0D0D0D' },

  progressBar: { flexDirection: 'row', gap: 5, paddingHorizontal: 20, paddingVertical: 14 },
  progressStep: { flex: 1, height: 3, borderRadius: 2 },

  scroll: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#0D0D0D', marginBottom: 14 },

  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  serviceCardSelected: { borderColor: '#1558E7', backgroundColor: '#F8FAFF' },
  serviceAbbrBox: {
    width: 48,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceAbbrText: { fontSize: 13, fontWeight: '800' },
  serviceName: { fontSize: 15, fontWeight: '700', color: '#0D0D0D' },
  serviceDesc: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  serviceTag: {
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginTop: 6,
  },
  serviceTagText: { fontSize: 11, color: '#6B7280' },
  servicePrice: { fontSize: 18, fontWeight: '700', color: '#0D0D0D' },

  addVehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  addVehicleIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addVehicleTitle: { fontSize: 14, fontWeight: '600', color: '#0D0D0D' },
  addVehicleSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  addVehicleArrow: { fontSize: 22, color: '#9CA3AF' },

  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  vehicleCardSelected: { borderColor: '#1558E7', backgroundColor: '#F8FAFF' },
  vehicleIconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleName: { fontSize: 15, fontWeight: '700', color: '#0D0D0D' },
  vehicleDetail: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: { borderColor: '#1558E7' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1558E7' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#0D0D0D', paddingVertical: 14 },

  suggestionsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  suggestionBorder: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  suggestionDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#9CA3AF' },
  suggestionMain: { fontSize: 14, fontWeight: '600', color: '#0D0D0D' },
  suggestionSub: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },

  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 14 },
  orLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  orText: { fontSize: 13, color: '#9CA3AF' },

  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  gpsDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1558E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1558E7' },
  gpsBtnTitle: { fontSize: 14, fontWeight: '700', color: '#1558E7' },
  gpsBtnAddr: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  gpsArrow: { fontSize: 22, color: '#1558E7' },

  zoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  zoneDot: { width: 8, height: 8, borderRadius: 4 },
  zoneText: { fontSize: 13, color: '#16A34A', fontWeight: '600' },

  timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  timeSlot: {
    width: '30%',
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    alignItems: 'center',
  },
  timeSlotSelected: { borderColor: '#1558E7', backgroundColor: '#F0F4FF' },
  timeText: { fontSize: 14, fontWeight: '600', color: '#0D0D0D' },

  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#D97706',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  urgentTitle: { fontSize: 14, fontWeight: '700', color: '#0D0D0D' },
  urgentSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  urgentPrice: { fontSize: 14, fontWeight: '700', color: '#D97706' },

  recurrenceBox: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16 },
  recurrenceTitle: { fontSize: 15, fontWeight: '700', color: '#0D0D0D', marginBottom: 4 },
  recurrenceSub: { fontSize: 12, color: '#9CA3AF', marginBottom: 12 },
  recurrenceOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recurrenceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  recurrenceChipSelected: { borderColor: '#1558E7', backgroundColor: '#F0F4FF' },
  recurrenceChipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  recurrenceSavings: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 10,
  },
  recurrenceDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#16A34A' },
  recurrenceSavingsText: { fontSize: 12, color: '#16A34A', fontWeight: '600' },

  summary: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 18, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#0D0D0D' },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 4,
    paddingTop: 12,
  },
  summaryTotalLabel: { fontSize: 16, fontWeight: '700', color: '#0D0D0D' },
  summaryTotalValue: { fontSize: 18, fontWeight: '700', color: '#1558E7' },
  recurrenceNote: {
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  recurrenceNoteText: { fontSize: 12, color: '#1558E7', fontWeight: '600' },

  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  paymentMethodSelected: { borderColor: '#1558E7', backgroundColor: '#F8FAFF' },
  pmAbbrBox: {
    width: 44,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pmAbbrText: { fontSize: 13, fontWeight: '800' },
  pmName: { fontSize: 15, fontWeight: '600', color: '#0D0D0D' },
  pmDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  footer: { padding: 20, paddingBottom: 34, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  btnNext: { backgroundColor: '#1558E7', borderRadius: 10, padding: 17, alignItems: 'center' },
  btnNextText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
