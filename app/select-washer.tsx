import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../src/theme';

type SortKey = 'rating' | 'distance' | 'price';

const WASHERS = [
  {
    id: 'w1', name: 'Karim B.', initial: 'K', rating: 4.9, totalRatings: 247,
    distance: 0.8, eta: '12 min', price: 0, priceLabel: '', verified: true,
    specialties: ['Complet', 'Premium'], available: true,
    completionRate: 99, missions: 247,
  },
  {
    id: 'w2', name: 'Yassin M.', initial: 'Y', rating: 4.7, totalRatings: 134,
    distance: 1.4, eta: '18 min', price: -2, priceLabel: '-2€', verified: true,
    specialties: ['Extérieur', 'Complet'], available: true,
    completionRate: 96, missions: 134,
  },
  {
    id: 'w3', name: 'Sonia R.', initial: 'S', rating: 4.8, totalRatings: 89,
    distance: 2.1, eta: '24 min', price: 0, priceLabel: '', verified: false,
    specialties: ['Complet', 'Premium', 'Lustrage'], available: true,
    completionRate: 98, missions: 89,
  },
  {
    id: 'w4', name: 'Bilal T.', initial: 'B', rating: 4.5, totalRatings: 52,
    distance: 3.0, eta: '31 min', price: -5, priceLabel: '-5€', verified: false,
    specialties: ['Extérieur', 'Complet'], available: false,
    completionRate: 91, missions: 52,
  },
  {
    id: 'w5', name: 'Omar D.', initial: 'O', rating: 4.6, totalRatings: 176,
    distance: 3.7, eta: '38 min', price: 3, priceLabel: '+3€', verified: true,
    specialties: ['Premium', 'Lustrage', 'Céramique'], available: true,
    completionRate: 97, missions: 176,
  },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'rating', label: 'Mieux notés' },
  { key: 'distance', label: 'Les plus proches' },
  { key: 'price', label: 'Prix croissant' },
];

