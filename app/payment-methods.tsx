import { useStripe } from '@stripe/stripe-react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../src/supabase';

type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

const BRAND_ICONS: Record<string, string> = {
  visa: '💳',
  mastercard: '💳',
  amex: '💳',
  default: '💳',
};

export default function PaymentMethods() {
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCard, setAddingCard] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setLoading(true);
    try {
      // Charge les cartes sauvegardées depuis Supabase (stockées après chaque paiement réussi)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      setCards(
        (data ?? []).map((d: any) => ({
          id: d.id,
          brand: d.brand ?? 'visa',
          last4: d.last4 ?? '****',
          expMonth: d.exp_month ?? 12,
          expYear: d.exp_year ?? 2026,
          isDefault: d.is_default ?? false,
        }))
      );
    } catch {
      // Si la table n'existe pas encore, on affiche un état vide
    } finally {
      setLoading(false);
    }
  };

  const addCard = async () => {
    setAddingCard(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non connecté');

      // Crée un SetupIntent côté Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-setup-intent', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      if (error) throw error;

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'WashNow',
        setupIntentClientSecret: data.clientSecret,
        appearance: {
          colors: {
            primary: '#1a6bff',
            background: '#ffffff',
            componentBackground: '#f5f5f5',
            componentText: '#0a0a0a',
          },
        },
      });
      if (initError) throw initError;

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Alert.alert('Erreur', presentError.message);
        }
      } else {
        Alert.alert('Carte ajoutée !', 'Votre carte a été enregistrée avec succès.');
        loadCards();
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setAddingCard(false);
    }
  };

  const setDefault = async (cardId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('payment_methods').update({ is_default: true }).eq('id', cardId);
    loadCards();
  };

  const removeCard = (card: SavedCard) => {
    Alert.alert(
      'Supprimer la carte',
      `Supprimer la carte •••• ${card.last4} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('payment_methods').delete().eq('id', card.id);
            loadCards();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Moyens de paiement</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={{ height: 8 }} />

        {loading ? (
          <ActivityIndicator size="large" color="#1a6bff" style={{ marginTop: 60 }} />
        ) : cards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>Aucune carte enregistrée</Text>
            <Text style={styles.emptySub}>Ajoutez une carte pour payer encore plus vite</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>MES CARTES</Text>
            {cards.map((card) => (
              <View key={card.id} style={[styles.cardItem, card.isDefault && styles.cardItemDefault]}>
                <View style={styles.cardLeft}>
                  <View style={styles.cardIconBox}>
                    <Text style={{ fontSize: 24 }}>{BRAND_ICONS[card.brand] ?? BRAND_ICONS.default}</Text>
                  </View>
                  <View>
                    <Text style={styles.cardNumber}>
                      {card.brand.charAt(0).toUpperCase() + card.brand.slice(1)} •••• {card.last4}
                    </Text>
                    <Text style={styles.cardExp}>Expire {String(card.expMonth).padStart(2, '0')}/{card.expYear}</Text>
                    {card.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Par défaut</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.cardActions}>
                  {!card.isDefault && (
                    <TouchableOpacity onPress={() => setDefault(card.id)}>
                      <Text style={styles.cardActionText}>Par défaut</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => removeCard(card)}>
                    <Text style={styles.cardDeleteText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Sécurité */}
        <View style={styles.securityBox}>
          <Text style={styles.securityIcon}>🔒</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.securityTitle}>Paiement sécurisé</Text>
            <Text style={styles.securitySub}>Vos données bancaires sont chiffrées et gérées par Stripe. WashNow ne stocke jamais vos numéros de carte.</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bouton ajouter */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={addCard} disabled={addingCard}>
          {addingCard
            ? <ActivityIndicator color="white" />
            : <Text style={styles.addBtnText}>+ Ajouter une carte</Text>}
        </TouchableOpacity>
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
  scroll: { flex: 1, paddingHorizontal: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 8 },
  cardItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardItemDefault: { borderColor: '#1a6bff' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  cardIconBox: { width: 48, height: 34, backgroundColor: '#f5f5f5', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cardNumber: { fontSize: 15, fontWeight: '700', color: '#0a0a0a' },
  cardExp: { fontSize: 12, color: '#999', marginTop: 2 },
  defaultBadge: { backgroundColor: '#e8f0ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, alignSelf: 'flex-start', marginTop: 4 },
  defaultBadgeText: { color: '#1a6bff', fontSize: 11, fontWeight: '700' },
  cardActions: { gap: 8, alignItems: 'flex-end' },
  cardActionText: { fontSize: 12, color: '#1a6bff', fontWeight: '600' },
  cardDeleteText: { fontSize: 12, color: '#cc3333', fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingBottom: 20 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#0a0a0a', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 22 },
  securityBox: { flexDirection: 'row', gap: 12, backgroundColor: 'white', borderRadius: 16, padding: 16, marginTop: 16, alignItems: 'flex-start' },
  securityIcon: { fontSize: 22 },
  securityTitle: { fontSize: 14, fontWeight: '700', color: '#0a0a0a', marginBottom: 4 },
  securitySub: { fontSize: 12, color: '#999', lineHeight: 18 },
  footer: { padding: 20, paddingBottom: 34, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e8e8e8' },
  addBtn: { backgroundColor: '#1a6bff', borderRadius: 50, padding: 18, alignItems: 'center' },
  addBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
