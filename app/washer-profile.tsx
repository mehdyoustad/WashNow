import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../src/theme';

// En production: récupérer via route params + supabase
const WASHER = {
  id: 'w1',
  name: 'Karim B.',
  initial: 'K',
  rating: 4.9,
  totalRatings: 247,
  missions: 247,
  memberSince: 'Jan. 2023',
  bio: 'Professionnel du lavage automobile depuis 4 ans. Spécialiste en lustrage et traitement nano-céramique. Ponctuel et minutieux.',
  specialties: ['Lavage extérieur', 'Lavage complet', 'Lavage premium', 'Lustrage'],
  zones: ['Drancy (93)', 'Bobigny (93)', 'Aubervilliers (93)', 'Saint-Denis (93)'],
  acceptanceRate: 96,
  avgResponseTime: '3 min',
  completionRate: 99,
  verified: true,
};

const REVIEWS = [
  { id: '1', author: 'Mehdy A.', rating: 5, date: 'Il y a 2 jours', comment: 'Karim est arrivé à l\'heure, travail impeccable. Voiture nickel !', service: 'Lavage complet' },
  { id: '2', author: 'Sarah L.', rating: 5, date: 'Il y a 1 semaine', comment: 'Super professionnel, très soigneux avec la carrosserie. Je recommande vivement.', service: 'Lavage premium' },
  { id: '3', author: 'Thomas R.', rating: 4, date: 'Il y a 2 semaines', comment: 'Bon travail dans l\'ensemble, légèrement en retard mais a prévenu.', service: 'Lavage extérieur' },
  { id: '4', author: 'Yasmine B.', rating: 5, date: 'Il y a 3 semaines', comment: 'Parfait comme toujours ! C\'est mon laveur attitré maintenant.', service: 'Lavage complet' },
];

const STATS = [
  { label: 'Note', value: '4.9', sub: `${WASHER.totalRatings} avis` },
  { label: 'Missions', value: '247', sub: 'complétées' },
  { label: 'Réponse', value: '3 min', sub: 'en moyenne' },
];

export default function WasherProfile() {
  const router = useRouter();
  const { colors } = useTheme();

  const starsRow = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={[styles.star, { color: i < rating ? '#F59E0B' : colors.border }]}>★</Text>
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil du laveur</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero identité */}
        <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{WASHER.initial}</Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{WASHER.name}</Text>

          <View style={styles.ratingRow}>
            {starsRow(Math.round(WASHER.rating))}
            <Text style={[styles.ratingNum, { color: colors.text }]}>{WASHER.rating}</Text>
            <Text style={[styles.ratingCount, { color: colors.textSub }]}>({WASHER.totalRatings} avis)</Text>
          </View>

          <View style={styles.badgesRow}>
            {WASHER.verified && (
              <View style={[styles.badge, { backgroundColor: colors.primary + '14' }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>Laveur vérifié</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: colors.success + '14' }]}>
              <Text style={[styles.badgeText, { color: colors.success }]}>Membre depuis {WASHER.memberSince}</Text>
            </View>
          </View>

          <Text style={[styles.bio, { color: colors.textSub }]}>{WASHER.bio}</Text>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
          {STATS.map((s, i) => (
            <View key={i} style={[styles.statItem, i > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>{s.label}</Text>
              <Text style={[styles.statSub, { color: colors.textSub }]}>{s.sub}</Text>
            </View>
          ))}
        </View>

        {/* Performance */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Indicateurs de performance</Text>
          {[
            { label: "Taux d'acceptation", value: `${WASHER.acceptanceRate}%`, color: colors.success },
            { label: 'Taux de complétion', value: `${WASHER.completionRate}%`, color: colors.success },
            { label: 'Temps de réponse moyen', value: WASHER.avgResponseTime, color: colors.primary },
          ].map((row, i) => (
            <View key={i} style={[styles.perfRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={[styles.perfLabel, { color: colors.textSub }]}>{row.label}</Text>
              <Text style={[styles.perfValue, { color: row.color }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Spécialités */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Spécialités</Text>
          <View style={styles.chipWrap}>
            {WASHER.specialties.map((s, i) => (
              <View key={i} style={[styles.chip, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
                <Text style={[styles.chipText, { color: colors.primary }]}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Zones */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Zones d'intervention</Text>
          <View style={styles.chipWrap}>
            {WASHER.zones.map((z, i) => (
              <View key={i} style={[styles.chip, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
                <Text style={[styles.chipText, { color: colors.textSub }]}>{z}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Avis récents */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Avis récents</Text>
        {REVIEWS.map(review => (
          <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.card }]}>
            <View style={styles.reviewHeader}>
              <View style={[styles.reviewAvatar, { backgroundColor: colors.cardAlt }]}>
                <Text style={[styles.reviewAvatarText, { color: colors.textSub }]}>{review.author[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.reviewAuthor, { color: colors.text }]}>{review.author}</Text>
                <Text style={[styles.reviewMeta, { color: colors.textSub }]}>{review.service} · {review.date}</Text>
              </View>
              <View style={styles.reviewStars}>
                {starsRow(review.rating)}
              </View>
            </View>
            <Text style={[styles.reviewComment, { color: colors.textSub }]}>{review.comment}</Text>
          </View>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* CTA réserver */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/booking' as any)}
        >
          <Text style={styles.bookBtnText}>Réserver avec {WASHER.name.split(' ')[0]}</Text>
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
  scroll: { flex: 1, padding: 16 },
  heroCard: { borderRadius: 16, padding: 24, marginBottom: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  avatar: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  avatarText: { color: 'white', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 12 },
  star: { fontSize: 16 },
  ratingNum: { fontSize: 15, fontWeight: '700', marginLeft: 4 },
  ratingCount: { fontSize: 13 },
  badgesRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  bio: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
  statsRow: { flexDirection: 'row', borderRadius: 16, marginBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statValue: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  statSub: { fontSize: 11 },
  card: { borderRadius: 16, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  perfRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  perfLabel: { fontSize: 13 },
  perfValue: { fontSize: 14, fontWeight: '700' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '500' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  reviewCard: { borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  reviewAvatarText: { fontWeight: '700', fontSize: 14 },
  reviewAuthor: { fontSize: 13, fontWeight: '700' },
  reviewMeta: { fontSize: 11, marginTop: 2 },
  reviewStars: { flexDirection: 'row', gap: 1 },
  reviewComment: { fontSize: 13, lineHeight: 18 },
  footer: { padding: 16, paddingBottom: 30, borderTopWidth: 1 },
  bookBtn: { borderRadius: 14, padding: 18, alignItems: 'center' },
  bookBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
