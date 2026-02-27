import { useRouter } from 'expo-router';
import Payment from '../src/payment';

export default function PaymentSheet() {
  const router = useRouter();
  return (
    <Payment
      amount={39}
      onSuccess={() => router.push('/confirmation')}
      onCancel={() => router.back()}
    />
  );
}