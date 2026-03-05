import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../src/theme';

type Category = 'all' | 'booking' | 'washer' | 'promo' | 'system';

interface Notif {
  id: string;
  category: 'booking' | 'washer' | 'promo' | 'system';
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: string;
  action?: string;
}

const INITIAL: Notif[] = [
  { id: '1', category: 'booking', title: 'Réservation confirmée', body: 'Votre lavage complet est confirmé pour demain 10h00.', time: "Il y a 5 min", read: false, icon: '✅', action: '/tracking' },
  { id: '2', category: 'washer', title: 'Karim est en route', body: 'Votre laveur arrive dans environ 8 minutes.', time: "Il y a 12 min", read: false, icon: '🚗', action: '/tracking' },
  { id: '3', category: 'promo', title: 'Offre exclusive — 48h', body: 'Profitez de -15% sur tout le week-end avec le code WEEKEND15.', time: "Il y a 1h", read: false, icon: '🎁', action: '/booking' },
  { id: '4', category: 'booking', title: 'Mission terminée', body: 'Votre Peugeot 308 a été lavée. Comment notez-vous Karim ?', time: "Hier, 14h32", read: true, icon: '⭐', action: '/history' },
  { id: '5', category: 'system', title: 'Nouvelle fonctionnalité', body: 'Réservez maintenant en récurrence hebdomadaire et économisez 10%.', time: "Il y a 2 jours", read: true, icon: '✨' },
  { id: '6', category: 'promo', title: 'Parrainez un ami', body: 'Invitez un ami et recevez tous les deux 10€ de crédit.', time: "Il y a 3 jours", read: true, icon: '🎯', action: '/referral' },
  { id: '7', category: 'washer', title: 'Photos disponibles', body: 'Les photos avant/après de votre dernier lavage sont disponibles.', time: "Il y a 4 jours", read: true, icon: '📸', action: '/history' },
  { id: '8', category: 'system', title: 'Rappel de lavage', body: 'Votre Peugeot 308 n\'a pas été lavée depuis 30 jours.', time: "Il y a 5 jours", read: true, icon: '🚿', action: '/booking' },
];

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'booking', label: 'Réservations' },
  { key: 'washer', label: 'Laveurs' },
  { key: 'promo', label: 'Promos' },
  { key: 'system', label: 'Système' },
];

const CATEGORY_COLORS: Record<string, string> = {
  booking: '#1a6bff',
  washer: '#00c853',
  promo: '#ff9800',
  system: '#9c27b0',
};

export default function Notifications() {
  const router = useRouter();
  const { colors } = useTheme();
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL);
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filtered = activeCategory === 'all'
    ? notifs
    : notifs.filter(n => n.category === activeCategory);

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const deleteNotif = useCallback((id: string) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  }, []);

  const handlePress = (notif: Notif) => {
    markRead(notif.id);
    if (notif.action) router.push(notif.action as any);
  };

  const renderNotif = ({ item }: { item: Notif }) => (
    <TouchableOpacity
      style={[
        styles.notifCard,
        { backgroundColor: colors.card },
        !item.read && styles.notifUnread,
      ]}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: CATEGORY_COLORS[item.category] + '20' }]}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={[styles.notifTitle, { color: colors.text }, !item.read && styles.notifTitleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
        <Text style={[styles.notifBody, { color: colors.textSub }]} numberOfLines={2}>
          {item.body}
        </Text>
        {item.action && (
          <Text style={[styles.notifAction, { color: CATEGORY_COLORS[item.category] }]}>
            Voir les détails →
          </Text>
        )}
      </View>
      {!item.read && (
        <View style={[styles.unreadDot, { backgroundColor: CATEGORY_COLORS[item.category] }]} />
      )}
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteNotif(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Tout lire</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category filters */}
      <View style={[styles.filterBar, { backgroundColor: colors.card, borderBottomColor: colors.border ?? '#e8e8e8' }]}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={item => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const active = activeCategory === item.key;
            const count = item.key === 'all'
              ? notifs.filter(n => !n.read).length
              : notifs.filter(n => n.category === item.key && !n.read).length;
            return (
              <TouchableOpacity
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveCategory(item.key)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {item.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.filterBadge, active && styles.filterBadgeActive]}>
                    <Text style={[styles.filterBadgeText, active && styles.filterBadgeTextActive]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucune notification</Text>
          <Text style={[styles.emptySub, { color: colors.textSub }]}>
            Vous serez notifié de vos réservations et offres ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderNotif}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#0a0a0a',
    gap: 12,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  backArrow: { fontSize: 30, color: 'white', lineHeight: 34 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 19, fontWeight: '700', color: 'white' },
  headerBadge: {
    backgroundColor: '#1a6bff',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  headerBadgeText: { color: 'white', fontSize: 11, fontWeight: '700' },
  markAllText: { color: '#1a6bff', fontSize: 13, fontWeight: '600' },
  filterBar: {
    borderBottomWidth: 1,
    paddingVertical: 2,
  },
  filterList: { paddingHorizontal: 16, gap: 8, paddingVertical: 10 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  filterChipActive: { backgroundColor: '#0a0a0a' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#666' },
  filterTextActive: { color: 'white' },
  filterBadge: { backgroundColor: '#e0e0e0', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  filterBadgeActive: { backgroundColor: '#1a6bff' },
  filterBadgeText: { fontSize: 10, fontWeight: '700', color: '#666' },
  filterBadgeTextActive: { color: 'white' },
  listContent: { padding: 16, paddingBottom: 32 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  notifUnread: {
    borderLeftWidth: 3,
    borderLeftColor: '#1a6bff',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconText: { fontSize: 20 },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  notifTitle: { fontSize: 14, fontWeight: '500', color: '#0a0a0a', flex: 1, marginRight: 8 },
  notifTitleUnread: { fontWeight: '700' },
  notifTime: { fontSize: 11, color: '#aaa', flexShrink: 0 },
  notifBody: { fontSize: 13, color: '#666', lineHeight: 18 },
  notifAction: { fontSize: 12, fontWeight: '600', marginTop: 6, color: '#1a6bff' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    flexShrink: 0,
  },
  deleteBtn: { padding: 4, flexShrink: 0 },
  deleteText: { fontSize: 12, color: '#ccc' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  emptySub: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 22 },
});
