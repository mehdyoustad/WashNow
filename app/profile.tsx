import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const router = useRouter();
  const menuSections = [
    { title: 'Véhicules', items: [{ icon: '🚗', label: 'Mes véhicules', badge: '2', green: false }] },
    { title: 'Compte', items: [
      { icon: '📦', label: 'Abonnement', badge: '', green: false },
      { icon: '📋', label: 'Historique des lavages', badge: '', green: false, onPress: () => router.push('/history' as any) },
      { icon: '💳', label: 'Paiement', badge: '', green: false },
      { icon: '🎁', label: 'Parrainer un ami', badge: '', green: true, onPress: () => router.push('/referral' as any) },
      { icon: '🚗', label: 'Mes véhicules', badge: '', green: false, onPress: () => router.push('/vehicles') },
    ]},
    { title: 'Préférences', items: [
      { icon: '🔔', label: 'Notifications', badge: '', green: false },
      { icon: '❓', label: 'Aide & Support', badge: '', green: false },
    ]},
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={{ fontSize: 32, color: 'white' }}>M</Text></View>
        <Text style={styles.name}>Mehdy</Text>
        <Text style={styles.email}>mehdy@email.com</Text>
        <View style={styles.statsRow}>
          {[{ num: '12', label: 'Lavages' }, { num: '650', label: 'Points' }, { num: '4.9', label: 'Note' }].map((s, i) => (
            <View key={i} style={[styles.stat, i > 0 && styles.statBorder]}>
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyTop}>
            <Text style={styles.loyaltyTitle}>Programme fidélité 🏆</Text>
            <Text style={styles.loyaltyPoints}>650 pts</Text>
          </View>
          <View style={styles.barBg}><View style={styles.barFill} /></View>
          <View style={styles.barLabels}>
            <Text style={styles.barLabel}>650 pts</Text>
            <Text style={styles.barLabel}>1000 pts = -10€</Text>
          </View>
        </View>

        {menuSections.map((section, si) => (
          <View key={si} style={styles.menuSection}>
            <Text style={styles.menuTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item: any, ii) => (
  <TouchableOpacity key={ii} style={[styles.menuItem, ii > 0 && styles.menuItemBorder]} onPress={item.onPress}>
                  <View style={styles.menuIcon}><Text style={{ fontSize: 18 }}>{item.icon}</Text></View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.badge && <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View>}
                  {item.green && <View style={styles.greenBadge}><Text style={styles.greenBadgeText}>+10€</Text></View>}
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={() => router.push('/login')}>
          <View style={styles.menuIcon}><Text style={{ fontSize: 18 }}>🚪</Text></View>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>

      <View style={styles.bottomNav}>
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
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'white', borderRadius: 16, padding: 16 },
  logoutText: { fontSize: 15, fontWeight: '500', color: '#cc3333' },
  bottomNav: { flexDirection: 'row', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e8e8e8', paddingBottom: 24, paddingTop: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, fontWeight: '600', color: '#999' },
});