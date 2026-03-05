import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../src/theme';

const OWM_API_KEY = 'REMPLACE_PAR_TA_CLE_OWM';

type Weather = { temp: number; description: string; icon: string; isRainy: boolean };

const WEATHER_ICONS: Record<string, string> = {
  '01': '☀️', '02': '⛅', '03': '☁️', '04': '☁️',
  '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️',
};
const RAINY_CODES = new Set(['09', '10', '11']);

const SERVICES = [
  { id: 'ext', icon: '🚿', name: 'Extérieur', price: 'dès 24€', color: '#e8f0ff', accent: '#1a6bff' },
  { id: 'full', icon: '✨', name: 'Complet', price: 'dès 39€', color: '#e8faf0', accent: '#00c853', badge: 'Populaire' },
  { id: 'int', icon: '🧹', name: 'Intérieur', price: 'dès 29€', color: '#fff8e6', accent: '#FFB800' },
  { id: 'prem', icon: '💎', name: 'Premium', price: 'dès 69€', color: '#f8f0ff', accent: '#9c27b0' },
];

const SOCIAL_STATS = [
  { value: '127', label: 'lavages cette semaine' },
  { value: '4.9★', label: 'note moyenne' },
  { value: '<2h', label: "délai d'intervention" },
];

const ACTIVE_BOOKING = {
  hasActive: true,
  service: 'Lavage complet',
  washerName: 'Thomas D.',
  washerRating: 4.9,
  eta: '45 min',
  status: 'En route',
  statusColor: '#1a6bff',
};

