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
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    scheduleBookingReminder('Lavage complet', 'Dim. 2 mars, 10h00', 5);

    // Animation d'entrée
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
        message: "J'utilise WashNow pour faire laver ma voiture à domicile. Rejoins-moi avec mon code MEHDY20 et profite de 10€ offerts sur ton premier lavage ! 🚿",
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
      {/* Animation checkmark */}
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconInner}>
          <Text style={styles.iconText}>✓</Text>
        </View>
        <View style={styles.iconRing1} />
        <View style={styles.iconRing2} />
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%', alignItems: 'center' }}>
        <Text style={styles.title}>Réservation confirmée !</Text>
        <Text style={styles.sub}>
          Votre laveur sera chez vous à l'heure choisie.{'\n'}Vous recevrez une notification de rappel.
        </Text>

        {/* Détails réservation */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsHeaderText}>Récapitulatif</Text>
            <View style={styles.detailsStatusBadge}>
              <Text style={styles.detailsStatusText}>Confirmé</Text>
            </View>
          </View>
          {[
            { icon: '🚿', label: 'Service', value: 'Lavage complet' },
            { icon: '📅', label: 'Date', value: 'Dim. 2 mars, 10h00' },
            { icon: '📍', label: 'Adresse', value: '12 rue de Paris, Drancy' },
            { icon: '💳', label: 'Paiement', value: 'Carte •••• 4242' },
          ].map((row, i) => (
            <View key={i} style={[styles.detailRow, i > 0 && styles.detailRowBorder]}>
              <View style={styles.detailIcon}><Text style={{ fontSize: 16 }}>{row.icon}</Text></View>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue}>{row.value}</Text>
            </View>
          ))}
          <View style={[styles.detailRow, styles.detailRowBorder, styles.totalRow]}>
            <View style={styles.detailIcon}><Text style={{ fontSize: 16 }}>💰</Text></View>
            <Text style={styles.totalLabel}>Total payé</Text>
            <Text style={styles.totalValue}>39€</Text>
          </View>
        </View>

        {/* Éco-impact */}
        <View style={styles.ecoCard}>
          <View style={styles.ecoHeader}>
            <Text style={styles.ecoTitle}>🌱 Votre impact écologique</Text>
            <View style={styles.ecoBadge}><Text style={styles.ecoBadgeText}>Éco-wash</Text></View>
          </View>
          <Text style={styles.ecoSub}>Ce lavage WashNow vs un lavage en station (150L)</Text>
          <View style={styles.ecoRow}>
            {[
              { value: `${WATER_SAVED}L`, label: '💧 eau économisée', color: '#1a6bff' },
              { value: `${CO2_SAVED}kg`, label: '♻️ CO₂ évité', color: '#00c853' },
              { value: '5L', label: '🚿 seulement', color: '#00c853' },
            ].map((s, i) => (
              <View key={i} style={[styles.ecoStat, i > 0 && styles.ecoStatBorder]}>
                <Text style={[styles.ecoStatNum, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.ecoStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upsell parrainage */}
        <TouchableOpacity style={styles.referralCard} onPress={shareReferral} activeOpacity={0.85}>
          <View style={styles.referralLeft}>
            <Text style={styles.referralTitle}>Partagez et gagnez 10€ 🎁</Text>
            <Text style={styles.referralSub}>Invitez un ami, vous recevez tous les deux 10€ de crédit sur le prochain lavage.</Text>
          </View>
          <View style={styles.referralCta}>
            <Text style={styles.referralCtaText}>Partager</Text>
          </View>
        </TouchableOpacity>

        {/* Prochaine action */}
        <View style={styles.nextWashCard}>
          <Text style={styles.nextWashTitle}>Programmer le prochain lavage ?</Text>
          <Text style={styles.nextWashSub}>Les abonnés économisent 20€/mois en moyenne</Text>
          <TouchableOpacity style={styles.nextWashBtn} onPress={() => router.push('/subscription' as any)}>
            <Text style={styles.nextWashBtnText}>Voir les abonnements →</Text>
          </TouchableOpacity>
        </View>

        {/* CTAs principaux */}
        <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/tracking')}>
          <Text style={styles.btnPrimaryText}>📍 Suivre la mission en direct</Text>
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
  scroll: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 70, paddingBottom: 20 },
  iconWrap: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00c853',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  iconText: { color: 'white', fontSize: 38, fontWeight: '800' },
  iconRing1: {
    position: 'absolute',
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 2,
    borderColor: '#00c85340',
  },
  iconRing2: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    borderColor: '#00c85320',
  },
  title: { fontSize: 26, fontWeight: '800', color: '#0a0a0a', textAlign: 'center', marginBottom: 10, letterSpacing: -0.3 },
  sub: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  detailsHeaderText: { fontSize: 15, fontWeight: '700', color: '#0a0a0a' },
  detailsStatusBadge: { backgroundColor: '#e8faf0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  detailsStatusText: { color: '#00c853', fontSize: 12, fontWeight: '700' },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  detailRowBorder: { borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  detailIcon: { width: 30, height: 30, backgroundColor: '#f5f5f5', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  detailLabel: { flex: 1, fontSize: 13, color: '#999' },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#0a0a0a' },
  totalRow: { backgroundColor: '#f8f9fa', borderRadius: 10, marginTop: 4, paddingHorizontal: 8 },
  totalLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: '#0a0a0a' },
  totalValue: { fontSize: 17, fontWeight: '800', color: '#1a6bff' },
  ecoCard: {
    backgroundColor: '#e8faf0',
    borderRadius: 18,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  ecoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  ecoTitle: { fontSize: 14, fontWeight: '700', color: '#0a0a0a' },
  ecoBadge: { backgroundColor: '#00c853', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  ecoBadgeText: { color: 'white', fontSize: 11, fontWeight: '700' },
  ecoSub: { fontSize: 11, color: '#555', marginBottom: 14 },
  ecoRow: { flexDirection: 'row' },
  ecoStat: { flex: 1, alignItems: 'center' },
  ecoStatBorder: { borderLeftWidth: 1, borderLeftColor: '#c8e6c9' },
  ecoStatNum: { fontSize: 20, fontWeight: '800' },
  ecoStatLabel: { fontSize: 10, color: '#555', marginTop: 3, textAlign: 'center' },
  referralCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 18,
    padding: 18,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  referralLeft: { flex: 1 },
  referralTitle: { fontSize: 14, fontWeight: '700', color: 'white', marginBottom: 5 },
  referralSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 17 },
  referralCta: { backgroundColor: '#1a6bff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 50 },
  referralCtaText: { color: 'white', fontSize: 13, fontWeight: '700' },
  nextWashCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
  },
  nextWashTitle: { fontSize: 15, fontWeight: '700', color: '#0a0a0a', marginBottom: 4 },
  nextWashSub: { fontSize: 13, color: '#999', marginBottom: 14 },
  nextWashBtn: { alignSelf: 'flex-start' },
  nextWashBtnText: { fontSize: 14, fontWeight: '700', color: '#1a6bff' },
  btnPrimary: {
    backgroundColor: '#1a6bff',
    borderRadius: 50,
    paddingVertical: 17,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    shadowColor: '#1a6bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  btnPrimaryText: { color: 'white', fontSize: 16, fontWeight: '700' },
  btnSecondary: {
    backgroundColor: 'white',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
  },
  btnSecondaryText: { color: '#0a0a0a', fontSize: 15, fontWeight: '600' },
});
