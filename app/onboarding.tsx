import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PRIMARY = '#1558E7';

const slides = [
  {
    id: 1,
    abbr: 'W',
    preTitle: '1 200+ lavages réalisés',
    title: 'Votre voiture\nlavée à domicile',
    subtitle: 'Un laveur certifié se déplace chez vous en moins de 2h. Zéro déplacement, zéro stress.',
    stats: [
      { value: '24€', label: 'dès' },
      { value: '60s', label: 'réservation' },
      { value: '4.9 / 5', label: 'note moy.' },
    ],
  },
  {
    id: 2,
    abbr: '60',
    preTitle: 'Simple et rapide',
    title: 'Réservez en\n60 secondes',
    subtitle: "Choisissez votre service, renseignez votre adresse et payez en ligne. Votre laveur arrive à l'heure.",
    steps: [
      { num: '1', label: 'Choisissez le service' },
      { num: '2', label: 'Choisissez le créneau' },
      { num: '3', label: 'Payez en sécurité' },
    ],
  },
  {
    id: 3,
    abbr: 'E',
    preTitle: 'Éco-responsable',
    title: 'Propre et\nresponsable',
    subtitle: 'Notre technique utilise 5 litres vs 150L en station classique. Bon pour votre voiture, bon pour la planète.',
    eco: [
      { value: '145L', label: "eau économisée" },
      { value: '97%', label: "moins d'eau" },
      { value: '0', label: 'produit toxique' },
    ],
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
        Animated.timing(slideAnim, { toValue: -20, duration: 160, useNativeDriver: true }),
      ]).start(() => {
        setCurrent(c => c + 1);
        slideAnim.setValue(20);
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
    <View style={styles.container}>

      {/* Barre progression + skip */}
      <View style={styles.topBar}>
        <View style={styles.progressBar}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                { backgroundColor: i <= current ? PRIMARY : 'rgba(255,255,255,0.2)' },
              ]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={() => router.push('/login')} style={styles.skipBtn}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu animé */}
      <Animated.View style={[
        styles.content,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}>
        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{slide.preTitle}</Text>
        </View>

        {/* Icône */}
        <View style={styles.iconWrap}>
          <Text style={styles.iconAbbr}>{slide.abbr}</Text>
        </View>

        {/* Textes */}
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>

        {/* Stats (slide 1) */}
        {'stats' in slide && (
          <View style={styles.statsRow}>
            {slide.stats.map((s, i) => (
              <View key={i} style={[styles.statItem, i > 0 && styles.statBorder]}>
                <Text style={styles.statValue}>{s.value}</Text>
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
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{s.num}</Text>
                </View>
                <Text style={styles.stepLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Eco (slide 3) */}
        {'eco' in slide && (
          <View style={styles.ecoCard}>
            {slide.eco.map((e, i) => (
              <View key={i} style={[styles.ecoItem, i > 0 && styles.ecoItemBorder]}>
                <Text style={styles.ecoValue}>{e.value}</Text>
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
            <View
              key={i}
              style={[
                styles.dot,
                i === current ? styles.dotActive : { backgroundColor: 'rgba(255,255,255,0.2)' },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.btnText}>
            {current === slides.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
          <Text style={styles.btnArrow}>→</Text>
        </TouchableOpacity>

        {current === slides.length - 1 && (
          <TouchableOpacity onPress={() => router.push('/login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Déjà un compte ?{' '}
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 58,
    paddingHorizontal: 24,
    gap: 14,
  },
  progressBar: { flex: 1, flexDirection: 'row', gap: 6 },
  progressSegment: { flex: 1, height: 2, borderRadius: 1 },
  skipBtn: { padding: 4 },
  skipText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    justifyContent: 'center',
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(21,88,231,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(21,88,231,0.3)',
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#6EA4FF' },

  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#1558E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconAbbr: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },

  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 44,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 24,
    marginBottom: 28,
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.08)' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1558E7' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 3, fontWeight: '600' },

  stepsCol: { gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1558E7',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  stepLabel: { fontSize: 15, color: 'rgba(255,255,255,0.8)', fontWeight: '500', flex: 1 },

  ecoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  ecoItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  ecoItemBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.08)' },
  ecoValue: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  ecoLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },

  footer: { padding: 24, paddingBottom: 44 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 18 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 28, height: 8, borderRadius: 4, backgroundColor: '#1558E7' },

  btn: {
    flexDirection: 'row',
    backgroundColor: '#1558E7',
    borderRadius: 10,
    paddingVertical: 17,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnArrow: { color: '#FFFFFF', fontSize: 18 },

  loginLink: { marginTop: 14, alignItems: 'center' },
  loginLinkText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' },
});