export default function Home() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [weather, setWeather] = useState<Weather | null>(null);

  const lastWashDays = 32;
  const carName = 'Peugeot 308';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    if (!OWM_API_KEY || OWM_API_KEY === 'REMPLACE_PAR_TA_CLE_OWM') return;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&appid=${OWM_API_KEY}&units=metric&lang=fr`
      );
      const data = await res.json();
      const code = String(data.weather[0].icon).slice(0, 2);
      setWeather({
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: WEATHER_ICONS[code] ?? '🌤️',
        isRainy: RAINY_CODES.has(code),
      });
    } catch {
      // silently ignore
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bonjour Mehdy 👋</Text>
            <Text style={styles.location}>📍 Drancy, Île-de-France</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications' as any)}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>

        {/* Social proof strip */}
        <View style={styles.socialStrip}>
          {SOCIAL_STATS.map((s, i) => (
            <View key={i} style={[styles.socialItem, i > 0 && styles.socialBorder]}>
              <Text style={styles.socialValue}>{s.value}</Text>
              <Text style={styles.socialLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <Animated.ScrollView
        style={[styles.scroll, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >

        {/* ─── Mission active ─── */}
        {ACTIVE_BOOKING.hasActive && (
          <TouchableOpacity style={styles.activeCard} onPress={() => router.push('/tracking')} activeOpacity={0.88}>
            <View style={styles.activeLeft}>
              <View style={styles.activePulse}>
                <View style={styles.activeDot} />
              </View>
              <View>
                <Text style={styles.activeService}>{ACTIVE_BOOKING.service}</Text>
                <Text style={styles.activeWasher}>
                  {ACTIVE_BOOKING.washerName} · {ACTIVE_BOOKING.washerRating}★
                </Text>
              </View>
            </View>
            <View style={styles.activeRight}>
              <View style={[styles.activeEtaBadge, { backgroundColor: ACTIVE_BOOKING.statusColor + '20' }]}>
                <Text style={[styles.activeStatus, { color: ACTIVE_BOOKING.statusColor }]}>
                  {ACTIVE_BOOKING.status}
                </Text>
              </View>
              <Text style={styles.activeEta}>ETA {ACTIVE_BOOKING.eta}</Text>
              <Text style={styles.activeArrow}>→</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ─── Météo ─── */}
        {weather && (
          <View style={[styles.weatherCard, { backgroundColor: weather.isRainy ? '#fff3e0' : (isDark ? '#1a2a1a' : '#e8faf0') }]}>
            <Text style={styles.weatherIcon}>{weather.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.weatherTemp, { color: colors.text }]}>{weather.temp}°C — {weather.description}</Text>
              {weather.isRainy ? (
                <Text style={styles.weatherBad}>⚠️ Lavage déconseillé · Service intérieur recommandé</Text>
              ) : (
                <Text style={styles.weatherGood}>✅ Conditions parfaites pour un lavage extérieur !</Text>
              )}
            </View>
          </View>
        )}

        {/* ─── Rappel lavage ─── */}
        {lastWashDays >= 30 && (
          <TouchableOpacity style={styles.reminderCard} onPress={() => router.push('/booking')} activeOpacity={0.88}>
            <Text style={styles.reminderIcon}>⏰</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.reminderTitle}>Votre {carName} attend un lavage</Text>
              <Text style={styles.reminderSub}>Dernier lavage il y a {lastWashDays} jours · Réservez en 60s</Text>
            </View>
            <View style={styles.reminderCta}>
              <Text style={styles.reminderCtaText}>Réserver →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ─── Services ─── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nos services</Text>
            <TouchableOpacity onPress={() => router.push('/booking')}>
              <Text style={styles.sectionLink}>Voir tout →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.servicesGrid}>
            {SERVICES.map((svc) => (
              <TouchableOpacity
                key={svc.id}
                style={[styles.serviceCard, { backgroundColor: isDark ? colors.card : svc.color }]}
                onPress={() => router.push('/booking')}
                activeOpacity={0.82}
              >
                {svc.badge && (
                  <View style={[styles.serviceBadge, { backgroundColor: svc.accent }]}>
                    <Text style={styles.serviceBadgeText}>{svc.badge}</Text>
                  </View>
                )}
                <Text style={styles.serviceIcon}>{svc.icon}</Text>
                <Text style={[styles.serviceName, { color: isDark ? colors.text : '#0a0a0a' }]}>{svc.name}</Text>
                <Text style={[styles.servicePrice, { color: svc.accent }]}>{svc.price}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── CTA Principal ─── */}
        <TouchableOpacity style={styles.mainCta} onPress={() => router.push('/booking')} activeOpacity={0.88}>
          <View style={styles.mainCtaLeft}>
            <Text style={styles.mainCtaTitle}>Réserver maintenant</Text>
            <Text style={styles.mainCtaSub}>Laveur disponible en moins de 2h</Text>
          </View>
          <View style={styles.mainCtaRight}>
            <Text style={styles.mainCtaArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* ─── Abonnement upsell ─── */}
        <TouchableOpacity style={styles.subBanner} onPress={() => router.push('/subscription')} activeOpacity={0.88}>
          <View>
            <View style={styles.subBannerTag}>
              <Text style={styles.subBannerTagText}>💰 ÉCONOMISEZ JUSQU'À 240€/AN</Text>
            </View>
            <Text style={styles.subBannerTitle}>Passez à l'abonnement</Text>
            <Text style={styles.subBannerSub}>Dès 39€/mois · Sans engagement · Annulation à tout moment</Text>
          </View>
          <Text style={styles.subBannerArrow}>→</Text>
        </TouchableOpacity>

        {/* ─── Parrainage ─── */}
        <TouchableOpacity style={[styles.referralCard, { backgroundColor: colors.card }]} onPress={() => router.push('/referral' as any)} activeOpacity={0.88}>
          <Text style={styles.referralIcon}>🎁</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.referralTitle, { color: colors.text }]}>Parrainez un ami, gagnez 10€</Text>
            <Text style={[styles.referralSub, { color: colors.textSub }]}>Votre ami reçoit aussi 10€ sur son premier lavage</Text>
          </View>
          <Text style={[styles.referralArrow, { color: '#1a6bff' }]}>→</Text>
        </TouchableOpacity>

        {/* ─── Derniers lavages ─── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Derniers lavages</Text>
            <TouchableOpacity onPress={() => router.push('/history' as any)}>
              <Text style={styles.sectionLink}>Historique →</Text>
            </TouchableOpacity>
          </View>
          {[
            { icon: '✨', name: 'Lavage complet', detail: 'Peugeot 308 · 14 fév.', price: '49€', stars: 5 },
            { icon: '🚿', name: 'Lavage extérieur', detail: 'Peugeot 308 · 2 fév.', price: '24€', stars: 5 },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[styles.recentCard, { backgroundColor: colors.card }]} onPress={() => router.push('/history' as any)} activeOpacity={0.85}>
              <View style={[styles.recentIconWrap, { backgroundColor: colors.cardAlt }]}>
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.recentName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.recentDetail, { color: colors.textSub }]}>{item.detail}</Text>
                <Text style={styles.recentStars}>{'★'.repeat(item.stars)}</Text>
              </View>
              <Text style={[styles.recentPrice, { color: colors.text }]}>{item.price}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Confiance ─── */}
        <View style={[styles.trustRow, { backgroundColor: colors.card }]}>
          {[
            { icon: '🔒', text: 'Paiement\nsécurisé' },
            { icon: '⭐', text: '4.9/5 sur\n1200+ avis' },
            { icon: '♻️', text: 'Éco-responsable\n5L d\'eau' },
          ].map((t, i) => (
            <View key={i} style={[styles.trustItem, i > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
              <Text style={styles.trustIcon}>{t.icon}</Text>
              <Text style={[styles.trustText, { color: colors.textSub }]}>{t.text}</Text>
            </View>
          ))}
        </View>

      </Animated.ScrollView>

      {/* ─── Bottom Nav ─── */}
      <View style={[styles.bottomNav, { backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, { color: '#1a6bff' }]}>Accueil</Text>
          <View style={styles.navDot} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/booking')}>
          <Text style={styles.navIcon}>＋</Text>
          <Text style={[styles.navLabel, { color: colors.textSub }]}>Réserver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tracking')}>
          <Text style={styles.navIcon}>📍</Text>
          <Text style={[styles.navLabel, { color: colors.textSub }]}>Suivi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={[styles.navLabel, { color: colors.textSub }]}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: { backgroundColor: '#0a0a0a', paddingTop: 58, paddingHorizontal: 20, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { color: 'white', fontSize: 18, fontWeight: '700' },
  location: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 3 },
  bellBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  bellDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: '#ff4444', borderRadius: 4, borderWidth: 1.5, borderColor: '#0a0a0a' },

  // Social proof
  socialStrip: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' },
  socialItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  socialBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)' },
  socialValue: { color: '#1a6bff', fontSize: 16, fontWeight: '800' },
  socialLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600', marginTop: 2 },

  // Scroll
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },

  // Active booking
  activeCard: {
    backgroundColor: '#0a0a0a', borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14, borderWidth: 1.5, borderColor: '#1a6bff',
  },
  activeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  activePulse: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1a6bff20', justifyContent: 'center', alignItems: 'center' },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1a6bff' },
  activeService: { color: 'white', fontSize: 14, fontWeight: '700' },
  activeWasher: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  activeRight: { alignItems: 'flex-end', gap: 4 },
  activeEtaBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  activeStatus: { fontSize: 11, fontWeight: '700' },
  activeEta: { color: 'white', fontSize: 12, fontWeight: '600' },
  activeArrow: { color: '#1a6bff', fontSize: 16, fontWeight: '700' },

  // Weather
  weatherCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, marginBottom: 14 },
  weatherIcon: { fontSize: 30 },
  weatherTemp: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize', marginBottom: 2 },
  weatherBad: { fontSize: 12, color: '#cc8800', fontWeight: '600' },
  weatherGood: { fontSize: 12, color: '#00c853', fontWeight: '600' },

  // Reminder
  reminderCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff8e6', borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: '#FFB80050',
  },
  reminderIcon: { fontSize: 26 },
  reminderTitle: { fontSize: 14, fontWeight: '700', color: '#0a0a0a' },
  reminderSub: { fontSize: 12, color: '#cc8800', marginTop: 2 },
  reminderCta: { backgroundColor: '#FFB800', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 50 },
  reminderCtaText: { color: 'white', fontSize: 11, fontWeight: '700' },

  // Section
  section: { marginBottom: 20 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  sectionLink: { fontSize: 13, color: '#1a6bff', fontWeight: '600' },

  // Services grid
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  serviceCard: {
    width: '47%', borderRadius: 16, padding: 16,
    position: 'relative', overflow: 'hidden',
  },
  serviceBadge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  serviceBadgeText: { color: 'white', fontSize: 9, fontWeight: '700' },
  serviceIcon: { fontSize: 30, marginBottom: 10 },
  serviceName: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  servicePrice: { fontSize: 12, fontWeight: '700' },

  // Main CTA
  mainCta: {
    backgroundColor: '#1a6bff', borderRadius: 18, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
    shadowColor: '#1a6bff', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  mainCtaLeft: {},
  mainCtaTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
  mainCtaSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 3 },
  mainCtaRight: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  mainCtaArrow: { color: 'white', fontSize: 20, fontWeight: '700' },

  // Subscription banner
  subBanner: {
    backgroundColor: '#0a0a0a', borderRadius: 18, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  subBannerTag: { backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  subBannerTagText: { color: '#00c853', fontSize: 10, fontWeight: '700' },
  subBannerTitle: { color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  subBannerSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  subBannerArrow: { color: 'white', fontSize: 24, fontWeight: '300' },

  // Referral
  referralCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 16, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  referralIcon: { fontSize: 28 },
  referralTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  referralSub: { fontSize: 12, lineHeight: 17 },
  referralArrow: { fontSize: 18, fontWeight: '700' },

  // Recent washes
  recentCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 16, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  recentIconWrap: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  recentName: { fontSize: 14, fontWeight: '600' },
  recentDetail: { fontSize: 12, marginTop: 2 },
  recentStars: { color: '#FFB800', fontSize: 12, marginTop: 3 },
  recentPrice: { fontSize: 16, fontWeight: '700' },

  // Trust
  trustRow: {
    flexDirection: 'row', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  trustItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  trustIcon: { fontSize: 20, marginBottom: 6 },
  trustText: { fontSize: 10, fontWeight: '600', textAlign: 'center', lineHeight: 14 },

  // Bottom nav
  bottomNav: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 24, paddingTop: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, fontWeight: '600' },
  navDot: { width: 4, height: 4, backgroundColor: '#1a6bff', borderRadius: 2 },
});
