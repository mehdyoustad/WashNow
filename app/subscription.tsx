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
  savings?: string;
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
    color: '#555',
    cta: 'Commencer avec Essentiel',
    features: [
      { text: '2 lavages extérieur/mois' },
      { text: 'Report d\'un lavage possible' },
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
    savings: 'Économisez 240€/an',
    color: '#1a6bff',
    cta: 'Passer à Premium',
    features: [
      { text: '4 lavages tous services/mois', highlight: true },
      { text: 'Réservation prioritaire', highlight: true },
      { text: 'Points fidélité ×2', highlight: true },
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
    color: '#FFB800',
    cta: 'Contacter le service commercial',
    features: [
      { text: 'Véhicules illimités', highlight: true },
      { text: 'Facturation entreprise', highlight: true },
      { text: 'Account manager dédié', highlight: true },
      { text: 'Rapport mensuel d\'utilisation' },
      { text: 'SLA garanti 24h' },
      { text: 'Formation équipe incluse' },
    ],
  },
];

const TRUST_BADGES = [
  { icon: '🔒', text: 'Paiement\nsécurisé Stripe' },
  { icon: '↩️', text: 'Annulable\nà tout moment' },
  { icon: '⭐', text: '4.9/5 sur\n1 200+ avis' },
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
      Alert.alert('Service commercial', 'Notre équipe vous contactera dans les 24h.\n\nEmail : enterprise@washnow.fr\nTél : 01 23 45 67 89');
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Abonnements</Text>
          <Text style={styles.headerSub}>Lavage illimité, prix maîtrisé</Text>
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
            trackColor={{ false: '#e0e0e0', true: '#00c853' }}
            thumbColor="white"
            style={{ marginHorizontal: 10 }}
          />
          <Text style={[styles.billingLabel, isAnnual && styles.billingLabelActive]}>Annuel</Text>
          {isAnnual && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsBadgeText}>Jusqu'à −22%</Text>
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
                plan.id === 'premium' && styles.planCardFeatured,
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
                  <Text style={[styles.planName, isSelected && { color: plan.color }]}>{plan.name}</Text>
                  <Text style={styles.planWashesDetail}>{plan.washes} <Text style={styles.planWashesDetailSub}>{plan.washesDetail}</Text></Text>
                </View>
                <View style={styles.planPriceBlock}>
                  {price !== null ? (
                    <>
                      <View style={styles.planPriceRow}>
                        <Text style={[styles.planPrice, { color: plan.color }]}>{price}€</Text>
                        <Text style={styles.planPricePeriod}>/mois</Text>
                      </View>
                      {isAnnual && annualSaving && annualSaving > 0 && (
                        <Text style={styles.planAnnualSaving}>−{annualSaving}€/an</Text>
                      )}
                      {!isAnnual && (
                        <Text style={styles.planAnnualHint}>ou {plan.annualPrice}€/mois annuel</Text>
                      )}
                    </>
                  ) : (
                    <Text style={[styles.planPrice, { color: plan.color, fontSize: 18 }]}>Sur devis</Text>
                  )}
                </View>
              </View>

              <View style={styles.planDivider} />

              {plan.features.map((f, fi) => (
                <View key={fi} style={styles.featureRow}>
                  <Text style={[styles.featureCheck, { color: plan.color }]}>✓</Text>
                  <Text style={[styles.featureText, f.highlight && styles.featureTextHighlight]}>
                    {f.text}
                  </Text>
                </View>
              ))}

              {isSelected && (
                <View style={[styles.selectedIndicator, { backgroundColor: plan.color + '15', borderColor: plan.color }]}>
                  <Text style={[styles.selectedText, { color: plan.color }]}>✓ Sélectionné</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Trust badges */}
        <View style={styles.trustRow}>
          {TRUST_BADGES.map((badge, i) => (
            <View key={i} style={styles.trustBadge}>
              <Text style={styles.trustIcon}>{badge.icon}</Text>
              <Text style={styles.trustText}>{badge.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: PLANS.find(p => p.id === selected)?.color ?? '#1a6bff' }]}
          onPress={handleSubscribe}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{PLANS.find(p => p.id === selected)?.cta}</Text>
          {selected !== 'elite' && isAnnual && (
            <Text style={styles.ctaSubText}>Facturé {(PLANS.find(p => p.id === selected)?.annualPrice ?? 0) * 12}€/an</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.legalNote}>
          Sans engagement. Annulation à tout moment depuis votre profil. Pas de frais cachés.
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#0a0a0a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backBtn: { width: 36, justifyContent: 'center' },
  backArrow: { fontSize: 30, color: 'white', lineHeight: 34 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 19, fontWeight: '700', color: 'white' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  content: { padding: 20 },
  billingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  billingLabel: { fontSize: 14, fontWeight: '600', color: '#bbb' },
  billingLabelActive: { color: '#0a0a0a' },
  savingsBadge: {
    marginLeft: 10,
    backgroundColor: '#e8faf0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  savingsBadgeText: { color: '#00c853', fontSize: 12, fontWeight: '700' },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    position: 'relative',
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  planCardFeatured: {
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  planTag: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    left: '50%',
    transform: [{ translateX: -60 }],
  },
  planTagText: { color: 'white', fontSize: 12, fontWeight: '700' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  planName: { fontSize: 20, fontWeight: '800', color: '#0a0a0a', marginBottom: 4 },
  planWashesDetail: { fontSize: 15, fontWeight: '700', color: '#0a0a0a' },
  planWashesDetailSub: { fontSize: 12, fontWeight: '400', color: '#999' },
  planPriceBlock: { alignItems: 'flex-end' },
  planPriceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  planPrice: { fontSize: 34, fontWeight: '800', color: '#0a0a0a' },
  planPricePeriod: { fontSize: 13, color: '#999', paddingBottom: 5 },
  planAnnualSaving: { fontSize: 12, color: '#00c853', fontWeight: '700', marginTop: 2 },
  planAnnualHint: { fontSize: 11, color: '#bbb', marginTop: 2 },
  planDivider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  featureCheck: { fontSize: 14, fontWeight: '700', width: 16 },
  featureText: { fontSize: 13, color: '#555', flex: 1 },
  featureTextHighlight: { fontWeight: '700', color: '#0a0a0a' },
  selectedIndicator: {
    marginTop: 14,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  selectedText: { fontSize: 13, fontWeight: '700' },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  trustBadge: { alignItems: 'center', gap: 6, flex: 1 },
  trustIcon: { fontSize: 22 },
  trustText: { fontSize: 10, color: '#666', textAlign: 'center', lineHeight: 14, fontWeight: '600' },
  cta: {
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#1a6bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaText: { color: 'white', fontSize: 16, fontWeight: '700' },
  ctaSubText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 3 },
  legalNote: { fontSize: 12, color: '#bbb', textAlign: 'center', lineHeight: 18, marginBottom: 8 },
  legalLink: { fontSize: 12, color: '#1a6bff', textAlign: 'center', fontWeight: '600' },
});
