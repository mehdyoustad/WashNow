import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnimatedButton, AnimatedCard } from '../src/components';
import { useTheme } from '../src/theme';

// Clé gratuite OpenWeatherMap — inscris-toi sur openweathermap.org pour en obtenir une
const OWM_API_KEY = 'REMPLACE_PAR_TA_CLE_OWM';

type Weather = {
  temp: number;
  description: string;
  icon: string;
  isRainy: boolean;
};

const WEATHER_ICONS: Record<string, string> = {
  '01': '☀️', '02': '⛅', '03': '☁️', '04': '☁️',
  '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️',
};

const RAINY_CODES = new Set(['09', '10', '11']);

export default function Home() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [weather, setWeather] = useState<Weather | null>(null);

  // Mock : dernière voiture + date dernier lavage
  const lastWashDays = 32;
  const carName = 'Peugeot 308';
  const showReminder = lastWashDays >= 30;

  const headerHeight = scrollY.interpolate({ inputRange: [0, 80], outputRange: [160, 100], extrapolate: 'clamp' });
  const headerPadding = scrollY.interpolate({ inputRange: [0, 80], outputRange: [24, 14], extrapolate: 'clamp' });
  const titleSize = scrollY.interpolate({ inputRange: [0, 80], outputRange: [24, 18], extrapolate: 'clamp' });
  const locationOpacity = scrollY.interpolate({ inputRange: [0, 60], outputRange: [1, 0], extrapolate: 'clamp' });

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    if (!OWM_API_KEY || OWM_API_KEY === 'REMPLACE_PAR_TA_CLE_OWM') return;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const { latitude, longitude } = loc.coords;
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}&units=metric&lang=fr`
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
      // Pas de météo si erreur réseau
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header animé */}
      <Animated.View style={[styles.header, { height: headerHeight, paddingHorizontal: 24, paddingTop: 50, paddingBottom: headerPadding }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Bonjour Mehdy 👋</Text>
            <Animated.Text style={[styles.question, { fontSize: titleSize }]}>Que faisons-nous ?</Animated.Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications' as any)}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>
        <Animated.View style={{ opacity: locationOpacity }}>
          <TouchableOpacity style={styles.locationPill}>
            <Text style={styles.locationText}>📍 Drancy, Île-de-France  ▾</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Widget météo */}
        {weather && (
          <AnimatedCard index={0}>
            <View style={[styles.weatherCard, { backgroundColor: weather.isRainy ? '#fff3e0' : (isDark ? '#1a2a1a' : '#e8faf0') }]}>
              <Text style={styles.weatherIcon}>{weather.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.weatherTemp, { color: colors.text }]}>{weather.temp}°C — {weather.description}</Text>
                {weather.isRainy ? (
                  <>
                    <Text style={styles.weatherWarning}>⚠️ Lavage déconseillé aujourd'hui</Text>
                    <Text style={styles.weatherSuggest}>💡 Service intérieur recommandé</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.weatherGood}>✅ Conditions idéales pour un lavage !</Text>
                    <Text style={styles.weatherSuggest}>💡 Lavage complet recommandé</Text>
                  </>
                )}
              </View>
            </View>
          </AnimatedCard>
        )}

        {/* Rappel voiture non lavée */}
        {showReminder && (
          <AnimatedCard index={weather ? 1 : 0}>
            <TouchableOpacity style={styles.reminderCard} onPress={() => router.push('/booking')}>
              <Text style={styles.reminderIcon}>🚗</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.reminderTitle}>Il est temps de laver votre voiture !</Text>
                <Text style={styles.reminderSub}>Votre {carName} n'a pas été lavée depuis {lastWashDays} jours</Text>
              </View>
              <View style={styles.reminderBtn}>
                <Text style={styles.reminderBtnText}>Réserver</Text>
              </View>
            </TouchableOpacity>
          </AnimatedCard>
        )}

        <AnimatedCard index={weather ? (showReminder ? 2 : 1) : (showReminder ? 1 : 0)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Réserver un lavage</Text>
        </AnimatedCard>

        <AnimatedCard index={weather ? 2 : 1}>
          <AnimatedButton style={styles.featuredCard} onPress={() => router.push('/booking')}>
            <View>
              <Text style={styles.featuredTitle}>Nouvelle réservation</Text>
              <Text style={styles.featuredSub}>En moins de 60 secondes</Text>
            </View>
            <Text style={{ fontSize: 44 }}>🚗</Text>
          </AnimatedButton>
        </AnimatedCard>

        <AnimatedCard index={weather ? 3 : 2} style={styles.row}>
          <AnimatedButton style={[styles.smallCard, { backgroundColor: colors.card }]} onPress={() => router.push('/subscription')}>
            <View style={styles.badge}><Text style={styles.badgeText}>-20%</Text></View>
            <Text style={styles.cardIcon}>📦</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Abonnement</Text>
            <Text style={[styles.cardSub, { color: colors.textSub }]}>Dès 49€/mois</Text>
          </AnimatedButton>
          <AnimatedButton style={[styles.smallCard, { backgroundColor: colors.card }]} onPress={() => router.push('/tracking')}>
            <Text style={styles.cardIcon}>📍</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Suivi en direct</Text>
            <Text style={[styles.cardSub, { color: colors.textSub }]}>1 mission active</Text>
          </AnimatedButton>
        </AnimatedCard>

        <AnimatedCard index={weather ? 4 : 3}>
          <View style={styles.promoCard}>
            <View style={styles.promoTag}><Text style={styles.promoTagText}>🎁 OFFRE BIENVENUE</Text></View>
            <Text style={styles.promoTitle}>10€ offerts</Text>
            <Text style={styles.promoSub}>Sur votre premier lavage</Text>
            <TouchableOpacity style={styles.promoCode}>
              <Text style={styles.promoCodeText}>BIENVENUE10</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        <AnimatedCard index={weather ? 5 : 4}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Derniers lavages</Text>
        </AnimatedCard>

        {[
          { icon: '✨', name: 'Lavage complet', car: 'Peugeot 308 • 14 fév.', price: '49€' },
          { icon: '🚿', name: 'Lavage extérieur', car: 'Peugeot 308 • 2 fév.', price: '24€' },
        ].map((item, i) => (
          <AnimatedCard key={i} index={(weather ? 6 : 5) + i}>
            <View style={[styles.recentCard, { backgroundColor: colors.card }]}>
              <View style={[styles.recentIcon, { backgroundColor: colors.cardAlt }]}>
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.recentName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.recentDate, { color: colors.textSub }]}>{item.car}</Text>
                <Text style={styles.stars}>★★★★★</Text>
              </View>
              <Text style={[styles.recentPrice, { color: colors.text }]}>{item.price}</Text>
            </View>
          </AnimatedCard>
        ))}

        <View style={{ height: 30 }} />
      </Animated.ScrollView>

      {/* Bottom Nav */}
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
  header: { backgroundColor: '#0a0a0a', justifyContent: 'flex-end' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { flex: 1 },
  bellBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  bellDot: { position: 'absolute', top: 7, right: 7, width: 8, height: 8, backgroundColor: '#ff4444', borderRadius: 4, borderWidth: 1.5, borderColor: '#0a0a0a' },
  greeting: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 2 },
  question: { color: 'white', fontWeight: '700' },
  locationPill: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, alignSelf: 'flex-start', marginTop: 10 },
  locationText: { color: 'white', fontSize: 13 },
  scroll: { flex: 1, padding: 20 },
  weatherCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, marginBottom: 12 },
  weatherIcon: { fontSize: 32 },
  weatherTemp: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  weatherWarning: { fontSize: 13, color: '#cc8800', fontWeight: '600', marginTop: 3 },
  weatherGood: { fontSize: 13, color: '#00c853', fontWeight: '600', marginTop: 3 },
  weatherSuggest: { fontSize: 12, color: '#555', marginTop: 2 },
  reminderCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff8e6', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#FFB800' },
  reminderIcon: { fontSize: 28 },
  reminderTitle: { fontSize: 14, fontWeight: '700', color: '#0a0a0a' },
  reminderSub: { fontSize: 12, color: '#cc8800', marginTop: 3 },
  reminderBtn: { backgroundColor: '#1a6bff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50 },
  reminderBtnText: { color: 'white', fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14, marginTop: 4 },
  featuredCard: { backgroundColor: '#1a6bff', borderRadius: 16, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  featuredTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  featuredSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  smallCard: { flex: 1, borderRadius: 16, padding: 18 },
  badge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#00c853', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '700' },
  cardIcon: { fontSize: 28, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardSub: { fontSize: 12, marginTop: 2 },
  promoCard: { backgroundColor: '#1a6bff', borderRadius: 16, padding: 20, marginBottom: 24 },
  promoTag: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  promoTagText: { color: 'white', fontSize: 11, fontWeight: '700' },
  promoTitle: { color: 'white', fontSize: 22, fontWeight: '700' },
  promoSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  promoCode: { backgroundColor: 'white', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 14 },
  promoCodeText: { color: '#1a6bff', fontWeight: '700', fontSize: 14 },
  recentCard: { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  recentIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  recentName: { fontSize: 15, fontWeight: '600' },
  recentDate: { fontSize: 12, marginTop: 2 },
  stars: { color: '#FFB800', fontSize: 12, marginTop: 3 },
  recentPrice: { fontSize: 16, fontWeight: '700' },
  bottomNav: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 24, paddingTop: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, fontWeight: '600' },
  navDot: { width: 4, height: 4, backgroundColor: '#1a6bff', borderRadius: 2 },
});
