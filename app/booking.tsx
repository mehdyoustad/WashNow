import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../src/supabase';

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
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').eq('active', true).order('created_at');
    setServices(data || []);
    setLoadingServices(false);
  };

  const getLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setAddress('Permission refusée'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      const geocode = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (geocode.length > 0) {
        const g = geocode[0];
        setAddress(`${g.streetNumber ?? ''} ${g.street ?? ''}, ${g.city ?? ''}`.trim());
      }
    } catch (e) { setAddress('Impossible de détecter la position'); }
    finally { setLoadingLocation(false); }
  };

  useEffect(() => { if (step === 2) getLocation(); }, [step]);

  const selectedServiceData = services.find(s => s.id === selectedService);

  const next = () => {
    if (step < 4) setStep(step + 1);
    else router.push('/payment-sheet');
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

        {/* STEP 1 — Services depuis Supabase */}
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
          </View>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Votre position</Text>
            <View style={styles.mapPreview}>
              {loadingLocation ? <ActivityIndicator size="large" color="#1a6bff" /> : <Text style={{ fontSize: 48 }}>🗺️</Text>}
            </View>
            <View style={styles.locationBox}>
              <Text style={{ fontSize: 24 }}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.locLabel}>{loadingLocation ? 'Détection en cours...' : 'Adresse détectée'}</Text>
                <Text style={styles.locAddr}>{loadingLocation ? '...' : address}</Text>
              </View>
              <TouchableOpacity onPress={getLocation}>
                <Text style={styles.modifyText}>{loadingLocation ? '⏳' : '🔄'}</Text>
              </TouchableOpacity>
            </View>
            {!loadingLocation && coords && (
              <View style={styles.zoneBanner}><Text style={styles.zoneText}>✅ Zone couverte par WashNow</Text></View>
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
              <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#e8e8e8', marginTop: 4, paddingTop: 12 }]}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0a0a0a' }}>Total</Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a6bff' }}>{selectedServiceData?.price}€</Text>
              </View>
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
});