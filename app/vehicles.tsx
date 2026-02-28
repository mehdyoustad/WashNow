import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../src/supabase';

const carBrands = [
  'Abarth', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti',
  'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra', 'Dacia', 'Daewoo',
  'Daihatsu', 'Dodge', 'DS', 'Ferrari', 'Fiat', 'Ford', 'Genesis', 'Honda',
  'Hummer', 'Hyundai', 'Infiniti', 'Isuzu', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini',
  'Lancia', 'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Maserati', 'Maybach',
  'Mazda', 'McLaren', 'Mercedes', 'MG', 'Mini', 'Mitsubishi', 'Nissan', 'Opel',
  'Peugeot', 'Porsche', 'RAM', 'Renault', 'Rolls-Royce', 'Saab', 'Seat', 'Skoda',
  'Smart', 'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'Autre',
];

const carTypes = ['Berline', 'SUV', 'Citadine', 'Break', 'Coupé', 'Monospace', 'Utilitaire'];
const carColors = ['⚫ Noir', '⚪ Blanc', '🔴 Rouge', '🔵 Bleu', '🟤 Marron', '🔘 Gris', '🟡 Jaune', '🟢 Vert'];

const typeIcons: Record<string, string> = {
  'Berline': '🚗', 'SUV': '🚙', 'Citadine': '🚘', 'Break': '🚗',
  'Coupé': '🏎️', 'Monospace': '🚐', 'Utilitaire': '🚛',
};

