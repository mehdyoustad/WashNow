import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../src/theme';

const CURRENT_POINTS = 650;
const MAX_POINTS = 1000;

const REWARDS = [
  {
    id: '1',
    icon: '💶',
    title: '-10€ sur votre prochain lavage',
    points: 500,
    available: CURRENT_POINTS >= 500,
  },
  {
    id: '2',
    icon: '🚿',
    title: 'Lavage extérieur offert',
    points: 750,
    available: CURRENT_POINTS >= 750,
  },
  {
    id: '3',
    icon: '✨',
    title: 'Lavage complet gratuit',
    points: 1000,
    available: CURRENT_POINTS >= 1000,
  },
  {
    id: '4',
    icon: '👑',
    title: 'Lavage premium gratuit',
    points: 1500,
    available: CURRENT_POINTS >= 1500,
  },
];

const POINTS_HISTORY = [
  { id: '1', label: 'Lavage complet', date: '2 mars', points: +100, icon: '✅' },
  { id: '2', label: 'Parrainage Karim', date: '14 fév.', points: +150, icon: '🎁' },
  { id: '3', label: 'Lavage extérieur', date: '2 fév.', points: +50, icon: '✅' },
  { id: '4', label: 'Récompense utilisée', date: '10 jan.', points: -500, icon: '💶' },
  { id: '5', label: 'Lavage premium', date: '3 jan.', points: +200, icon: '✅' },
];

export default function Rewards() {
  const router = useRouter();
  const { colors } = useTheme();
  const progress = Math.min(CURRENT_POINTS / MAX_POINTS, 1);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Programme fidélité</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero points */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Vos points</Text>
          <Text style={styles.heroPoints}>{CURRENT_POINTS}</Text>
          <Text style={styles.heroUnit}>points</Text>

          {/* Barre de progression */}
          <View style={styles.progressWrap}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>{CURRENT_POINTS} pts</Text>
              <Text style={styles.progressLabel}>{MAX_POINTS} pts → lavage gratuit</Text>
            </View>
          </View>

          <View style={styles.nextRewardBadge}>
            <Text style={styles.nextRewardText}>
              ✨ Plus que {MAX_POINTS - CURRENT_POINTS} pts pour un lavage offert
            </Text>
          </View>
        </View>

        {/* Récompenses */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>RÉCOMPENSES DISPONIBLES</Text>
          {REWARDS.map((r) => (
            <View
              key={r.id}
              style={[
                styles.rewardCard,
                { backgroundColor: colors.card },
                !r.available && { opacity: 0.5 },
              ]}
            >
              <View style={styles.rewardLeft}>
                <View style={[styles.rewardIcon, { backgroundColor: r.available ? '#e8f0ff' : colors.inputBg }]}>
                  <Text style={{ fontSize: 22 }}>{r.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rewardTitle, { color: colors.text }]}>{r.title}</Text>
                  <Text style={[styles.rewardPoints, { color: r.available ? '#1a6bff' : colors.textSub }]}>
                    {r.points} pts
                  </Text>
                </View>
              </View>
              {r.available ? (
                <TouchableOpacity style={styles.rewardBtn}>
                  <Text style={styles.rewardBtnText}>Utiliser</Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.rewardLocked, { color: colors.textSub }]}>
                  {r.points - CURRENT_POINTS} pts
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Historique des points */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>HISTORIQUE DES POINTS</Text>
          <View style={[styles.historyCard, { backgroundColor: colors.card }]}>
            {POINTS_HISTORY.map((item, i) => (
              <View
                key={item.id}
                style={[styles.historyRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
              >
                <Text style={styles.historyIcon}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.historyLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.historyDate, { color: colors.textSub }]}>{item.date}</Text>
                </View>
                <Text
                  style={[
                    styles.historyPoints,
                    { color: item.points > 0 ? '#00c853' : '#cc3333' },
                  ]}
                >
                  {item.points > 0 ? '+' : ''}{item.points} pts
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Comment gagner des points */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>COMMENT GAGNER DES POINTS</Text>
          <View style={[styles.howCard, { backgroundColor: colors.card }]}>
            {[
              { icon: '🚿', label: 'Lavage extérieur', pts: '+50 pts' },
              { icon: '✨', label: 'Lavage complet', pts: '+100 pts' },
              { icon: '👑', label: 'Lavage premium', pts: '+200 pts' },
              { icon: '🎁', label: 'Parrainage ami', pts: '+150 pts' },
              { icon: '⭐', label: 'Laisser un avis', pts: '+20 pts' },
            ].map((item, i) => (
              <View
                key={i}
                style={[styles.howRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
              >
                <Text style={{ fontSize: 20, width: 30 }}>{item.icon}</Text>
                <Text style={[styles.howLabel, { color: colors.text }]}>{item.label}</Text>
                <Text style={styles.howPts}>{item.pts}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#0a0a0a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 32, color: 'white', lineHeight: 36 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: 'white' },
  hero: {
    backgroundColor: '#0a0a0a',
    padding: 28,
    paddingBottom: 32,
    alignItems: 'center',
  },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  heroPoints: { fontSize: 72, fontWeight: '900', color: '#FFB800', lineHeight: 80 },
  heroUnit: { fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 24 },
  progressWrap: { width: '100%', marginBottom: 14 },
  progressBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: '#FFB800', borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  progressLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  nextRewardBadge: { backgroundColor: 'rgba(255,184,0,0.15)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  nextRewardText: { fontSize: 13, color: '#FFB800', fontWeight: '600' },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  rewardCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 10 },
  rewardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rewardIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  rewardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  rewardPoints: { fontSize: 13, fontWeight: '700' },
  rewardBtn: { backgroundColor: '#1a6bff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  rewardBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
  rewardLocked: { fontSize: 12, fontWeight: '600' },
  historyCard: { borderRadius: 16, overflow: 'hidden' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  historyIcon: { fontSize: 18 },
  historyLabel: { fontSize: 14, fontWeight: '600' },
  historyDate: { fontSize: 12, marginTop: 2 },
  historyPoints: { fontSize: 14, fontWeight: '800' },
  howCard: { borderRadius: 16, overflow: 'hidden' },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  howLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  howPts: { fontSize: 13, fontWeight: '700', color: '#00c853' },
});
