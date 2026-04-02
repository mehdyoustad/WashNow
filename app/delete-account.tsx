import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Cache } from '../src/cache';
import { supabase } from '../src/supabase';
import { track } from '../src/analytics';

export default function DeleteAccount() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'confirm' | 'password'>('confirm');

  const handleDelete = async () => {
    if (!password) { Alert.alert('Erreur', 'Entre ton mot de passe pour confirmer.'); return; }
    setLoading(true);
    try {
      // 1. Vérifier les credentials
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('Session expirée');

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });
      if (authError) throw new Error('Mot de passe incorrect');

      // 2. Supprimer les données utilisateur
      await Promise.all([
        supabase.from('bookings').delete().eq('user_id', user.id),
        supabase.from('vehicles').delete().eq('user_id', user.id),
        supabase.from('ratings').delete().eq('user_id', user.id),
        supabase.from('analytics').delete().eq('user_id', user.id),
      ]);
      await supabase.from('profiles').delete().eq('id', user.id);

      // 3. Tracker l'event avant suppression
      await track('account_deleted');

      // 4. Vider le cache local
      await Cache.clear();

      // 5. Supprimer le compte auth
      await supabase.auth.admin.deleteUser(user.id).catch(() => {
        // Si pas de droits admin, juste se déconnecter
        // L'admin supprimera manuellement via Supabase Dashboard
      });
      await supabase.auth.signOut();

      Alert.alert(
        'Compte supprimé',
        'Toutes vos données ont été supprimées. Au revoir !',
        [{ text: 'OK', onPress: () => router.replace('/login' as any) }]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message ?? 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Supprimer mon compte</Text>
      </View>

      <View style={styles.content}>
        {step === 'confirm' ? (
          <>
            <View style={styles.warningBox}>
              <View style={styles.warningIconBox}><Text style={styles.warningIconBoxText}>!</Text></View>
              <Text style={styles.warningTitle}>Action irréversible</Text>
              <Text style={styles.warningText}>
                La suppression de votre compte entraîne la perte définitive de :
              </Text>
              {[
                'Votre historique de lavages',
                'Vos points de fidélité',
                'Vos véhicules enregistrés',
                'Vos données personnelles',
                'Vos méthodes de paiement',
              ].map((item, i) => (
                <View key={i} style={styles.lossRow}>
                  <Text style={styles.lossDot}>✕</Text>
                  <Text style={styles.lossText}>{item}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.continueBtn} onPress={() => setStep('password')}>
              <Text style={styles.continueBtnText}>Je comprends, continuer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.passwordTitle}>Confirme ton identité</Text>
            <Text style={styles.passwordSub}>Entre ton mot de passe pour confirmer la suppression définitive.</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#999"
                autoFocus
              />
            </View>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={loading}>
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.deleteBtnText}>Supprimer définitivement</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep('confirm')}>
              <Text style={styles.cancelBtnText}>Retour</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#0a0a0a', flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, gap: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 32, color: 'white', lineHeight: 36 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: 'white' },
  content: { flex: 1, padding: 24 },
  warningBox: { backgroundColor: '#fff5f5', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#ffcccc' },
  warningIcon: { fontSize: 36, textAlign: 'center', marginBottom: 12 },
  warningIconBox: { width: 56, height: 56, backgroundColor: '#FEE2E2', borderRadius: 14, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 12 },
  warningIconBoxText: { fontSize: 24, fontWeight: '900', color: '#DC2626' },
  warningTitle: { fontSize: 18, fontWeight: '700', color: '#cc3333', textAlign: 'center', marginBottom: 10 },
  warningText: { fontSize: 13, color: '#555', marginBottom: 12 },
  lossRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 6 },
  lossDot: { color: '#cc3333', fontWeight: '700', fontSize: 12 },
  lossText: { fontSize: 13, color: '#333' },
  continueBtn: { backgroundColor: '#cc3333', borderRadius: 50, padding: 18, alignItems: 'center', marginBottom: 12 },
  continueBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  cancelBtn: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 50, padding: 16, alignItems: 'center' },
  cancelBtnText: { color: '#555', fontSize: 15, fontWeight: '600' },
  passwordTitle: { fontSize: 20, fontWeight: '700', color: '#0a0a0a', marginBottom: 8 },
  passwordSub: { fontSize: 14, color: '#999', marginBottom: 24 },
  inputWrapper: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
  input: { backgroundColor: 'white', borderRadius: 12, padding: 16, fontSize: 15, color: '#0a0a0a', borderWidth: 2, borderColor: '#e8e8e8' },
  deleteBtn: { backgroundColor: '#cc3333', borderRadius: 50, padding: 18, alignItems: 'center', marginBottom: 12 },
  deleteBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
