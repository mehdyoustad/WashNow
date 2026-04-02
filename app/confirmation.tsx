import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { scheduleBookingReminder } from '../src/notifications';

const WATER_SAVED = 145;
const CO2_SAVED = 0.5;

export default function Confirmation() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    scheduleBookingReminder('Lavage complet', 'Dim. 2 mars, 10h00', 5);

    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const shareReferral = async () => {
    try {
      await Share.share({
        message: "J'utilise WashNow pour faire laver ma voiture à domicile. Rejoins-moi avec mon code MEHDY20 et profite de 10€ offerts sur ton premier lavage.",
        title: 'WashNow — Lavage à domicile',
      });
    } catch {
      // ignore
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Checkmark animé */}
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconInner}>
          <Text style={styles.iconText}>✓</Text>
        </View>
        <View style={styles.iconRing1} />
        <View style={styles.iconRing2} />
      </Animated.View>

      <Animated.View style={[
        styles.content,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}>
        <Text style={styles.title}>Réservation confirmée</Text>
        <Text style={styles.sub}>
          Votre laveur sera chez vous à l'heure choisie.{'\n'}
          Vous recevrez une notification de rappel.
        </Text>

        {/* Détails */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Récapitulatif</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Confirmé</Text>
            </View>
          </View>
          {[
            { label: 'Service', value: 'Lavage complet' },
            { label: 'Date', value: 'Dim. 2 mars, 10h00' },
            { label: 'Adresse', value: '12 rue de Paris, Drancy' },
            { label: 'Paiement', value: 'Carte •••• 4242' },
          ].map((row, i) => (
            <View key={i} style={[styles.detailRow, i > 0 && styles.detailRowBorder]}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue}>{row.value}</Text>
            </View>
          ))}
          <View style={[styles.detailRow, styles.detailRowBorder, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total payé</Text>
            <Text style={styles.totalValue}>39€</Text>
          </View>
        </View>

        {/* Éco-impact */}
        <View style={styles.ecoCard}>
          <View style={styles.ecoHeader}>
            <Text style={styles.ecoTitle}>Impact écologique</Text>
            <View style={styles.ecoBadge}>
              <Text style={styles.ecoBadgeText}>Eco-wash</Text>
            </View>
          </View>
          <Text style={styles.ecoSub}>Ce lavage WashNow vs station classique (150L)</Text>
          <View style={styles.ecoRow}>
            {[
              { value: `${WATER_SAVED}L`, label: 'eau économisée' },
              { value: `${CO2_SAVED} kg`, label: 'CO₂ évité' },
              { value: '5L', label: 'eau utilisée' },
            ].map((s, i) => (
              <View key={i} style={[styles.ecoStat, i > 0 && styles.ecoStatBorder]}>
                <Text style={styles.ecoStatNum}>{s.value}</Text>
                <Text style={styles.ecoStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Parrainage */}
        <TouchableOpacity style={styles.referralCard} onPress={shareReferral} activeOpacity={0.85}>
          <View style={{ flex: 1 }}>
            <Text style={styles.referralTitle}>Parrainez un ami, gagnez 10€</Text>
            <Text style={styles.referralSub}>
              Invitez un ami et vous recevez tous les deux 10€ de crédit.
            </Text>
          </View>
          <View style={styles.referralBtn}>
            <Text style={styles.referralBtnText}>Partager</Text>
          </View>
        </TouchableOpacity>

        {/* Prochain lavage */}
        <View style={styles.nextCard}>
          <Text style={styles.nextTitle}>Programmer le prochain lavage ?</Text>
          <Text style={styles.nextSub}>Les abonnés économisent 20€/mois en moyenne</Text>
          <TouchableOpacity onPress={() => router.push('/subscription' as any)}>
            <Text style={styles.nextLink}>Voir les abonnements →</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/tracking')}>
          <Text style={styles.btnPrimaryText}>Suivre la mission en direct</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/home')}>
          <Text style={styles.btnSecondaryText}>Retour à l'accueil</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 70, paddingBottom: 20 },

  iconWrap: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  iconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  iconText: { color: '#FFFFFF', fontSize: 34, fontWeight: '800' },
  iconRing1: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1.5,
    borderColor: '#16A34A30',
  },
  iconRing2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#16A34A18',
  },

  content: { width: '100%', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#0D0D0D', textAlign: 'center', marginBottom: 10, letterSpacing: -0.3 },
  sub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 21, marginBottom: 24 },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    width: '100%',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailsTitle: { fontSize: 15, fontWeight: '700', color: '#0D0D0D' },
  statusBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: { color: '#16A34A', fontSize: 11, fontWeight: '700' },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  detailRowBorder: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  detailLabel: { fontSize: 13, color: '#9CA3AF' },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#0D0D0D' },
  totalRow: { paddingTop: 12 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#0D0D0D' },
  totalValue: { fontSize: 17, fontWeight: '700', color: '#1558E7' },

  ecoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ecoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ecoTitle: { fontSize: 14, fontWeight: '700', color: '#0D0D0D' },
  ecoBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 },
  ecoBadgeText: { color: '#16A34A', fontSize: 11, fontWeight: '700' },
  ecoSub: { fontSize: 12, color: '#9CA3AF', marginBottom: 14 },
  ecoRow: { flexDirection: 'row' },
  ecoStat: { flex: 1, alignItems: 'center' },
  ecoStatBorder: { borderLeftWidth: 1, borderLeftColor: '#E5E7EB' },
  ecoStatNum: { fontSize: 18, fontWeight: '700', color: '#16A34A' },
  ecoStatLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 3, textAlign: 'center' },

  referralCard: {
    backgroundColor: '#0D0D0D',
    borderRadius: 14,
    padding: 18,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  referralTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 5 },
  referralSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 17 },
  referralBtn: {
    backgroundColor: '#1558E7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  referralBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  nextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  nextTitle: { fontSize: 15, fontWeight: '700', color: '#0D0D0D', marginBottom: 4 },
  nextSub: { fontSize: 13, color: '#9CA3AF', marginBottom: 14 },
  nextLink: { fontSize: 14, fontWeight: '700', color: '#1558E7' },

  btnPrimary: {
    backgroundColor: '#1558E7',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  btnSecondary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  btnSecondaryText: { color: '#0D0D0D', fontSize: 15, fontWeight: '600' },
});
