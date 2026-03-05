import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Cache, CACHE_KEYS } from '../src/cache';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';
import { supabase } from '../src/supabase';
import { useTheme } from '../src/theme';

type ProfileData = { full_name?: string; email?: string; wash_count?: number; points?: number; rating?: number };

export default function Profile() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isConnected } = useNetworkStatus();
  const [profile, setProfile] = useState<ProfileData>({ full_name: 'Mehdy', email: 'mehdy@email.com', wash_count: 12, points: 650, rating: 4.9 });
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
      const { data } = await supabase.from('profiles').select('full_name, email, wash_count, points, rating').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        await Cache.set(CACHE_KEYS.PROFILE, data);
      }
    })();
  }, [isConnected]);
  const menuSections = [
    { title: 'Véhicules', items: [{ icon: '🚗', label: 'Mes véhicules', badge: '2', green: false }] },
    { title: 'Compte', items: [
      { icon: '✏️', label: 'Mon compte', badge: '', green: false, onPress: () => router.push('/edit-profile' as any) },
      { icon: '📦', label: 'Abonnement', badge: '', green: false },
      { icon: '📋', label: 'Historique des lavages', badge: '', green: false, onPress: () => router.push('/history' as any) },
      { icon: '💳', label: 'Paiement', badge: '', green: false, onPress: () => router.push('/payment-methods' as any) },
      { icon: '🎁', label: 'Parrainer un ami', badge: '', green: true, onPress: () => router.push('/referral' as any) },
      { icon: '🚗', label: 'Mes véhicules', badge: '', green: false, onPress: () => router.push('/vehicles') },
    ]},
    { title: 'Préférences', items: [
      { icon: '🔔', label: 'Notifications', badge: '', green: false, onPress: () => router.push('/notifications' as any) },
      { icon: '⚙️', label: 'Paramètres', badge: '', green: false, onPress: () => router.push('/settings' as any) },
      { icon: '🔲', label: 'Widgets écran d\'accueil', badge: '', green: false, onPress: () => router.push('/widget-preview' as any) },
      { icon: '❓', label: 'Aide & Support', badge: '', green: false, onPress: () => router.push('/support' as any) },
    ]},
    { title: 'Légal & Compte', items: [
      { icon: '📋', label: 'CGU & Confidentialité', badge: '', green: false, onPress: () => router.push('/legal' as any) },
      { icon: '🗑️', label: 'Supprimer mon compte', badge: '', green: false, danger: true, onPress: () => router.push('/delete-account' as any) },
    ]},
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={{ fontSize: 32, color: 'white' }}>{(profile.full_name ?? 'M')[0].toUpperCase()}</Text></View>
        <Text style={styles.name}>{profile.full_name ?? 'Mehdy'}</Text>
        <Text style={styles.email}>{profile.email ?? 'mehdy@email.com'}</Text>
        {fromCache && (
          <View style={{ backgroundColor: 'rgba(255,184,0,0.15)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginTop: 10 }}>
            <Text style={{ color: '#FFB800', fontSize: 12, fontWeight: '600' }}>📵 Données non synchronisées</Text>
          </View>
        )}
        <View style={styles.statsRow}>
          {[{ num: String(profile.wash_count ?? 12), label: 'Lavages' }, { num: String(profile.points ?? 650), label: 'Points' }, { num: String(profile.rating ?? 4.9), label: 'Note' }].map((s, i) => (
            <View key={i} style={[styles.stat, i > 0 && styles.statBorder]}>
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Éco-impact total */}
        <View style={styles.ecoCard}>
          <View style={styles.ecoHeader}>
            <Text style={styles.ecoTitle}>🌱 Mon impact écologique</Text>
            <View style={styles.ecoBadge}><Text style={styles.ecoBadgeText}>🏅 Éco-guerrier</Text></View>
          </View>
          <View style={styles.ecoRow}>
            {[
              { num: '1740L', label: '💧 eau économisée' },
              { num: '6kg', label: '♻️ CO₂ évité' },
              { num: '12', label: '🚿 lavages eco' },
            ].map((s, i) => (
              <View key={i} style={[styles.ecoStat, i > 0 && styles.ecoStatBorder]}>
                <Text style={styles.ecoStatNum}>{s.num}</Text>
                <Text style={styles.ecoStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.loyaltyCard} onPress={() => router.push('/rewards' as any)}>
          <View style={styles.loyaltyTop}>
            <Text style={styles.loyaltyTitle}>Programme fidélité 🏆</Text>
            <Text style={styles.loyaltyPoints}>650 pts</Text>
          </View>
          <View style={styles.barBg}><View style={styles.barFill} /></View>
          <View style={styles.barLabels}>
            <Text style={styles.barLabel}>650 pts</Text>
            <Text style={styles.barLabel}>1000 pts = -10€</Text>
          </View>
        </TouchableOpacity>

        {menuSections.map((section, si) => (
          <View key={si} style={styles.menuSection}>
            <Text style={[styles.menuTitle, { color: colors.textSub }]}>{section.title}</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
              {section.items.map((item: any, ii) => (
  <TouchableOpacity key={ii} style={[styles.menuItem, ii > 0 && [styles.menuItemBorder, { borderTopColor: colors.border }]]} onPress={item.onPress}>
                  <View style={[styles.menuIcon, { backgroundColor: colors.cardAlt }]}><Text style={{ fontSize: 18 }}>{item.icon}</Text></View>
                  <Text style={[styles.menuLabel, { color: item.danger ? '#cc3333' : colors.text }]}>{item.label}</Text>
                  {item.badge && <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View>}
                  {item.green && <View style={styles.greenBadge}><Text style={styles.greenBadgeText}>+10€</Text></View>}
                  <Text style={[styles.menuArrow, { color: item.danger ? '#cc3333' : colors.textSub }]}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.card }]} onPress={() => router.push('/login')}>
          <View style={styles.menuIcon}><Text style={{ fontSize: 18 }}>🚪</Text></View>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>

      <View style={[styles.bottomNav, { backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
          <Text style={styles.navIcon}>🏠</Text><Text style={styles.navLabel}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/booking')}>
          <Text style={styles.navIcon}>＋</Text><Text style={styles.navLabel}>Réserver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tracking')}>
          <Text style={styles.navIcon}>📍</Text><Text style={styles.navLabel}>Suivi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text><Text style={[styles.navLabel, { color: '#1a6bff' }]}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#0a0a0a', padding: 24, paddingTop: 60, alignItems: 'flex-start' },
  avatar: { width: 72, height: 72, backgroundColor: '#1a6bff', borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '700', color: 'white' },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, marginTop: 20, width: '100%' },
  stat: { flex: 1, alignItems: 'center', padding: 16 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)' },
  statNum: { fontSize: 20, fontWeight: '700', color: 'white' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
  scroll: { flex: 1, padding: 20 },
  loyaltyCard: { backgroundColor: '#0a0a0a', borderRadius: 16, padding: 20, marginBottom: 24 },
  loyaltyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  loyaltyTitle: { fontSize: 14, fontWeight: '700', color: 'white' },
  loyaltyPoints: { fontSize: 24, fontWeight: '700', color: '#FFB800' },
  barBg: { backgroundColor: 'rgba(255,255,255,0.1)', height: 6, borderRadius: 3 },
  barFill: { width: '65%', height: 6, backgroundColor: '#FFB800', borderRadius: 3 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  barLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  menuSection: { marginBottom: 20 },
  menuTitle: { fontSize: 12, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  menuCard: { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  menuItemBorder: { borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  menuIcon: { width: 36, height: 36, backgroundColor: '#f5f5f5', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#0a0a0a' },
  menuArrow: { color: '#999', fontSize: 18 },
  badge: { backgroundColor: '#1a6bff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { color: 'white', fontSize: 11, fontWeight: '700' },
  greenBadge: { backgroundColor: '#e8faf0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  greenBadgeText: { color: '#00c853', fontSize: 11, fontWeight: '700' },
  ecoCard: { backgroundColor: '#e8faf0', borderRadius: 16, padding: 18, marginBottom: 20 },
  ecoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  ecoTitle: { fontSize: 14, fontWeight: '700', color: '#0a0a0a' },
  ecoBadge: { backgroundColor: '#00c853', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  ecoBadgeText: { color: 'white', fontSize: 11, fontWeight: '700' },
  ecoRow: { flexDirection: 'row' },
  ecoStat: { flex: 1, alignItems: 'center' },
  ecoStatBorder: { borderLeftWidth: 1, borderLeftColor: '#c8e6c9' },
  ecoStatNum: { fontSize: 18, fontWeight: '700', color: '#00c853' },
  ecoStatLabel: { fontSize: 10, color: '#555', marginTop: 3, textAlign: 'center' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'white', borderRadius: 16, padding: 16 },
  logoutText: { fontSize: 15, fontWeight: '500', color: '#cc3333' },
  bottomNav: { flexDirection: 'row', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e8e8e8', paddingBottom: 24, paddingTop: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, fontWeight: '600', color: '#999' },
});