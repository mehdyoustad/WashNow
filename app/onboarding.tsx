import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const slides = [
  {
    id: 1,
    icon: '🚿',
    preTitle: '1 200+ lavages réalisés',
    title: 'Votre voiture\nlavée à domicile',
    subtitle: 'Un laveur certifié se déplace chez vous en moins de 2h. Zéro déplacement, zéro stress.',
    stats: [
      { value: '24€', label: 'dès' },
      { value: '60s', label: 'réservation' },
      { value: '4.9★', label: 'note moy.' },
    ],
    bg: '#0a0a0a',
    accent: '#1a6bff',
    accentLight: '#1a6bff20',
  },
  {
    id: 2,
    icon: '⚡',
    preTitle: 'Simple et rapide',
    title: 'Réservez en\n60 secondes chrono',
    subtitle: "Choisissez votre service, renseignez votre adresse et payez en ligne. Votre laveur arrive à l'heure.",
    steps: [
      { num: '1', label: 'Choisissez le service' },
      { num: '2', label: 'Choisissez le créneau' },
      { num: '3', label: 'Payez en sécurité' },
    ],
    bg: '#050d2e',
    accent: '#1a6bff',
    accentLight: '#1a6bff20',
  },
  {
    id: 3,
    icon: '🌱',
    preTitle: 'Éco-responsable',
    title: 'Propre et\nresponsable',
    subtitle: 'Notre technique utilise 5 litres vs 150L en station classique. Bon pour votre voiture, bon pour la planète.',
    eco: [
      { value: '145L', label: 'eau économisée' },
      { value: '97%', label: 'moins d\'eau' },
      { value: '0', label: 'produit toxique' },
    ],
    bg: '#021a0a',
    accent: '#00c853',
    accentLight: '#00c85320',
  },
] as const;

export default function Onboarding() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const slide = slides[current];

  const goNext = () => {
    if (current < slides.length - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -24, duration: 160, useNativeDriver: true }),
      ]).start(() => {
        setCurrent(c => c + 1);
        slideAnim.setValue(24);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
      });
    } else {
      router.push('/login');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: slide.bg }]}>
      {/* Cercles décoratifs */}
      <View style={[styles.circleTopRight, { backgroundColor: slide.accentLight }]} />
      <View style={[styles.circleBottomLeft, { backgroundColor: slide.accentLight }]} />

      {/* Barre progression + skip */}
      <View style={styles.topBar}>
        <View style={styles.progressBar}>
          {slides.map((_, i) => (
            <View key={i} style={[
              styles.progressSegment,
              {
                backgroundColor: i <= current
                  ? (i === current ? slide.accent : slide.accent + '55')
                  : 'rgba(255,255,255,0.15)',
              },
            ]} />
          ))}
        </View>
        <TouchableOpacity onPress={() => router.push('/login')} style={styles.skipBtn}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu animé */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Badge pre-title */}
        <View style={[styles.badge, { backgroundColor: slide.accentLight, borderColor: slide.accent + '40' }]}>
          <Text style={[styles.badgeText, { color: slide.accent }]}>{slide.preTitle}</Text>
        </View>

        {/* Icône */}
        <View style={[styles.iconWrap, { backgroundColor: slide.accentLight, borderColor: slide.accent + '30' }]}>
          <Text style={styles.icon}>{slide.icon}</Text>
        </View>

        {/* Textes */}
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>

        {/* Stats (slide 1) */}
        {'stats' in slide && (
          <View style={styles.statsRow}>
            {slide.stats.map((s, i) => (
              <View key={i} style={[styles.statItem, i > 0 && styles.statBorder]}>
                <Text style={[styles.statValue, { color: slide.accent }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Steps (slide 2) */}
        {'steps' in slide && (
          <View style={styles.stepsCol}>
            {slide.steps.map((s, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={[styles.stepNum, { backgroundColor: slide.accent }]}>
                  <Text style={styles.stepNumText}>{s.num}</Text>
                </View>
                <Text style={styles.stepLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Eco (slide 3) */}
        {'eco' in slide && (
          <View style={[styles.ecoCard, { backgroundColor: slide.accentLight, borderColor: slide.accent + '30' }]}>
            {slide.eco.map((e, i) => (
              <View key={i} style={[styles.ecoItem, i > 0 && { borderLeftWidth: 1, borderLeftColor: slide.accent + '30' }]}>
                <Text style={[styles.ecoValue, { color: slide.accent }]}>{e.value}</Text>
                <Text style={styles.ecoLabel}>{e.label}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[
              styles.dot,
              i === current ? [styles.dotActive, { backgroundColor: slide.accent }] : { backgroundColor: 'rgba(255,255,255,0.2)' },
            ]} />
          ))}
        </View>

        <TouchableOpacity style={[styles.btn, { backgroundColor: slide.accent }]} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.btnText}>
            {current === slides.length - 1 ? 'Commencer gratuitement' : 'Suivant'}
          </Text>
          <Text style={styles.btnArrow}>→</Text>
        </TouchableOpacity>

        {current === slides.length - 1 && (
          <TouchableOpacity onPress={() => router.push('/login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Déjà un compte ? <Text style={{ color: 'white', fontWeight: '700' }}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  circleTopRight: { position: 'absolute', width: 320, height: 320, borderRadius: 160, top: -100, right: -80 },
  circleBottomLeft: { position: 'absolute', width: 200, height: 200, borderRadius: 100, bottom: 120, left: -80 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 58, paddingHorizontal: 24, gap: 14 },
  progressBar: { flex: 1, flexDirection: 'row', gap: 6 },
  progressSegment: { flex: 1, height: 3, borderRadius: 2 },
  skipBtn: { padding: 4 },
  skipText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 32, paddingTop: 32, justifyContent: 'center' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, marginBottom: 28 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  iconWrap: { width: 96, height: 96, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 28, borderWidth: 1.5 },
  icon: { fontSize: 46 },
  title: { fontSize: 36, fontWeight: '800', color: 'white', lineHeight: 44, marginBottom: 14, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 24, marginBottom: 30 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3, fontWeight: '600' },
  stepsCol: { gap: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepNum: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  stepNumText: { color: 'white', fontWeight: '800', fontSize: 15 },
  stepLabel: { fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: '600', flex: 1 },
  ecoCard: { flexDirection: 'row', borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  ecoItem: { flex: 1, alignItems: 'center', paddingVertical: 18 },
  ecoValue: { fontSize: 22, fontWeight: '800' },
  ecoLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: '600', textAlign: 'center' },
  footer: { padding: 24, paddingBottom: 44 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 28, borderRadius: 4 },
  btn: { flexDirection: 'row', borderRadius: 50, paddingVertical: 18, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnText: { color: 'white', fontSize: 17, fontWeight: '700' },
  btnArrow: { color: 'white', fontSize: 18, fontWeight: '700' },
  loginLink: { marginTop: 14, alignItems: 'center' },
  loginLinkText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
});
