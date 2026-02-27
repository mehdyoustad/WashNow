import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnimatedButton, AnimatedCard } from '../src/components';

export default function Home() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [160, 100],
    extrapolate: 'clamp',
  });

  const headerPadding = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [24, 14],
    extrapolate: 'clamp',
  });

  const titleSize = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [24, 18],
    extrapolate: 'clamp',
  });

  const locationOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Header animé */}
      <Animated.View style={[styles.header, { height: headerHeight, paddingHorizontal: 24, paddingTop: 50, paddingBottom: headerPadding }]}>
        <Text style={styles.greeting}>Bonjour Mehdy 👋</Text>
        <Animated.Text style={[styles.question, { fontSize: titleSize }]}>Que faisons-nous ?</Animated.Text>
        <Animated.View style={{ opacity: locationOpacity }}>
          <TouchableOpacity style={styles.locationPill}>
            <Text style={styles.locationText}>📍 Drancy, Île-de-France  ▾</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <AnimatedCard index={0}>
          <Text style={styles.sectionTitle}>Réserver un lavage</Text>
        </AnimatedCard>

        <AnimatedCard index={1}>
          <AnimatedButton style={styles.featuredCard} onPress={() => router.push('/booking')}>
            <View>
              <Text style={styles.featuredTitle}>Nouvelle réservation</Text>
              <Text style={styles.featuredSub}>En moins de 60 secondes</Text>
            </View>
            <Text style={{ fontSize: 44 }}>🚗</Text>
          </AnimatedButton>
        </AnimatedCard>

        <AnimatedCard index={2} style={styles.row}>
          <AnimatedButton style={styles.smallCard} onPress={() => router.push('/subscription')}>
            <View style={styles.badge}><Text style={styles.badgeText}>-20%</Text></View>
            <Text style={styles.cardIcon}>📦</Text>
            <Text style={styles.cardTitle}>Abonnement</Text>
            <Text style={styles.cardSub}>Dès 49€/mois</Text>
          </AnimatedButton>
          <AnimatedButton style={styles.smallCard} onPress={() => router.push('/tracking')}>
            <Text style={styles.cardIcon}>📍</Text>
            <Text style={styles.cardTitle}>Suivi en direct</Text>
            <Text style={styles.cardSub}>1 mission active</Text>
          </AnimatedButton>
        </AnimatedCard>

        <AnimatedCard index={3}>
          <View style={styles.promoCard}>
            <View style={styles.promoTag}><Text style={styles.promoTagText}>🎁 OFFRE BIENVENUE</Text></View>
            <Text style={styles.promoTitle}>10€ offerts</Text>
            <Text style={styles.promoSub}>Sur votre premier lavage</Text>
            <TouchableOpacity style={styles.promoCode}>
              <Text style={styles.promoCodeText}>BIENVENUE10</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        <AnimatedCard index={4}>
          <Text style={styles.sectionTitle}>Derniers lavages</Text>
        </AnimatedCard>

        {[
          { icon: '✨', name: 'Lavage complet', car: 'Peugeot 308 • 14 fév.', price: '49€' },
          { icon: '🚿', name: 'Lavage extérieur', car: 'Peugeot 308 • 2 fév.', price: '24€' },
        ].map((item, i) => (
          <AnimatedCard key={i} index={5 + i}>
            <View style={styles.recentCard}>
              <View style={styles.recentIcon}><Text style={{ fontSize: 22 }}>{item.icon}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recentName}>{item.name}</Text>
                <Text style={styles.recentDate}>{item.car}</Text>
                <Text style={styles.stars}>★★★★★</Text>
              </View>
              <Text style={styles.recentPrice}>{item.price}</Text>
            </View>
          </AnimatedCard>
        ))}

        <View style={{ height: 30 }} />
      </Animated.ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, { color: '#1a6bff' }]}>Accueil</Text>
          <View style={styles.navDot} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/booking')}>
          <Text style={styles.navIcon}>＋</Text>
          <Text style={styles.navLabel}>Réserver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tracking')}>
          <Text style={styles.navIcon}>📍</Text>
          <Text style={styles.navLabel}>Suivi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#0a0a0a', justifyContent: 'flex-end' },
  greeting: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 2 },
  question: { color: 'white', fontWeight: '700' },
  locationPill: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, alignSelf: 'flex-start', marginTop: 10 },
  locationText: { color: 'white', fontSize: 13 },
  scroll: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginBottom: 14, marginTop: 4 },
  featuredCard: { backgroundColor: '#1a6bff', borderRadius: 16, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  featuredTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  featuredSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  smallCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 18 },
  badge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#00c853', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '700' },
  cardIcon: { fontSize: 28, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#0a0a0a' },
  cardSub: { fontSize: 12, color: '#999', marginTop: 2 },
  promoCard: { backgroundColor: '#1a6bff', borderRadius: 16, padding: 20, marginBottom: 24 },
  promoTag: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  promoTagText: { color: 'white', fontSize: 11, fontWeight: '700' },
  promoTitle: { color: 'white', fontSize: 22, fontWeight: '700' },
  promoSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  promoCode: { backgroundColor: 'white', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 14 },
  promoCodeText: { color: '#1a6bff', fontWeight: '700', fontSize: 14 },
  recentCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  recentIcon: { width: 48, height: 48, backgroundColor: '#f5f5f5', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  recentName: { fontSize: 15, fontWeight: '600', color: '#0a0a0a' },
  recentDate: { fontSize: 12, color: '#999', marginTop: 2 },
  stars: { color: '#FFB800', fontSize: 12, marginTop: 3 },
  recentPrice: { fontSize: 16, fontWeight: '700', color: '#0a0a0a' },
  bottomNav: { flexDirection: 'row', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e8e8e8', paddingBottom: 24, paddingTop: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, fontWeight: '600', color: '#999' },
  navDot: { width: 4, height: 4, backgroundColor: '#1a6bff', borderRadius: 2 },
});