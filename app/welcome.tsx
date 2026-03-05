import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FEATURES = [
  { icon: '🚗', title: 'Lavage à domicile', desc: 'Un laveur vient chez vous ou au bureau' },
  { icon: '⚡', title: 'Réservation en 2 min', desc: 'Choisissez le service, la date, payez en ligne' },
  { icon: '📍', title: 'Suivi en temps réel', desc: 'Suivez votre laveur sur la carte' },
  { icon: '🌱', title: '145× moins d\'eau', desc: 'Lavage sans eau courante, éco-responsable' },
];

export default function Welcome() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.logoWrap}>
          <View style={styles.logo}><Text style={styles.logoEmoji}>🚿</Text></View>
          <View style={styles.confetti}>
            {['🎉', '✨', '🌟'].map((e, i) => (
              <Text key={i} style={[styles.confettiItem, { top: i * 20 - 10, right: i * 24 - 10 }]}>{e}</Text>
            ))}
          </View>
        </View>

        <Text style={styles.title}>Bienvenue sur WashNow ! 👋</Text>
        <Text style={styles.subtitle}>Votre voiture mérite le meilleur. Découvrez tout ce que vous pouvez faire :</Text>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <Animated.View
              key={i}
              style={[styles.featureRow, {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              }]}
            >
              <View style={styles.featureIcon}><Text style={{ fontSize: 22 }}>{f.icon}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/vehicles' as any)}>
          <Text style={styles.primaryBtnText}>🚗 Ajouter mon premier véhicule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/booking' as any)}>
          <Text style={styles.secondaryBtnText}>⚡ Faire ma première réservation</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/home' as any)}>
          <Text style={styles.skipText}>Passer pour l'instant →</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', padding: 28 },
  content: { gap: 0 },
  logoWrap: { alignItems: 'center', marginBottom: 28, position: 'relative' },
  logo: { width: 80, height: 80, backgroundColor: '#1a6bff', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  logoEmoji: { fontSize: 38 },
  confetti: { position: 'absolute', top: -8, right: '30%' },
  confettiItem: { position: 'absolute', fontSize: 20 },
  title: { fontSize: 26, fontWeight: '800', color: 'white', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  features: { gap: 12, marginBottom: 32 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14 },
  featureIcon: { width: 44, height: 44, backgroundColor: 'rgba(26,107,255,0.15)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  featureTitle: { color: 'white', fontWeight: '700', fontSize: 14, marginBottom: 2 },
  featureDesc: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
  primaryBtn: { backgroundColor: '#1a6bff', borderRadius: 50, padding: 18, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { borderWidth: 2, borderColor: '#1a6bff', borderRadius: 50, padding: 16, alignItems: 'center', marginBottom: 20 },
  secondaryBtnText: { color: '#1a6bff', fontSize: 15, fontWeight: '700' },
  skipText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' },
});
