import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: '🚗',
    title: 'Votre voiture lavée\nà domicile',
    subtitle: 'Un laveur professionnel se déplace chez vous, où que vous soyez.',
    bg: '#0a0a0a',
    accent: '#1a6bff',
  },
  {
    icon: '⚡',
    title: 'Réservez en\n60 secondes',
    subtitle: 'Choisissez votre service, votre créneau et payez en ligne. Simple et rapide.',
    bg: '#0f1f4d',
    accent: '#1a6bff',
  },
  {
    icon: '✨',
    title: 'Un résultat\nprofessionnel',
    subtitle: 'Nos laveurs sont certifiés et notés par la communauté WashNow.',
    bg: '#003d1a',
    accent: '#00c853',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const next = () => {
    if (current < slides.length - 1) {
      const nextIndex = current + 1;
      scrollRef.current?.scrollTo({ x: width * nextIndex, animated: true });
      setCurrent(nextIndex);
    } else {
      router.push('/login');
    }
  };

  const skip = () => router.push('/login');

  const slide = slides[current];

  return (
    <View style={[styles.container, { backgroundColor: slide.bg }]}>
      {/* Skip */}
      <TouchableOpacity style={styles.skipBtn} onPress={skip}>
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scroll}
      >
        {slides.map((s, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            {/* Cercle décoratif */}
            <View style={[styles.circle, { backgroundColor: s.accent + '20' }]} />
            <View style={[styles.circleSmall, { backgroundColor: s.accent + '15' }]} />

            {/* Icône */}
            <View style={[styles.iconContainer, { backgroundColor: s.accent + '25', borderColor: s.accent + '40' }]}>
              <Text style={styles.icon}>{s.icon}</Text>
            </View>

            {/* Texte */}
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.subtitle}>{s.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === current && [styles.dotActive, { backgroundColor: slide.accent }]]} />
        ))}
      </View>

      {/* Bouton */}
      <TouchableOpacity style={[styles.btn, { backgroundColor: slide.accent }]} onPress={next}>
        <Text style={styles.btnText}>
          {current === slides.length - 1 ? 'Commencer 🚀' : 'Suivant →'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { position: 'absolute', top: 56, right: 24, zIndex: 10, padding: 8 },
  skipText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
  scroll: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, position: 'relative' },
  circle: { position: 'absolute', width: 340, height: 340, borderRadius: 170, top: -60, right: -80 },
  circleSmall: { position: 'absolute', width: 200, height: 200, borderRadius: 100, bottom: 60, left: -60 },
  iconContainer: { width: 120, height: 120, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 40, borderWidth: 2 },
  icon: { fontSize: 56 },
  title: { fontSize: 34, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 42, marginBottom: 20, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { width: 24 },
  btn: { marginHorizontal: 24, borderRadius: 50, padding: 18, alignItems: 'center' },
  btnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});