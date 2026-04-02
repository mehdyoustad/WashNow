import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../src/theme';

export default function WidgetPreview() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Widgets écran d'accueil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoIconBox}>
            <Text style={styles.infoIconText}>i</Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textSub }]}>
            Les widgets nécessitent iOS 14+ ou Android 12+. Activez-les en maintenant appuyé sur votre écran d'accueil, puis sélectionnez WashNow.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Aperçu des widgets</Text>

        {/* Widget Petit */}
        <View style={styles.widgetSection}>
          <Text style={[styles.widgetSizeLabel, { color: colors.textSub }]}>PETIT — 2×2</Text>
          <View style={styles.widgetSmall}>
            <View style={styles.widgetSmallHeader}>
              <View style={styles.widgetLogoBox}>
                <Text style={styles.widgetLogoText}>W</Text>
              </View>
              <Text style={styles.widgetBrand}>WashNow</Text>
            </View>
            <Text style={styles.widgetSmallDate}>Sam. 15 mars</Text>
            <Text style={styles.widgetSmallTime}>10h00</Text>
            <View style={styles.widgetSmallPoints}>
              <Text style={styles.widgetSmallPointsText}>650 pts</Text>
            </View>
          </View>
          <Text style={[styles.widgetDesc, { color: colors.textSub }]}>Affiche votre prochain RDV et vos points fidélité</Text>
        </View>

        {/* Widget Moyen */}
        <View style={styles.widgetSection}>
          <Text style={[styles.widgetSizeLabel, { color: colors.textSub }]}>MOYEN — 2×4</Text>
          <View style={styles.widgetMedium}>
            <View style={styles.widgetMediumTop}>
              <View style={styles.widgetLogoBox}>
                <Text style={styles.widgetLogoText}>W</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.widgetBrand}>WashNow</Text>
                <View style={styles.widgetMediumStatusRow}>
                  <View style={styles.widgetStatusDot} />
                  <Text style={styles.widgetMediumStatus}>Karim en route</Text>
                </View>
              </View>
              <Text style={styles.widgetMediumEta}>8 min</Text>
            </View>
            <View style={styles.widgetMediumProgress}>
              <View style={styles.widgetMediumProgressFill} />
            </View>
            <View style={styles.widgetMediumSteps}>
              {['Confirmé', 'En route', 'Lavage', 'Terminé'].map((s, i) => (
                <View key={i} style={styles.widgetStep}>
                  <Text style={[styles.widgetStepText, i <= 1 && { color: '#1558E7' }]}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={[styles.widgetDesc, { color: colors.textSub }]}>Statut du lavage en cours avec progression en temps réel</Text>
        </View>

        {/* Widget Grand */}
        <View style={styles.widgetSection}>
          <Text style={[styles.widgetSizeLabel, { color: colors.textSub }]}>GRAND — 4×4</Text>
          <View style={styles.widgetLarge}>
            <View style={styles.widgetLargeHeader}>
              <View style={styles.widgetLogoBox}>
                <Text style={styles.widgetLogoText}>W</Text>
              </View>
              <Text style={styles.widgetBrand}>WashNow</Text>
              <View style={styles.widgetLargePoints}><Text style={styles.widgetLargePointsText}>650 pts</Text></View>
            </View>
            <View style={styles.widgetLargeDivider} />
            <Text style={styles.widgetLargeTitle}>Derniers lavages</Text>
            {[
              { service: 'Lavage complet', date: '2 mars', price: '39€', stars: '★★★★★' },
              { service: 'Lavage extérieur', date: '18 fév.', price: '19€', stars: '★★★★' },
            ].map((item, i) => (
              <View key={i} style={styles.widgetLargeRow}>
                <View style={styles.widgetVehicleBox}>
                  <Text style={styles.widgetVehicleText}>VH</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.widgetLargeRowName}>{item.service}</Text>
                  <Text style={styles.widgetLargeRowDate}>{item.date} · {item.stars}</Text>
                </View>
                <Text style={styles.widgetLargeRowPrice}>{item.price}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.widgetLargeBtn}>
              <Text style={styles.widgetLargeBtnText}>+ Réserver</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.widgetDesc, { color: colors.textSub }]}>Historique rapide + bouton de réservation directe</Text>
        </View>

        {/* Instructions */}
        <View style={[styles.instructionsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.instructionsTitle, { color: colors.text }]}>Comment ajouter un widget</Text>
          {[
            { step: '1', text: "Maintenez appuyé sur votre écran d'accueil jusqu'à ce que les apps tremblent" },
            { step: '2', text: 'iOS : appuyez sur + en haut à gauche · Android : appuyez sur « Widgets »' },
            { step: '3', text: 'Recherchez « WashNow » dans la liste' },
            { step: '4', text: 'Sélectionnez la taille souhaitée et placez-le sur votre écran' },
          ].map(item => (
            <View key={item.step} style={styles.instructionRow}>
              <View style={[styles.instructionStep, { backgroundColor: '#1558E7' }]}>
                <Text style={styles.instructionStepText}>{item.step}</Text>
              </View>
              <Text style={[styles.instructionText, { color: colors.textSub }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: '#0D0D0D', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 30, color: 'white', lineHeight: 34 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: 'white' },
  scroll: { flex: 1, padding: 20 },
  infoBanner: { flexDirection: 'row', gap: 10, borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, alignItems: 'flex-start' },
  infoIconBox: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#1558E7', justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1 },
  infoIconText: { color: 'white', fontSize: 12, fontWeight: '800' },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  widgetSection: { marginBottom: 28 },
  widgetSizeLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  widgetDesc: { fontSize: 13, marginTop: 10, lineHeight: 18 },

  widgetLogoBox: { width: 20, height: 20, backgroundColor: '#1558E7', borderRadius: 5, justifyContent: 'center', alignItems: 'center' },
  widgetLogoText: { color: 'white', fontSize: 10, fontWeight: '900' },

  // Widget petit
  widgetSmall: { width: 140, height: 140, backgroundColor: '#0D0D0D', borderRadius: 20, padding: 14, justifyContent: 'space-between' },
  widgetSmallHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  widgetBrand: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  widgetSmallDate: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  widgetSmallTime: { color: 'white', fontSize: 28, fontWeight: '700', lineHeight: 32 },
  widgetSmallPoints: { backgroundColor: 'rgba(255,184,0,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  widgetSmallPointsText: { color: '#FFB800', fontSize: 11, fontWeight: '700' },

  // Widget moyen
  widgetMedium: { backgroundColor: '#0D0D0D', borderRadius: 20, padding: 16, width: '100%' },
  widgetMediumTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  widgetMediumStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  widgetStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFB800' },
  widgetMediumStatus: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  widgetMediumEta: { color: '#1558E7', fontSize: 22, fontWeight: '700' },
  widgetMediumProgress: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 12 },
  widgetMediumProgressFill: { width: '45%', height: 4, backgroundColor: '#1558E7', borderRadius: 2 },
  widgetMediumSteps: { flexDirection: 'row', justifyContent: 'space-between' },
  widgetStep: { alignItems: 'center' },
  widgetStepText: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },

  // Widget grand
  widgetLarge: { backgroundColor: '#0D0D0D', borderRadius: 20, padding: 18 },
  widgetLargeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  widgetLargePoints: { marginLeft: 'auto', backgroundColor: 'rgba(255,184,0,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  widgetLargePointsText: { color: '#FFB800', fontSize: 12, fontWeight: '700' },
  widgetLargeDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 12 },
  widgetLargeTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  widgetLargeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  widgetVehicleBox: { width: 28, height: 28, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  widgetVehicleText: { color: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: '800' },
  widgetLargeRowName: { color: 'white', fontSize: 13, fontWeight: '600' },
  widgetLargeRowDate: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  widgetLargeRowPrice: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
  widgetLargeBtn: { backgroundColor: '#1558E7', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 8 },
  widgetLargeBtnText: { color: 'white', fontSize: 13, fontWeight: '700' },

  // Instructions
  instructionsCard: { borderRadius: 16, padding: 18, marginTop: 4 },
  instructionsTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  instructionRow: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
  instructionStep: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  instructionStepText: { color: 'white', fontSize: 12, fontWeight: '700' },
  instructionText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