export default function Vehicles() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [form, setForm] = useState({
    brand: '', model: '', year: '', plate: '', color: '⚫ Noir', type: 'Berline',
  });

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('vehicles').select('*').eq('user_id', user.id).order('created_at');
    setVehicles(data || []);
    setLoading(false);
  };

  const addVehicle = async () => {
    if (!form.brand || !form.model) { Alert.alert('Erreur', 'Marque et modèle obligatoires'); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('vehicles').insert({
      user_id: user.id,
      brand: form.brand,
      model: form.model,
      year: form.year,
      plate: form.plate.toUpperCase(),
      color: form.color,
      type: form.type,
      is_default: vehicles.length === 0,
    });
    if (error) Alert.alert('Erreur', error.message);
    else {
      setShowModal(false);
      setForm({ brand: '', model: '', year: '', plate: '', color: '⚫ Noir', type: 'Berline' });
      setBrandSearch('');
      fetchVehicles();
    }
    setSaving(false);
  };

  const deleteVehicle = (id: string) => {
    Alert.alert('Supprimer', 'Supprimer ce véhicule ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        await supabase.from('vehicles').delete().eq('id', id);
        fetchVehicles();
      }},
    ]);
  };

  const setDefault = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('vehicles').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('vehicles').update({ is_default: true }).eq('id', id);
    fetchVehicles();
  };

  const filteredBrands = carBrands.filter(b =>
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mes véhicules</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#1a6bff" style={{ marginTop: 60 }} />
        ) : vehicles.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyTitle}>Aucun véhicule</Text>
            <Text style={styles.emptySub}>Ajoutez votre premier véhicule pour réserver plus vite</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.emptyBtnText}>+ Ajouter un véhicule</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vehicles.map((v, i) => (
            <View key={i} style={[styles.vehicleCard, v.is_default && styles.vehicleCardDefault]}>
              {v.is_default && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>⭐ Principal</Text>
                </View>
              )}
              <View style={styles.vehicleRow}>
                <View style={styles.vehicleIconBox}>
                  <Text style={{ fontSize: 32 }}>{typeIcons[v.type] ?? '🚗'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vehicleName}>{v.brand} {v.model}</Text>
                  <Text style={styles.vehicleDetails}>{v.year && `${v.year} · `}{v.color} · {v.type}</Text>
                  {v.plate ? (
                    <View style={styles.plateBadge}>
                      <Text style={styles.plateText}>{v.plate}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <View style={styles.vehicleActions}>
                {!v.is_default && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setDefault(v.id)}>
                    <Text style={styles.actionBtnText}>⭐ Par défaut</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={() => deleteVehicle(v.id)}>
                  <Text style={[styles.actionBtnText, { color: '#cc3333' }]}>🗑️ Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter un véhicule</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>

            {/* Marque */}
            <Text style={styles.fieldLabel}>Marque</Text>
            <TextInput
              style={[styles.input, { marginBottom: 10 }]}
              placeholder="🔍 Rechercher une marque..."
              value={brandSearch}
              onChangeText={setBrandSearch}
              placeholderTextColor="#999"
            />
            {form.brand !== '' && (
              <View style={styles.selectedBrand}>
                <Text style={styles.selectedBrandText}>✅ {form.brand}</Text>
                <TouchableOpacity onPress={() => setForm({ ...form, brand: '' })}>
                  <Text style={{ color: '#999', fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', gap: 8, paddingRight: 20 }}>
                {filteredBrands.map(b => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.chip, form.brand === b && styles.chipSelected]}
                    onPress={() => { setForm({ ...form, brand: b }); setBrandSearch(''); }}
                  >
                    <Text style={[styles.chipText, form.brand === b && styles.chipTextSelected]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Modèle */}
            <Text style={styles.fieldLabel}>Modèle</Text>
            <TextInput
              style={styles.input}
              placeholder="308, Clio, Golf..."
              value={form.model}
              onChangeText={t => setForm({ ...form, model: t })}
              placeholderTextColor="#999"
            />

            {/* Année */}
            <Text style={styles.fieldLabel}>Année</Text>
            <TextInput
              style={styles.input}
              placeholder="2022"
              value={form.year}
              onChangeText={t => setForm({ ...form, year: t })}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />

            {/* Plaque */}
            <Text style={styles.fieldLabel}>Plaque d'immatriculation</Text>
            <TextInput
              style={[styles.input, styles.plateInput]}
              placeholder="AA-123-BB"
              value={form.plate}
              onChangeText={t => setForm({ ...form, plate: t })}
              autoCapitalize="characters"
              placeholderTextColor="#999"
            />

            {/* Type */}
            <Text style={styles.fieldLabel}>Type de véhicule</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', gap: 8, paddingRight: 20 }}>
                {carTypes.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, form.type === t && styles.chipSelected]}
                    onPress={() => setForm({ ...form, type: t })}
                  >
                    <Text style={{ fontSize: 16 }}>{typeIcons[t]}</Text>
                    <Text style={[styles.chipText, form.type === t && styles.chipTextSelected]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Couleur */}
            <Text style={styles.fieldLabel}>Couleur</Text>
            <View style={styles.colorsGrid}>
              {carColors.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorChip, form.color === c && styles.chipSelected]}
                  onPress={() => setForm({ ...form, color: c })}
                >
                  <Text style={[styles.chipText, form.color === c && styles.chipTextSelected]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={addVehicle} disabled={saving}>
              {saving
                ? <ActivityIndicator color="white" />
                : <Text style={styles.saveBtnText}>Ajouter le véhicule 🚗</Text>
              }
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#0a0a0a' },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 18, color: 'white' },
  title: { fontSize: 18, fontWeight: '700', color: 'white' },
  addBtn: { width: 40, height: 40, backgroundColor: '#1a6bff', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  addText: { fontSize: 24, color: 'white', fontWeight: '300', marginTop: -2 },
  scroll: { flex: 1, padding: 20 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#0a0a0a', marginBottom: 10 },
  emptySub: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  emptyBtn: { backgroundColor: '#1a6bff', borderRadius: 50, paddingHorizontal: 28, paddingVertical: 14 },
  emptyBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  vehicleCard: { backgroundColor: 'white', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 2, borderColor: 'transparent' },
  vehicleCardDefault: { borderColor: '#1a6bff' },
  defaultBadge: { backgroundColor: '#e8f0ff', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  defaultBadgeText: { color: '#1a6bff', fontSize: 12, fontWeight: '700' },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  vehicleIconBox: { width: 64, height: 64, backgroundColor: '#f5f5f5', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  vehicleName: { fontSize: 17, fontWeight: '700', color: '#0a0a0a' },
  vehicleDetails: { fontSize: 13, color: '#999', marginTop: 3 },
  plateBadge: { backgroundColor: '#fff8e6', borderWidth: 1, borderColor: '#FFB800', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 6 },
  plateText: { fontWeight: '700', fontSize: 13, color: '#cc8800', letterSpacing: 1 },
  vehicleActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center' },
  actionBtnDanger: { backgroundColor: '#fff0f0' },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: '#0a0a0a' },
  modal: { flex: 1, backgroundColor: 'white' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 28, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0a0a0a' },
  modalClose: { fontSize: 18, color: '#999', padding: 4 },
  modalScroll: { flex: 1, padding: 24 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 10 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, fontSize: 15, color: '#0a0a0a', marginBottom: 20 },
  plateInput: { letterSpacing: 2, fontWeight: '700', fontSize: 16, textAlign: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 50, backgroundColor: '#f5f5f5', borderWidth: 2, borderColor: 'transparent' },
  chipSelected: { backgroundColor: '#e8f0ff', borderColor: '#1a6bff' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  chipTextSelected: { color: '#1a6bff' },
  colorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  colorChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 50, backgroundColor: '#f5f5f5', borderWidth: 2, borderColor: 'transparent' },
  selectedBrand: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f0ff', borderRadius: 10, padding: 12, marginBottom: 10 },
  selectedBrandText: { color: '#1a6bff', fontWeight: '700', fontSize: 14 },
  saveBtn: { backgroundColor: '#1a6bff', borderRadius: 50, padding: 18, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});