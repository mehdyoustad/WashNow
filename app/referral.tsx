import { useRouter } from 'expo-router';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const REFERRAL_CODE = 'MEHDY20';
const REFERRAL_LINK = `https://washnow.app/invite/${REFERRAL_CODE}`;

const HOW_IT_WORKS = [
  { icon: '01', title: 'Partage ton code', desc: 'Envoie ton code à tes amis via SMS, WhatsApp ou réseaux sociaux.' },
  { icon: '02', title: "Ton ami s'inscrit", desc: "Il crée son compte WashNow et passe sa 1ère commande." },
  { icon: '03', title: 'Vous gagnez tous les deux', desc: 'Toi : 10€ offerts. Lui : 10€ de réduction sur sa première prestation.' },
];

export default function Referral() {
  const router = useRouter();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Essaie WashNow, le service de lavage de voiture à domicile !\nUtilise mon code ${REFERRAL_CODE} et profite de 10€ offerts sur ta première réservation.\n${REFERRAL_LINK}`,
        title: 'WashNow — Parrainage',
      });
    } catch {
      // L'utilisateur a annulé
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parrainer un ami</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIconBox}><Text style={styles.heroIconText}>10€</Text></View>
        <Text style={styles.heroTitle}>Invitez vos amis,{'\n'}gagnez ensemble</Text>
        <Text style={styles.heroSub}>
          Pour chaque ami parrainé, vous recevez{' '}
          <Text style={styles.heroHighlight}>10€</Text> et lui aussi !
        </Text>
      </View>

      {/* Code bloc */}
      <View style={styles.codeSection}>
        <Text style={styles.codeLabel}>Votre code personnel</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{REFERRAL_CODE}</Text>
        </View>
        <Text style={styles.codeStats}>3 filleuls · 30€ gagnés</Text>
      </View>

      {/* Comment ça marche */}
      <View style={styles.howSection}>
        {HOW_IT_WORKS.map((step, i) => (
          <View key={i} style={styles.howRow}>
            <View style={styles.howIcon}>
              <Text style={styles.howIconText}>{step.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.howTitle}>{step.title}</Text>
              <Text style={styles.howDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>Partager mon code</Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>Parrainage valable uniquement pour les nouveaux utilisateurs</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#0a0a0a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 32, color: 'white', lineHeight: 36 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: 'white' },
  hero: {
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 28,
    paddingBottom: 32,
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 52, marginBottom: 12 },
  heroIconBox: { width: 72, height: 72, backgroundColor: '#1558E7', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  heroIconText: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  howIconText: { fontSize: 13, fontWeight: '900', color: '#1558E7' },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 10,
  },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 22 },
  heroHighlight: { color: '#FFB800', fontWeight: '800' },
  codeSection: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20 },
  codeLabel: { fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  codeBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderWidth: 2,
    borderColor: '#1a6bff',
    borderStyle: 'dashed',
  },
  codeText: { fontSize: 28, fontWeight: '900', color: '#1a6bff', letterSpacing: 4 },
  codeStats: { fontSize: 13, color: '#00c853', fontWeight: '600', marginTop: 10 },
  howSection: { backgroundColor: 'white', borderRadius: 16, marginHorizontal: 20, padding: 20, gap: 18 },
  howRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  howIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  howTitle: { fontSize: 14, fontWeight: '700', color: '#0a0a0a', marginBottom: 3 },
  howDesc: { fontSize: 13, color: '#666', lineHeight: 19 },
  footer: { padding: 20, paddingBottom: 36, marginTop: 'auto' },
  shareBtn: {
    backgroundColor: '#1a6bff',
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  footerNote: { fontSize: 12, color: '#aaa', textAlign: 'center' },
});
