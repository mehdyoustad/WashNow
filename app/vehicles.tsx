import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../src/supabase';

// ─── Marques ──────────────────────────────────────────────────────────────────
const carBrands = [
  'Abarth', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti',
  'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra', 'Dacia', 'DS',
  'Ferrari', 'Fiat', 'Ford', 'Genesis', 'Honda', 'Hyundai', 'Infiniti',
  'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Lotus',
  'Maserati', 'Mazda', 'McLaren', 'Mercedes', 'MG', 'Mini', 'Mitsubishi',
  'Nissan', 'Opel', 'Peugeot', 'Porsche', 'RAM', 'Renault', 'Rolls-Royce',
  'Seat', 'Skoda', 'Smart', 'Subaru', 'Suzuki', 'Tesla', 'Toyota',
  'Volkswagen', 'Volvo', 'Autre',
];

// ─── Modèles par marque ───────────────────────────────────────────────────────
const carModels: Record<string, string[]> = {
  'Abarth':       ['500', '595', '695', '124 Spider', 'Grande Punto', 'Punto Evo'],
  'Alfa Romeo':   ['Giulia', 'Giulietta', 'Stelvio', 'Tonale', 'MiTo', '147', '156', '159', '166', 'Brera', 'Spider'],
  'Aston Martin': ['DB11', 'DB12', 'Vantage', 'DBS', 'DBX', 'Rapide'],
  'Audi':         ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'e-tron', 'e-tron GT', 'S3', 'S4', 'S5', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7'],
  'Bentley':      ['Continental GT', 'Continental GTC', 'Flying Spur', 'Bentayga', 'Mulsanne'],
  'BMW':          ['Série 1', 'Série 2', 'Série 3', 'Série 4', 'Série 5', 'Série 6', 'Série 7', 'Série 8', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'iX1', 'iX3', 'i3', 'i4', 'i5', 'iX', 'Z4', 'M2', 'M3', 'M4', 'M5', 'M8', 'X5M', 'X6M'],
  'Bugatti':      ['Chiron', 'Veyron', 'Divo', 'Centodieci', 'Mistral'],
  'Cadillac':     ['Escalade', 'CT4', 'CT5', 'XT4', 'XT5', 'XT6', 'Lyriq'],
  'Chevrolet':    ['Camaro', 'Corvette', 'Equinox', 'Tahoe', 'Silverado', 'Blazer', 'Malibu', 'Spark', 'Trax'],
  'Chrysler':     ['300', 'Pacifica', 'Voyager'],
  'Citroën':      ['C1', 'C2', 'C3', 'C4', 'C5', 'C3 Aircross', 'C5 Aircross', 'C4 X', 'Berlingo', 'Jumpy', 'SpaceTourer', 'ë-C4', 'ë-Berlingo'],
  'Cupra':        ['Ateca', 'Born', 'Formentor', 'Leon', 'Terramar'],
  'Dacia':        ['Sandero', 'Logan', 'Duster', 'Jogger', 'Spring', 'Dokker', 'Lodgy', 'Bigster'],
  'DS':           ['DS 3', 'DS 4', 'DS 5', 'DS 7', 'DS 9', 'DS 3 Crossback', 'DS 4 Crossback'],
  'Ferrari':      ['Roma', '296 GTB', 'F8 Tributo', 'SF90 Stradale', '812 Superfast', 'Portofino', 'Purosangue', '488 GTB', '458 Italia', 'California'],
  'Fiat':         ['500', '500C', '500X', '500L', 'Panda', 'Tipo', 'Punto', 'Bravo', 'Doblò', 'Ducato', '600', '500e'],
  'Ford':         ['Fiesta', 'Focus', 'Mondeo', 'Puma', 'Kuga', 'EcoSport', 'Edge', 'Explorer', 'Mustang', 'Mustang Mach-E', 'Ranger', 'Transit', 'Transit Connect', 'Galaxy', 'S-Max', 'B-Max'],
  'Genesis':      ['G70', 'G80', 'G90', 'GV70', 'GV80', 'GV60'],
  'Honda':        ['Jazz', 'Civic', 'Accord', 'HR-V', 'CR-V', 'ZR-V', 'e', 'e:Ny1', 'FR-V', 'CR-Z', 'Insight', 'Legend'],
  'Hyundai':      ['i10', 'i20', 'i30', 'i40', 'Tucson', 'Santa Fe', 'Ioniq 5', 'Ioniq 6', 'Kona', 'Bayon', 'Nexo', 'Staria', 'ix20', 'ix35'],
  'Infiniti':     ['Q30', 'Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX60', 'QX70', 'QX80'],
  'Jaguar':       ['E-Pace', 'F-Pace', 'I-Pace', 'XE', 'XF', 'XJ', 'F-Type'],
  'Jeep':         ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator', 'Avenger'],
  'Kia':          ['Picanto', 'Rio', 'Ceed', 'ProCeed', 'Stinger', 'Sportage', 'Sorento', 'Telluride', 'EV6', 'EV9', 'Niro', 'Soul', 'XCeed'],
  'Lamborghini':  ['Huracán', 'Aventador', 'Urus', 'Revuelto'],
  'Land Rover':   ['Discovery', 'Discovery Sport', 'Defender', 'Defender 90', 'Defender 110', 'Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque', 'Freelander'],
  'Lexus':        ['CT 200h', 'IS', 'ES', 'GS', 'LS', 'UX', 'NX', 'RX', 'LX', 'LC', 'RC', 'RZ'],
  'Lotus':        ['Elise', 'Exige', 'Evora', 'Emira', 'Emeya', 'Eletre'],
  'Maserati':     ['Ghibli', 'Levante', 'Quattroporte', 'Granturismo', 'Grancabrio', 'Grecale'],
  'Mazda':        ['2', '3', '6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'CX-90', 'MX-5', 'MX-30', 'RX-8'],
  'McLaren':      ['570S', '570GT', '720S', '765LT', 'GT', 'Artura', 'Elva'],
  'Mercedes':     ['Classe A', 'Classe B', 'Classe C', 'Classe E', 'Classe S', 'Classe G', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'CLA', 'CLS', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'AMG GT', 'Vito', 'V-Classe'],
  'MG':           ['ZS', 'HS', 'Marvel R', 'MG 4', 'MG 5', 'MG 3', 'Cyberster'],
  'Mini':         ['Cooper', 'Cooper S', 'Cooper SE', 'Clubman', 'Countryman', 'Paceman', 'Convertible', 'John Cooper Works'],
  'Mitsubishi':   ['Space Star', 'Colt', 'ASX', 'Eclipse Cross', 'Outlander', 'L200', 'Pajero Sport'],
  'Nissan':       ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Ariya', 'Leaf', 'Note', 'Townstar', '370Z', 'GT-R', 'Navara'],
  'Opel':         ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland', 'Grandland', 'Zafira', 'Vivaro', 'Combo', 'Rocks-e'],
  'Peugeot':      ['108', '208', '308', '408', '508', '2008', '3008', '5008', 'Rifter', 'Partner', 'Expert', 'Traveller', 'e-208', 'e-2008', 'e-308', 'e-3008', 'e-5008'],
  'Porsche':      ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', '718 Boxster', '718 Cayman', 'Cayenne Coupé'],
  'RAM':          ['1500', '2500', '3500', 'ProMaster'],
  'Renault':      ['Twingo', 'Clio', 'Mégane', 'Talisman', 'Espace', 'Kangoo', 'Captur', 'Arkana', 'Kadjar', 'Koleos', 'Austral', 'Scenic', 'Zoe', 'Megane E-Tech', 'Trafic', 'Master', 'Express'],
  'Rolls-Royce':  ['Ghost', 'Phantom', 'Wraith', 'Dawn', 'Cullinan', 'Spectre'],
  'Seat':         ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco', 'Alhambra', 'Toledo', 'Mii'],
  'Skoda':        ['Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq iV', 'Citigo'],
  'Smart':        ['ForTwo', 'ForFour', '#1', '#3'],
  'Subaru':       ['Impreza', 'Legacy', 'Outback', 'Forester', 'XV', 'BRZ', 'WRX', 'Solterra'],
  'Suzuki':       ['Alto', 'Swift', 'Baleno', 'Ignis', 'Celerio', 'S-Cross', 'Vitara', 'Jimny', 'SX4', 'Across'],
  'Tesla':        ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'],
  'Toyota':       ['Yaris', 'Yaris Cross', 'Corolla', 'Corolla Cross', 'Camry', 'C-HR', 'RAV4', 'Highlander', 'Land Cruiser', 'Hilux', 'Prius', 'bZ4X', 'Supra', 'GR86', 'GR Yaris', 'Aygo X', 'Proace'],
  'Volkswagen':   ['Polo', 'Golf', 'Golf GTI', 'Golf R', 'Passat', 'Arteon', 'T-Cross', 'T-Roc', 'Tiguan', 'Touareg', 'ID.3', 'ID.4', 'ID.5', 'ID.7', 'Touran', 'Caddy', 'Transporter', 'Multivan'],
  'Volvo':        ['XC40', 'C40 Recharge', 'XC60', 'XC90', 'S60', 'S90', 'V60', 'V90', 'EX30', 'EX90'],
  'Autre':        [],
};

// ─── Types & couleurs ─────────────────────────────────────────────────────────
const carTypes = ['Berline', 'SUV', 'Citadine', 'Break', 'Coupé', 'Monospace', 'Utilitaire', 'Cabriolet', 'Pick-up'];
const carColors = ['⚫ Noir', '⚪ Blanc', '🔴 Rouge', '🔵 Bleu', '🟤 Marron', '🔘 Gris', '🟡 Jaune', '🟢 Vert', '🟠 Orange', '🟣 Violet', '🩷 Rose', '🤍 Beige'];

const typeIcons: Record<string, string> = {
  'Berline': '🚗', 'SUV': '🚙', 'Citadine': '🚘', 'Break': '🚗',
  'Coupé': '🏎️', 'Monospace': '🚐', 'Utilitaire': '🚛', 'Cabriolet': '🚗', 'Pick-up': '🛻',
};

// ─── Composant ────────────────────────────────────────────────────────────────
export default function Vehicles() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
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
      year: form.year || null,
      plate: form.plate ? form.plate.toUpperCase() : null,
      color: form.color,
      type: form.type,
      is_default: vehicles.length === 0,
    });
    if (error) {
      if (error.message.includes('column') || error.message.includes('schema cache')) {
        Alert.alert(
          '⚠️ Migration Supabase requise',
          'Ta table "vehicles" manque de colonnes.\n\nExécute ce SQL dans Supabase > SQL Editor :\n\nALTER TABLE vehicles\n  ADD COLUMN IF NOT EXISTS year TEXT,\n  ADD COLUMN IF NOT EXISTS plate TEXT,\n  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT \'⚫ Noir\',\n  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT \'Berline\',\n  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erreur', error.message);
      }
    } else {
      setShowModal(false);
      resetForm();
      fetchVehicles();
    }
    setSaving(false);
  };

  const resetForm = () => {
    setForm({ brand: '', model: '', year: '', plate: '', color: '⚫ Noir', type: 'Berline' });
    setBrandSearch('');
    setModelSearch('');
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

  const selectBrand = (brand: string) => {
    setForm(f => ({ ...f, brand, model: '' }));
    setBrandSearch('');
    setModelSearch('');
  };

  const selectModel = (model: string) => {
    setForm(f => ({ ...f, model }));
    setModelSearch('');
  };

  // Modèles disponibles pour la marque sélectionnée
  const availableModels = form.brand ? (carModels[form.brand] ?? []) : [];
  const filteredModels = availableModels.filter(m =>
    m.toLowerCase().includes(modelSearch.toLowerCase())
  );
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
                  <Text style={styles.vehicleDetails}>
                    {[v.year, v.color, v.type].filter(Boolean).join(' · ')}
                  </Text>
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

      {/* Modal ajout */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter un véhicule</Text>
            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* ── Marque ── */}
            <Text style={styles.fieldLabel}>Marque</Text>
            <TextInput
              style={[styles.input, { marginBottom: 10 }]}
              placeholder="🔍 Rechercher une marque..."
              value={brandSearch}
              onChangeText={setBrandSearch}
              placeholderTextColor="#999"
            />
            {form.brand !== '' && (
              <View style={styles.selectedChip}>
                <Text style={styles.selectedChipText}>✅ {form.brand}</Text>
                <TouchableOpacity onPress={() => setForm(f => ({ ...f, brand: '', model: '' }))}>
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
                    onPress={() => selectBrand(b)}
                  >
                    <Text style={[styles.chipText, form.brand === b && styles.chipTextSelected]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* ── Modèle ── */}
            <Text style={styles.fieldLabel}>Modèle</Text>
            {availableModels.length > 0 ? (
              <>
                <TextInput
                  style={[styles.input, { marginBottom: 10 }]}
                  placeholder={`🔍 Rechercher un modèle ${form.brand}...`}
                  value={modelSearch}
                  onChangeText={setModelSearch}
                  placeholderTextColor="#999"
                />
                {form.model !== '' && (
                  <View style={styles.selectedChip}>
                    <Text style={styles.selectedChipText}>✅ {form.model}</Text>
                    <TouchableOpacity onPress={() => setForm(f => ({ ...f, model: '' }))}>
                      <Text style={{ color: '#999', fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', gap: 8, paddingRight: 20 }}>
                    {filteredModels.map(m => (
                      <TouchableOpacity
                        key={m}
                        style={[styles.chip, form.model === m && styles.chipSelected]}
                        onPress={() => selectModel(m)}
                      >
                        <Text style={[styles.chipText, form.model === m && styles.chipTextSelected]}>{m}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                <TextInput
                  style={[styles.input, { marginBottom: 20 }]}
                  placeholder="Ou saisir manuellement..."
                  value={form.model}
                  onChangeText={t => setForm(f => ({ ...f, model: t }))}
                  placeholderTextColor="#bbb"
                />
              </>
            ) : (
              <TextInput
                style={styles.input}
                placeholder={form.brand ? `Modèle de ${form.brand}...` : '308, Clio, Golf...'}
                value={form.model}
                onChangeText={t => setForm(f => ({ ...f, model: t }))}
                placeholderTextColor="#999"
              />
            )}

            {/* ── Année ── */}
            <Text style={styles.fieldLabel}>Année</Text>
            <TextInput
              style={styles.input}
              placeholder="2022"
              value={form.year}
              onChangeText={t => setForm(f => ({ ...f, year: t }))}
              keyboardType="numeric"
              maxLength={4}
              placeholderTextColor="#999"
            />

            {/* ── Plaque ── */}
            <Text style={styles.fieldLabel}>Plaque d'immatriculation</Text>
            <TextInput
              style={[styles.input, styles.plateInput]}
              placeholder="AA-123-BB"
              value={form.plate}
              onChangeText={t => setForm(f => ({ ...f, plate: t }))}
              autoCapitalize="characters"
              placeholderTextColor="#999"
            />

            {/* ── Type ── */}
            <Text style={styles.fieldLabel}>Type de véhicule</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', gap: 8, paddingRight: 20 }}>
                {carTypes.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, form.type === t && styles.chipSelected]}
                    onPress={() => setForm(f => ({ ...f, type: t }))}
                  >
                    <Text style={{ fontSize: 16 }}>{typeIcons[t] ?? '🚗'}</Text>
                    <Text style={[styles.chipText, form.type === t && styles.chipTextSelected]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* ── Couleur ── */}
            <Text style={styles.fieldLabel}>Couleur</Text>
            <View style={styles.colorsGrid}>
              {carColors.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorChip, form.color === c && styles.chipSelected]}
                  onPress={() => setForm(f => ({ ...f, color: c }))}
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
  selectedChip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f0ff', borderRadius: 10, padding: 12, marginBottom: 10 },
  selectedChipText: { color: '#1a6bff', fontWeight: '700', fontSize: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 50, backgroundColor: '#f5f5f5', borderWidth: 2, borderColor: 'transparent' },
  chipSelected: { backgroundColor: '#e8f0ff', borderColor: '#1a6bff' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  chipTextSelected: { color: '#1a6bff' },
  colorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  colorChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 50, backgroundColor: '#f5f5f5', borderWidth: 2, borderColor: 'transparent' },
  saveBtn: { backgroundColor: '#1a6bff', borderRadius: 50, padding: 18, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
