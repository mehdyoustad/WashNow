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
import TabBar from '../src/components/TabBar';
import { useTheme } from '../src/theme';

const OWM_API_KEY = 'REMPLACE_PAR_TA_CLE_OWM';

type Weather = { temp: number; description: string; isRainy: boolean };
const RAINY_CODES = new Set(['09', '10', '11']);

const SERVICES = [
  { id: 'ext', abbr: 'EX', name: 'Extérieur', price: 'dès 24€', desc: 'Carrosserie, vitres, jantes' },
  { id: 'full', abbr: 'CO', name: 'Complet', price: 'dès 39€', desc: 'Extérieur + intérieur aspiré', badge: 'Populaire' },
  { id: 'int', abbr: 'IN', name: 'Intérieur', price: 'dès 29€', desc: 'Aspiration, plastiques' },
  { id: 'prem', abbr: 'PR', name: 'Premium', price: 'dès 69€', desc: 'Traitement complet' },
];

const SOCIAL_STATS = [
  { value: '127', label: 'lavages / semaine' },
  { value: '4.9', label: 'note moyenne' },
  { value: '< 2h', label: 'délai moyen' },
];

const ACTIVE_BOOKING = {
  hasActive: true,
  service: 'Lavage complet',
  washerName: 'Thomas D.',
  washerRating: '4.9',
  eta: '45 min',
  status: 'En route',
};

