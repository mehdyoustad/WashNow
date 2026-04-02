import { StyleSheet, Text, View } from 'react-native';

interface PaymentProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

// Stub web — Stripe React Native ne supporte pas le web
export default function Payment({ amount }: PaymentProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Paiement disponible uniquement sur l'application mobile.</Text>
      <Text style={styles.amount}>Total : {amount}€</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 12 },
  amount: { fontSize: 22, fontWeight: '700', color: '#1a6bff' },
});