export default function SelectWasher() {
  const router = useRouter();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = WASHERS
    .filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'distance') return a.distance - b.distance;
      return a.price - b.price;
    });

  const selected = WASHERS.find(w => w.id === selectedId);

  const handleConfirm = () => {
    if (!selectedId) return;
    // TODO: passer le washer sélectionné en params à booking
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choisir un laveur</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Recherche */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text, backgroundColor: colors.cardAlt }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un laveur..."
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {/* Tri */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.sortBar, { borderBottomColor: colors.border }]}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}
      >
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.sortChip,
              { borderColor: colors.border, backgroundColor: colors.card },
              sortBy === opt.key && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setSortBy(opt.key)}
          >
            <Text style={[styles.sortChipText, { color: sortBy === opt.key ? 'white' : colors.textSub }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12 }}>
        {/* Info laveur assigné automatiquement */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
          <Text style={[styles.infoBannerText, { color: colors.primary }]}>
            Sans sélection, le meilleur laveur disponible vous sera assigné automatiquement.
          </Text>
        </View>

        {filtered.map(washer => {
          const isSelected = selectedId === washer.id;
          return (
            <TouchableOpacity
              key={washer.id}
              style={[
                styles.washerCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                isSelected && { borderColor: colors.primary, borderWidth: 2 },
                !washer.available && { opacity: 0.5 },
              ]}
              onPress={() => washer.available && setSelectedId(isSelected ? null : washer.id)}
              disabled={!washer.available}
              activeOpacity={0.85}
            >
              {/* Avatar + infos */}
              <View style={styles.washerTop}>
                <View style={[styles.avatar, { backgroundColor: isSelected ? colors.primary : colors.cardAlt }]}>
                  <Text style={[styles.avatarText, { color: isSelected ? 'white' : colors.textSub }]}>
                    {washer.initial}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.washerName, { color: colors.text }]}>{washer.name}</Text>
                    {washer.verified && (
                      <View style={[styles.verifiedBadge, { backgroundColor: colors.primary + '14' }]}>
                        <Text style={[styles.verifiedText, { color: colors.primary }]}>Vérifié</Text>
                      </View>
                    )}
                    {!washer.available && (
                      <View style={[styles.verifiedBadge, { backgroundColor: colors.border }]}>
                        <Text style={[styles.verifiedText, { color: colors.textMuted }]}>Indispo</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.ratingRow}>
                    <Text style={[styles.star, { color: '#F59E0B' }]}>★</Text>
                    <Text style={[styles.ratingNum, { color: colors.text }]}>{washer.rating}</Text>
                    <Text style={[styles.ratingCount, { color: colors.textSub }]}>({washer.totalRatings})</Text>
                    <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
                    <Text style={[styles.ratingCount, { color: colors.textSub }]}>{washer.missions} missions</Text>
                  </View>
                </View>
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </View>

              {/* Spécialités */}
              <View style={styles.specialtiesRow}>
                {washer.specialties.map((s, i) => (
                  <View key={i} style={[styles.specialtyChip, { backgroundColor: colors.cardAlt }]}>
                    <Text style={[styles.specialtyText, { color: colors.textSub }]}>{s}</Text>
                  </View>
                ))}
              </View>

              {/* Métriques bas */}
              <View style={[styles.metricsRow, { borderTopColor: colors.border }]}>
                <View style={styles.metric}>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Distance</Text>
                  <Text style={[styles.metricValue, { color: colors.text }]}>{washer.distance} km</Text>
                </View>
                <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
                <View style={styles.metric}>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>ETA</Text>
                  <Text style={[styles.metricValue, { color: colors.text }]}>{washer.eta}</Text>
                </View>
                <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
                <View style={styles.metric}>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Complétion</Text>
                  <Text style={[styles.metricValue, { color: colors.success }]}>{washer.completionRate}%</Text>
                </View>
                {washer.priceLabel !== '' && (
                  <>
                    <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.metric}>
                      <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Tarif</Text>
                      <Text style={[styles.metricValue, { color: washer.price < 0 ? colors.success : '#EF4444' }]}>
                        {washer.priceLabel}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {selected ? (
          <View style={styles.footerSelected}>
            <View>
              <Text style={[styles.footerSelectedName, { color: colors.text }]}>{selected.name}</Text>
              <Text style={[styles.footerSelectedMeta, { color: colors.textSub }]}>
                ★ {selected.rating} · {selected.distance} km · {selected.eta}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmBtnText}>Confirmer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.autoBtn, { backgroundColor: colors.primary }]}
            onPress={handleConfirm}
          >
            <Text style={styles.autoBtnText}>Assignation automatique</Text>
          </TouchableOpacity>
        )}
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
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchInput: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  sortBar: { borderBottomWidth: 1, flexGrow: 0 },
  sortChip: { borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 7 },
  sortChipText: { fontSize: 13, fontWeight: '600' },
  scroll: { flex: 1 },
  infoBanner: { borderRadius: 12, borderWidth: 1, padding: 12 },
  infoBannerText: { fontSize: 12, lineHeight: 17 },
  washerCard: { borderRadius: 16, borderWidth: 1.5, padding: 16, gap: 12 },
  washerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: '700', fontSize: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  washerName: { fontSize: 15, fontWeight: '700' },
  verifiedBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  verifiedText: { fontSize: 10, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  star: { fontSize: 13 },
  ratingNum: { fontSize: 13, fontWeight: '700' },
  ratingCount: { fontSize: 12 },
  dot: { fontSize: 12, marginHorizontal: 2 },
  checkCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  checkMark: { color: 'white', fontSize: 16, fontWeight: '700' },
  specialtiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  specialtyChip: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  specialtyText: { fontSize: 11, fontWeight: '500' },
  metricsRow: { flexDirection: 'row', paddingTop: 12, borderTopWidth: 1, alignItems: 'center' },
  metric: { flex: 1, alignItems: 'center', gap: 2 },
  metricLabel: { fontSize: 10 },
  metricValue: { fontSize: 13, fontWeight: '700' },
  metricDivider: { width: 1, height: 28 },
  footer: { padding: 16, paddingBottom: 30, borderTopWidth: 1 },
  footerSelected: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerSelectedName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  footerSelectedMeta: { fontSize: 12 },
  confirmBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  confirmBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  autoBtn: { borderRadius: 14, padding: 18, alignItems: 'center' },
  autoBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