export default function Home() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const [weather, setWeather] = useState<Weather | null>(null);

  const lastWashDays = 32;
  const carName = 'Peugeot 308';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
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
        isRainy: RAINY_CODES.has(code),
      });
    } catch {
      // silently ignore
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bonjour, Mehdy</Text>
            <Text style={styles.location}>Drancy, Île-de-France</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/notifications' as any)}
          >
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          {SOCIAL_STATS.map((s, i) => (
            <View key={i} style={[styles.statItem, i > 0 && styles.statBorder]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <Animated.ScrollView
        style={[styles.scroll, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Réservation active */}
        {ACTIVE_BOOKING.hasActive && (
          <TouchableOpacity
            style={[styles.activeCard, { borderColor: colors.primary }]}
            onPress={() => router.push('/tracking')}
            activeOpacity={0.88}
          >
            <View style={styles.activeLeft}>
              <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
              <View>
                <Text style={styles.activeService}>{ACTIVE_BOOKING.service}</Text>
                <Text style={styles.activeWasher}>
                  {ACTIVE_BOOKING.washerName} · {ACTIVE_BOOKING.washerRating} / 5
                </Text>
              </View>
            </View>
            <View style={styles.activeRight}>
              <View style={[styles.activeStatusBadge, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.activeStatusText, { color: colors.primary }]}>
                  {ACTIVE_BOOKING.status}
                </Text>
              </View>
              <Text style={styles.activeEta}>ETA {ACTIVE_BOOKING.eta}</Text>
              <Text style={[styles.activeArrow, { color: colors.primary }]}>→</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Météo */}
        {weather && (
          <View style={[
            styles.weatherCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}>
            <View style={[
              styles.weatherBar,
              { backgroundColor: weather.isRainy ? '#92400E' : colors.success },
            ]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.weatherTemp, { color: colors.text }]}>
                {weather.temp}°C — {weather.description}
              </Text>
              <Text style={[
                styles.weatherSub,
                { color: weather.isRainy ? '#92400E' : colors.success },
              ]}>
                {weather.isRainy
                  ? 'Lavage déconseillé — service intérieur recommandé'
                  : 'Conditions idéales pour un lavage extérieur'}
              </Text>
            </View>
          </View>
        )}

        {/* Rappel */}
        {lastWashDays >= 30 && (
          <TouchableOpacity
            style={[styles.reminderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/booking')}
            activeOpacity={0.88}
          >
            <View style={[styles.reminderBar, { backgroundColor: '#D97706' }]} />
            <View style={{ flex: 1, paddingLeft: 14 }}>
              <Text style={[styles.reminderTitle, { color: colors.text }]}>
                {carName} — dernier lavage il y a {lastWashDays} jours
              </Text>
              <Text style={[styles.reminderSub, { color: colors.textSub }]}>
                Réservez en moins d'une minute
              </Text>
            </View>
            <View style={[styles.reminderBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.reminderBtnText}>Réserver</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Services */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nos services</Text>
            <TouchableOpacity onPress={() => router.push('/booking')}>
              <Text style={[styles.sectionLink, { color: colors.primary }]}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.servicesGrid}>
            {SERVICES.map((svc) => (
              <TouchableOpacity
                key={svc.id}
                style={[styles.serviceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push('/booking')}
                activeOpacity={0.82}
              >
                {svc.badge && (
                  <View style={[styles.serviceBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.serviceBadgeText}>{svc.badge}</Text>
                  </View>
                )}
                <View style={[styles.serviceAbbr, { backgroundColor: colors.cardAlt }]}>
                  <Text style={[styles.serviceAbbrText, { color: colors.primary }]}>{svc.abbr}</Text>
                </View>
                <Text style={[styles.serviceName, { color: colors.text }]}>{svc.name}</Text>
                <Text style={[styles.serviceDesc, { color: colors.textSub }]}>{svc.desc}</Text>
                <Text style={[styles.servicePrice, { color: colors.primary }]}>{svc.price}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA principal */}
        <TouchableOpacity
          style={[styles.mainCta, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/booking')}
          activeOpacity={0.88}
        >
          <View>
            <Text style={styles.mainCtaTitle}>Réserver maintenant</Text>
            <Text style={styles.mainCtaSub}>Laveur disponible en moins de 2h</Text>
          </View>
          <Text style={styles.mainCtaArrow}>→</Text>
        </TouchableOpacity>

        {/* Abonnement */}
        <TouchableOpacity
          style={[styles.subCard, { backgroundColor: colors.header }]}
          onPress={() => router.push('/subscription')}
          activeOpacity={0.88}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.subTag}>
              <Text style={[styles.subTagText, { color: colors.primary }]}>
                JUSQU'A 240€ D'ECONOMIES / AN
              </Text>
            </View>
            <Text style={styles.subTitle}>Passez à l'abonnement</Text>
            <Text style={styles.subSub}>Dès 39€ / mois · Sans engagement</Text>
          </View>
          <Text style={styles.subArrow}>→</Text>
        </TouchableOpacity>

        {/* Parrainage */}
        <TouchableOpacity
          style={[styles.referralCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/referral' as any)}
          activeOpacity={0.88}
        >
          <View style={[styles.referralIconBox, { backgroundColor: colors.cardAlt }]}>
            <Text style={[styles.referralIconText, { color: colors.primary }]}>+10€</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.referralTitle, { color: colors.text }]}>
              Parrainez un ami, gagnez 10€
            </Text>
            <Text style={[styles.referralSub, { color: colors.textSub }]}>
              Votre ami reçoit aussi 10€ sur son premier lavage
            </Text>
          </View>
          <Text style={[styles.referralArrow, { color: colors.primary }]}>→</Text>
        </TouchableOpacity>

        {/* Derniers lavages */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Derniers lavages</Text>
            <TouchableOpacity onPress={() => router.push('/history' as any)}>
              <Text style={[styles.sectionLink, { color: colors.primary }]}>Historique</Text>
            </TouchableOpacity>
          </View>
          {[
            { abbr: 'CO', name: 'Lavage complet', detail: 'Peugeot 308 · 14 fév.', price: '49€', stars: 5 },
            { abbr: 'EX', name: 'Lavage extérieur', detail: 'Peugeot 308 · 2 fév.', price: '24€', stars: 5 },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.recentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/history' as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.recentAbbr, { backgroundColor: colors.cardAlt }]}>
                <Text style={[styles.recentAbbrText, { color: colors.primary }]}>{item.abbr}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.recentName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.recentDetail, { color: colors.textSub }]}>{item.detail}</Text>
                <Text style={[styles.recentStars, { color: '#D97706' }]}>
                  {'★'.repeat(item.stars)}
                </Text>
              </View>
              <Text style={[styles.recentPrice, { color: colors.text }]}>{item.price}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Confiance */}
        <View style={[styles.trustRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: 'Paiement', sub: 'sécurisé Stripe' },
            { label: '4.9 / 5', sub: '1 200+ avis' },
            { label: '5 litres', sub: "d'eau par lavage" },
          ].map((t, i) => (
            <View
              key={i}
              style={[
                styles.trustItem,
                i > 0 && [styles.trustBorder, { borderLeftColor: colors.border }],
              ]}
            >
              <Text style={[styles.trustLabel, { color: colors.text }]}>{t.label}</Text>
              <Text style={[styles.trustSub, { color: colors.textSub }]}>{t.sub}</Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>

      <TabBar active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    backgroundColor: '#0D0D0D',
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  greeting: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  location: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 3 },
  notifBtn: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DC2626' },

  statsStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 11 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.08)' },
  statValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.38)', fontSize: 10, marginTop: 2 },

  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  activeCard: {
    backgroundColor: '#0D0D0D',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1.5,
  },
  activeLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  activeDot: { width: 7, height: 7, borderRadius: 4 },
  activeService: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  activeWasher: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  activeRight: { alignItems: 'flex-end', gap: 4 },
  activeStatusBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 },
  activeStatusText: { fontSize: 11, fontWeight: '600' },
  activeEta: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  activeArrow: { fontSize: 16 },

  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden',
    gap: 12,
  },
  weatherBar: { width: 3, height: 36, borderRadius: 2 },
  weatherTemp: { fontSize: 13, fontWeight: '600' },
  weatherSub: { fontSize: 12, marginTop: 3 },

  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingRight: 14,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  reminderBar: { width: 3, height: '100%', borderRadius: 2 },
  reminderTitle: { fontSize: 13, fontWeight: '600' },
  reminderSub: { fontSize: 12, marginTop: 2 },
  reminderBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 10 },
  reminderBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  section: { marginBottom: 18 },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionLink: { fontSize: 13, fontWeight: '500' },

  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  serviceCard: {
    width: '47.5%',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    position: 'relative',
  },
  serviceBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  serviceBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  serviceAbbr: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceAbbrText: { fontSize: 12, fontWeight: '800' },
  serviceName: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  serviceDesc: { fontSize: 11, lineHeight: 15, marginBottom: 8 },
  servicePrice: { fontSize: 13, fontWeight: '700' },

  mainCta: {
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  mainCtaTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  mainCtaSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 3 },
  mainCtaArrow: { color: '#FFFFFF', fontSize: 22 },

  subCard: {
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subTag: { marginBottom: 6 },
  subTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  subTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  subSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  subArrow: { color: '#FFFFFF', fontSize: 22 },

  referralCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
  },
  referralIconBox: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  referralIconText: { fontSize: 11, fontWeight: '800' },
  referralTitle: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
  referralSub: { fontSize: 12, lineHeight: 16 },
  referralArrow: { fontSize: 18 },

  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  recentAbbr: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  recentAbbrText: { fontSize: 12, fontWeight: '800' },
  recentName: { fontSize: 14, fontWeight: '600' },
  recentDetail: { fontSize: 12, marginTop: 2 },
  recentStars: { fontSize: 12, marginTop: 3 },
  recentPrice: { fontSize: 16, fontWeight: '700' },

  trustRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  trustItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  trustBorder: { borderLeftWidth: 1 },
  trustLabel: { fontSize: 13, fontWeight: '700' },
  trustSub: { fontSize: 10, marginTop: 2, textAlign: 'center' },

});
