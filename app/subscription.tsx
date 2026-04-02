import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

type PlanId = 'essentiel' | 'premium' | 'elite';

interface Plan {
  id: PlanId;
  name: string;
  tag?: string;
  monthlyPrice: number;
  annualPrice: number;
  washes: string;
  washesDetail: string;
  color: string;
  features: { text: string; highlight?: boolean }[];
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    monthlyPrice: 49,
    annualPrice: 39,
    washes: '2 lavages',
    washesDetail: 'extérieur · par mois',
    color: '#6B7280',
    cta: 'Commencer avec Essentiel',
    features: [
      { text: '2 lavages extérieur / mois' },
      { text: "Report d'un lavage possible" },
      { text: 'Sans engagement' },
      { text: 'Support standard' },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    tag: 'Le plus populaire',
    monthlyPrice: 89,
    annualPrice: 69,
    washes: '4 lavages',
    washesDetail: 'au choix · par mois',
    color: '#1558E7',
    cta: 'Passer à Premium',
    features: [
      { text: '4 lavages tous services / mois', highlight: true },
      { text: 'Réservation prioritaire', highlight: true },
      { text: 'Points fidélité x2', highlight: true },
      { text: 'Report de 2 lavages possible' },
      { text: 'Sans engagement' },
      { text: 'Support prioritaire' },
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    tag: 'Flotte & Entreprise',
    monthlyPrice: 0,
    annualPrice: 0,
    washes: 'Illimité',
    washesDetail: 'multi-véhicules · B2B',
    color: '#0D0D0D',
    cta: 'Contacter le service commercial',
    features: [
      { text: 'Véhicules illimités', highlight: true },
      { text: 'Facturation entreprise', highlight: true },
      { text: 'Account manager dédié', highlight: true },
      { text: "Rapport mensuel d'utilisation" },
      { text: 'SLA garanti 24h' },
      { text: 'Formation équipe incluse' },
    ],
  },
];

export default function Subscription() {
  const router = useRouter();
  const [selected, setSelected] = useState<PlanId>('premium');
  const [isAnnual, setIsAnnual] = useState(false);

  const getPrice = (plan: Plan) => {
    if (plan.id === 'elite') return null;
    return isAnnual ? plan.annualPrice : plan.monthlyPrice;
  };

  const getAnnualSaving = (plan: Plan) => {
    if (plan.id === 'elite') return null;
    const saving = (plan.monthlyPrice - plan.annualPrice) * 12;
    return saving > 0 ? saving : null;
  };

  const handleSubscribe = () => {
    const plan = PLANS.find(p => p.id === selected);
    if (!plan) return;
    if (plan.id === 'elite') {
      Alert.alert('Service commercial', 'Notre équipe vous contactera dans les 24h.\n\nEmail : enterprise@washnow.fr');
      return;
    }
    const price = getPrice(plan);
    Alert.alert(
      `Abonnement ${plan.name}`,
      `${price}€/${isAnnual ? 'mois (facturé annuellement)' : 'mois'}\n\nVous allez être redirigé vers le paiement sécurisé Stripe.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => router.push('/payment-sheet' as any) },
      ]
    );
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Abonnements</Text>
          <Text style={styles.headerSub}>Lavage régulier, prix maîtrisé</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Toggle facturation */}
        <View style={styles.billingToggle}>
          <Text style={[styles.billingLabel, !isAnnual && styles.billingLabelActive]}>Mensuel</Text>
          <Switch
            value={isAnnual}
            onValueChange={setIsAnnual}
            trackColor={{ false: '#E5E7EB', true: '#1558E7' }}
            thumbColor="#FFFFFF"
            style={{ marginHorizontal: 10 }}
          />
          <Text style={[styles.billingLabel, isAnnual && styles.billingLabelActive]}>Annuel</Text>
          {isAnnual && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsBadgeText}>Jusqu'à -22%</Text>
            </View>
          )}
        </View>

        {/* Plans */}
        {PLANS.map((plan) => {
          const price = getPrice(plan);
          const annualSaving = getAnnualSaving(plan);
          const isSelected = selected === plan.id;

          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                isSelected && { borderColor: plan.color, borderWidth: 2 },
              ]}
              onPress={() => setSelected(plan.id)}
              activeOpacity={0.8}
            >
              {plan.tag && (
                <View style={[styles.planTag, { backgroundColor: plan.color }]}>
                  <Text style={styles.planTagText}>{plan.tag}</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planName, isSelected && { color: plan.color }]}>
                    {plan.name}
                  </Text>
                  <Text style={styles.planWashes}>
                    {plan.washes}{' '}
                    <Text style={styles.planWashesSub}>{plan.washesDetail}</Text>
                  </Text>
                </View>
                <View style={styles.planPriceBlock}>
                  {price !== null ? (
                    <>
                      <View style={styles.planPriceRow}>
                        <Text style={[styles.planPrice, { color: plan.color }]}>{price}€</Text>
                        <Text style={styles.planPricePeriod}>/mois</Text>
                      </View>
                      {isAnnual && annualSaving && annualSaving > 0 && (
                        <Text style={styles.planSaving}>-{annualSaving}€/an</Text>
                      )}
                      {!isAnnual && (
                        <Text style={styles.planHint}>ou {plan.annualPrice}€/mois en annuel</Text>
                      )}
                    </>
                  ) : (
                    <Text style={[styles.planPrice, { color: plan.color, fontSize: 18 }]}>
                      Sur devis
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.planDivider} />

              {plan.features.map((f, fi) => (
                <View key={fi} style={styles.featureRow}>
                  <Text style={[styles.featureCheck, { color: plan.color }]}>✓</Text>
                  <Text style={[styles.featureText, f.highlight && styles.featureTextHL]}>
                    {f.text}
                  </Text>
                </View>
              ))}

              {isSelected && (
                <View style={[styles.selectedBadge, { backgroundColor: plan.color + '12', borderColor: plan.color }]}>
                  <Text style={[styles.selectedBadgeText, { color: plan.color }]}>Sélectionné</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Trust */}
        <View style={styles.trustRow}>
          {[
            { label: 'Paiement', sub: 'sécurisé Stripe' },
            { label: 'Annulable', sub: 'à tout moment' },
            { label: '4.9 / 5', sub: '1 200+ avis' },
          ].map((t, i) => (
            <View key={i} style={[styles.trustItem, i > 0 && styles.trustBorder]}>
              <Text style={styles.trustLabel}>{t.label}</Text>
              <Text style={styles.trustSub}>{t.sub}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[
            styles.cta,
            { backgroundColor: PLANS.find(p => p.id === selected)?.color ?? '#1558E7' },
          ]}
          onPress={handleSubscribe}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {PLANS.find(p => p.id === selected)?.cta}
          </Text>
          {selected !== 'elite' && isAnnual && (
            <Text style={styles.ctaSub}>
              Facturé {(PLANS.find(p => p.id === selected)?.annualPrice ?? 0) * 12}€/an
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.legalNote}>
          Sans engagement. Annulation à tout moment depuis votre profil.
        </Text>
        <TouchableOpacity onPress={() => router.push('/legal' as any)}>
          <Text style={styles.legalLink}>CGU & Conditions d'abonnement</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },

  header: {
    backgroundColor: '#0D0D0D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backBtn: { width: 36, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: '#FFFFFF' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

  content: { padding: 16 },

  billingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  billingLabel: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  billingLabelActive: { color: '#0D0D0D' },
  savingsBadge: {
    marginLeft: 10,
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  savingsBadgeText: { color: '#1558E7', fontSize: 12, fontWeight: '700' },

  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    paddingTop: 22,
  },
  planTag: {
    position: 'absolute',
    top: -13,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -55 }],
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 6,
  },
  planTagText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  planName: { fontSize: 20, fontWeight: '700', color: '#0D0D0D', marginBottom: 4 },
  planWashes: { fontSize: 14, fontWeight: '600', color: '#0D0D0D' },
  planWashesSub: { fontSize: 12, fontWeight: '400', color: '#9CA3AF' },
  planPriceBlock: { alignItems: 'flex-end' },
  planPriceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  planPrice: { fontSize: 32, fontWeight: '700' },
  planPricePeriod: { fontSize: 13, color: '#9CA3AF', paddingBottom: 4 },
  planSaving: { fontSize: 12, color: '#16A34A', fontWeight: '700', marginTop: 2 },
  planHint: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  planDivider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 },

  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 7 },
  featureCheck: { fontSize: 13, fontWeight: '700', width: 14 },
  featureText: { fontSize: 13, color: '#6B7280', flex: 1 },
  featureTextHL: { fontWeight: '600', color: '#0D0D0D' },

  selectedBadge: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 8,
    padding: 9,
    alignItems: 'center',
  },
  selectedBadgeText: { fontSize: 13, fontWeight: '700' },

  trustRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 18,
    overflow: 'hidden',
  },
  trustItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  trustBorder: { borderLeftWidth: 1, borderLeftColor: '#E5E7EB' },
  trustLabel: { fontSize: 13, fontWeight: '700', color: '#0D0D0D' },
  trustSub: { fontSize: 10, color: '#9CA3AF', marginTop: 2, textAlign: 'center' },

  cta: {
    borderRadius: 10,
    paddingVertical: 17,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 14,
  },
  ctaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  ctaSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 3 },

  legalNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 6,
  },
  legalLink: { fontSize: 12, color: '#1558E7', textAlign: 'center', fontWeight: '600' },
});
