import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Cache, CACHE_KEYS } from '../src/cache';
import TabBar from '../src/components/TabBar';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';
import { supabase } from '../src/supabase';
import { useTheme } from '../src/theme';

type ProfileData = {
  full_name?: string;
  email?: string;
  wash_count?: number;
  points?: number;
  rating?: number;
};

export default function Profile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isConnected } = useNetworkStatus();
  const [profile, setProfile] = useState<ProfileData>({
    full_name: 'Mehdy',
    email: 'mehdy@email.com',
    wash_count: 12,
    points: 650,
    rating: 4.9,
  });
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    (async () => {
      if (!isConnected) {
        const cached = await Cache.get<ProfileData>(CACHE_KEYS.PROFILE);
        if (cached) { setProfile(cached); setFromCache(true); }
        return;
      }
      setFromCache(false);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, wash_count, points, rating')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfile(data);
        await Cache.set(CACHE_KEYS.PROFILE, data);
      }
    })();
  }, [isConnected]);

  const menuSections = [
    {
      title: 'Véhicules & Services',
      items: [
        { label: 'Mes véhicules', onPress: () => router.push('/vehicles') },
        { label: 'Abonnement', onPress: () => router.push('/subscription' as any) },
        { label: 'Historique des lavages', onPress: () => router.push('/history' as any) },
      ],
    },
    {
      title: 'Compte',
      items: [
        { label: 'Mon compte', onPress: () => router.push('/edit-profile' as any) },
        { label: 'Paiement', onPress: () => router.push('/payment-methods' as any) },
        { label: 'Parrainer un ami', onPress: () => router.push('/referral' as any), tag: '+10€' },
      ],
    },
    {
      title: 'Préférences',
      items: [
        { label: 'Notifications', onPress: () => router.push('/notifications' as any) },
        { label: 'Paramètres', onPress: () => router.push('/settings' as any) },
        { label: 'Aide & Support', onPress: () => router.push('/support' as any) },
      ],
    },
    {
      title: 'Légal',
      items: [
        { label: 'CGU & Confidentialité', onPress: () => router.push('/legal' as any) },
        { label: 'Supprimer mon compte', onPress: () => router.push('/delete-account' as any), danger: true },
      ],
    },
  ];

  const initial = (profile.full_name ?? 'M')[0].toUpperCase();
  const pointsProgress = Math.min(((profile.points ?? 0) / 1000) * 100, 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View>
            <Text style={styles.name}>{profile.full_name ?? 'Mehdy'}</Text>
            <Text style={styles.email}>{profile.email ?? 'mehdy@email.com'}</Text>
          </View>
        </View>

        {fromCache && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineBadgeText}>Données non synchronisées</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          {[
            { num: String(profile.wash_count ?? 12), label: 'Lavages' },
            { num: String(profile.points ?? 650), label: 'Points' },
            { num: `${profile.rating ?? 4.9} / 5`, label: 'Note' },
          ].map((s, i) => (
            <View key={i} style={[styles.stat, i > 0 && styles.statBorder]}>
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Impact écologique */}
        <View style={[styles.ecoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.ecoHeader}>
            <Text style={[styles.ecoTitle, { color: colors.text }]}>Impact écologique</Text>
            <View style={[styles.ecoBadge, { backgroundColor: '#F0FDF4' }]}>
              <Text style={[styles.ecoBadgeText, { color: colors.success }]}>Eco-guerrier</Text>
            </View>
          </View>
          <View style={styles.ecoRow}>
            {[
              { num: '1 740L', label: 'eau économisée' },
              { num: '6 kg', label: 'CO₂ évité' },
              { num: '12', label: 'lavages eco' },
            ].map((s, i) => (
              <View key={i} style={[styles.ecoStat, i > 0 && [styles.ecoStatBorder, { borderLeftColor: colors.border }]]}>
                <Text style={[styles.ecoStatNum, { color: colors.success }]}>{s.num}</Text>
                <Text style={[styles.ecoStatLabel, { color: colors.textSub }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Programme fidélité */}
        <TouchableOpacity
          style={[styles.loyaltyCard, { backgroundColor: colors.header }]}
          onPress={() => router.push('/rewards' as any)}
        >
          <View style={styles.loyaltyTop}>
            <Text style={styles.loyaltyTitle}>Programme fidélité</Text>
            <Text style={styles.loyaltyPoints}>{profile.points ?? 650} pts</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${pointsProgress}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>{profile.points ?? 650} pts</Text>
            <Text style={styles.progressLabel}>1 000 pts = -10€</Text>
          </View>
        </TouchableOpacity>

        {/* Menu */}
        {menuSections.map((section, si) => (
          <View key={si} style={styles.menuSection}>
            <Text style={[styles.menuSectionTitle, { color: colors.textMuted }]}>
              {section.title.toUpperCase()}
            </Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item: any, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[
                    styles.menuItem,
                    ii > 0 && [styles.menuItemBorder, { borderTopColor: colors.border }],
                  ]}
                  onPress={item.onPress}
                >
                  <Text style={[
                    styles.menuLabel,
                    { color: item.danger ? colors.danger : colors.text },
                  ]}>
                    {item.label}
                  </Text>
                  {item.tag && (
                    <View style={[styles.menuTag, { backgroundColor: '#F0FDF4' }]}>
                      <Text style={[styles.menuTagText, { color: colors.success }]}>{item.tag}</Text>
                    </View>
                  )}
                  <Text style={[styles.menuArrow, { color: item.danger ? colors.danger : colors.textMuted }]}>
                    ›
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Déconnexion */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/login')}
        >
          <Text style={[styles.logoutText, { color: colors.danger }]}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      <TabBar active="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    backgroundColor: '#0D0D0D',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  name: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 3 },

  offlineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(217,119,6,0.15)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 14,
  },
  offlineBadgeText: { color: '#D97706', fontSize: 12, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.08)' },
  statNum: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 },

  scroll: { flex: 1, padding: 16 },

  ecoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  ecoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  ecoTitle: { fontSize: 14, fontWeight: '700' },
  ecoBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 },
  ecoBadgeText: { fontSize: 11, fontWeight: '700' },
  ecoRow: { flexDirection: 'row' },
  ecoStat: { flex: 1, alignItems: 'center' },
  ecoStatBorder: { borderLeftWidth: 1 },
  ecoStatNum: { fontSize: 17, fontWeight: '700' },
  ecoStatLabel: { fontSize: 10, marginTop: 3, textAlign: 'center' },

  loyaltyCard: { borderRadius: 12, padding: 18, marginBottom: 20 },
  loyaltyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  loyaltyTitle: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  loyaltyPoints: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  progressBarBg: { backgroundColor: 'rgba(255,255,255,0.1)', height: 5, borderRadius: 3 },
  progressBarFill: { height: 5, backgroundColor: '#1558E7', borderRadius: 3 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  progressLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },

  menuSection: { marginBottom: 18 },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  menuCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuItemBorder: { borderTopWidth: 1 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  menuTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginRight: 8 },
  menuTagText: { fontSize: 11, fontWeight: '700' },
  menuArrow: { fontSize: 18 },

  logoutBtn: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutText: { fontSize: 15, fontWeight: '600' },

});
