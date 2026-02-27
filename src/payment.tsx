import { useStripe } from '@stripe/stripe-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from './supabase';

interface PaymentProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function Payment({ amount, onSuccess, onCancel }: PaymentProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
  body: { amount },
  headers: {
    Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
  },
});
      if (error) throw error;

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'WashNow',
        paymentIntentClientSecret: data.clientSecret,
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

      const { error: paymentError } = await presentPaymentSheet();
      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Erreur de paiement', paymentError.message);
        }
      } else {
        onSuccess();
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Récapitulatif</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Lavage complet</Text>
          <Text style={styles.rowValue}>49€</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Déplacement</Text>
          <Text style={styles.rowValue}>Gratuit</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: '#00c853' }]}>Code promo</Text>
          <Text style={[styles.rowValue, { color: '#00c853' }]}>-10€</Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{amount}€</Text>
        </View>
      </View>

      <View style={styles.secureBadge}>
        <Text style={styles.secureText}>🔒 Paiement 100% sécurisé par Stripe</Text>
      </View>

      <TouchableOpacity style={styles.btnPay} onPress={handlePayment} disabled={loading}>
        {loading
          ? <ActivityIndicator color="white" />
          : <Text style={styles.btnPayText}>Payer {amount}€</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
        <Text style={styles.btnCancelText}>Annuler</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: 'white', justifyContent: 'center' },
  card: { backgroundColor: '#f5f5f5', borderRadius: 16, padding: 20, marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '700', color: '#0a0a0a', marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e8e8e8' },
  rowLabel: { fontSize: 14, color: '#555' },
  rowValue: { fontSize: 14, fontWeight: '600', color: '#0a0a0a' },
  totalRow: { borderBottomWidth: 0, marginTop: 4, paddingTop: 14 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#0a0a0a' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#1a6bff' },
  secureBadge: { backgroundColor: '#e8faf0', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 20 },
  secureText: { fontSize: 13, color: '#00c853', fontWeight: '600' },
  btnPay: { backgroundColor: '#1a6bff', borderRadius: 50, padding: 18, alignItems: 'center', marginBottom: 12 },
  btnPayText: { color: 'white', fontSize: 16, fontWeight: '700' },
  btnCancel: { backgroundColor: '#f5f5f5', borderRadius: 50, padding: 18, alignItems: 'center' },
  btnCancelText: { color: '#0a0a0a', fontSize: 15, fontWeight: '600' },
});