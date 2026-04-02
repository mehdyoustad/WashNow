import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../src/supabase';
import { useTheme } from '../src/theme';

// En production: recevoir via route params
const SERVICE = {
  bookingId: 'b1',
  service: 'Lavage complet',
  washer: 'Karim B.',
  washerInitial: 'K',
  vehicle: 'Peugeot 308',
  price: '39€',
  date: 'Aujourd\'hui à 10h00',
};

const LABELS = ['', 'Décevant', 'Passable', 'Bien', 'Très bien', 'Excellent !'];

export default function PostService() {
  const router = useRouter();
  const { colors } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  const submitRating = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('ratings').upsert({
        booking_id: SERVICE.bookingId,
        user_id: user?.id,
        stars: rating,
        comment: comment.trim() || null,
        created_at: new Date().toISOString(),
      });
    } catch {
      // silencieux — on continue même si l'API échoue
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      Animated.spring(successAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Je viens de faire laver ma voiture avec WashNow ! Service impeccable, je recommande. Essaie avec mon code MEHDY20 pour -20% sur ta première réservation 🚗✨`,
        title: 'WashNow — Mon avis',
      });
    } catch {}
  };

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Animated.View style={[styles.successContainer, { opacity: successAnim, transform: [{ scale: successAnim }] }]}>
          <View style={[styles.successCircle, { backgroundColor: colors.success }]}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Merci pour votre avis !</Text>
          <Text style={[styles.successSub, { color: colors.textSub }]}>
            Votre note aide les autres clients à choisir un bon laveur.
          </Text>

          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}
            onPress={handleShare}
          >
            <Text style={[styles.shareBtnLabel, { color: colors.primary }]}>SH</Text>
            <Text style={[styles.shareBtnText, { color: colors.primary }]}>Partager mon expérience</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rebookBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/booking' as any)}
          >
            <Text style={styles.rebookBtnText}>Réserver à nouveau</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/home' as any)}>
            <Text style={[styles.skipText, { color: colors.textSub }]}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>

        {/* Header service */}
        <View style={[styles.serviceCard, { backgroundColor: colors.card }]}>
          <View style={[styles.washerAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.washerAvatarText}>{SERVICE.washerInitial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.serviceTitle, { color: colors.text }]}>{SERVICE.service}</Text>
            <Text style={[styles.serviceMeta, { color: colors.textSub }]}>{SERVICE.washer} · {SERVICE.vehicle}</Text>
            <Text style={[styles.serviceDate, { color: colors.textMuted }]}>{SERVICE.date}</Text>
          </View>
          <Text style={[styles.servicePrice, { color: colors.text }]}>{SERVICE.price}</Text>
        </View>

        {/* Question */}
        <Text style={[styles.question, { color: colors.text }]}>
          Comment s'est passé votre lavage ?
        </Text>

        {/* Étoiles */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(s => (
            <TouchableOpacity key={s} onPress={() => setRating(s)} style={styles.starBtn}>
              <Text style={[styles.star, { color: s <= rating ? '#F59E0B' : colors.border }]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>

        {rating > 0 && (
          <Animated.Text style={[styles.ratingLabel, { color: colors.primary }]}>
            {LABELS[rating]}
          </Animated.Text>
        )}

        {/* Commentaire */}
        {rating > 0 && (
          <TextInput
            style={[styles.commentInput, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
            value={comment}
            onChangeText={setComment}
            placeholder={rating >= 4 ? 'Qu\'est-ce qui vous a le plus plu ?' : 'Qu\'aurait-on pu améliorer ?'}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: rating > 0 ? colors.primary : colors.border }]}
          onPress={submitRating}
          disabled={rating === 0 || submitting}
        >
          <Text style={[styles.submitBtnText, { color: rating > 0 ? 'white' : colors.textMuted }]}>
            {submitting ? 'Envoi...' : rating === 0 ? 'Sélectionnez une note' : 'Envoyer mon avis'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/home' as any)}>
          <Text style={[styles.skipText, { color: colors.textMuted }]}>Passer</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  inner: { padding: 24 },
  serviceCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 16, marginBottom: 32, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  washerAvatar: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  washerAvatarText: { color: 'white', fontWeight: '700', fontSize: 20 },
  serviceTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  serviceMeta: { fontSize: 13, marginBottom: 2 },
  serviceDate: { fontSize: 12 },
  servicePrice: { fontSize: 18, fontWeight: '700' },
  question: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 24, lineHeight: 30 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 },
  starBtn: { padding: 4 },
  star: { fontSize: 48 },
  ratingLabel: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  commentInput: { borderRadius: 14, borderWidth: 1.5, padding: 14, fontSize: 14, minHeight: 90, marginBottom: 20, lineHeight: 20 },
  submitBtn: { borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 16 },
  submitBtnText: { fontSize: 16, fontWeight: '700' },
  skipText: { textAlign: 'center', fontSize: 14, paddingVertical: 8 },
  // Success state
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  successCircle: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  successIcon: { color: 'white', fontSize: 42, fontWeight: '700' },
  successTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  successSub: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 20, paddingVertical: 14, width: '100%', justifyContent: 'center' },
  shareBtnLabel: { fontSize: 11, fontWeight: '800' },
  shareBtnText: { fontSize: 14, fontWeight: '600' },
  rebookBtn: { borderRadius: 14, padding: 18, alignItems: 'center', width: '100%' },
  rebookBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
