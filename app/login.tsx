import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { track } from '../src/analytics';
import { WashNowMark } from '../src/components/WashNowLogo';
import { CACHE_KEYS, Cache } from '../src/cache';
import { supabase } from '../src/supabase';

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [cguAccepted, setCguAccepted] = useState(false);

  const handleResetPassword = async () => {
    if (!resetEmail) { Alert.alert('Erreur', 'Entre ton adresse email'); return; }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: 'washnow://reset-password',
      });
      if (error) throw error;
      setResetModal(false);
      Alert.alert('Email envoyé', 'Vérifie ta boîte mail pour réinitialiser ton mot de passe.');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) { Alert.alert('Erreur', 'Remplis tous les champs'); return; }
    if (!isLogin && !cguAccepted) {
      Alert.alert('CGU requises', "Tu dois accepter les Conditions Générales d'Utilisation pour créer un compte.");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await Promise.race([
          supabase.auth.signInWithPassword({ email, password }),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout — vérifie ta connexion internet')), 10000)
          ),
        ]);
        if (error) throw error;
        await track('user_login', { method: 'email' });
        router.push('/home');
      } else {
        if (!name) { Alert.alert('Erreur', 'Entre ton prénom'); setLoading(false); return; }
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert({ id: data.user.id, full_name: name, email });
          await Cache.set(CACHE_KEYS.CGU_ACCEPTED, { accepted: true, date: new Date().toISOString() });
          await track('user_signup', { method: 'email' });
          await track('cgu_accepted');
        }
        router.replace('/welcome' as any);
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <WashNowMark size={56} />
        <Text style={styles.title}>
          {isLogin ? 'Bon retour' : 'Créer un compte'}
        </Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Connectez-vous à WashNow' : 'Rejoignez WashNow'}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!isLogin && (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={styles.input}
              placeholder="Mehdy"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="ton@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {isLogin && (
          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => { setResetEmail(email); setResetModal(true); }}
          >
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        )}

        {!isLogin && (
          <TouchableOpacity
            style={styles.cguRow}
            onPress={() => setCguAccepted(!cguAccepted)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, cguAccepted && styles.checkboxChecked]}>
              {cguAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.cguText}>
              {'J\'accepte les '}
              <Text style={styles.cguLink} onPress={() => router.push('/legal' as any)}>CGU</Text>
              {' et la '}
              <Text style={styles.cguLink} onPress={() => router.push('/legal' as any)}>
                Politique de confidentialité
              </Text>
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btnPrimary, (!isLogin && !cguAccepted) && styles.btnDisabled]}
          onPress={handleAuth}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.btnPrimaryText}>
                {isLogin ? 'Se connecter' : 'Créer mon compte'}
              </Text>}
        </TouchableOpacity>

        <View style={styles.separator}>
          <View style={styles.sepLine} />
          <Text style={styles.sepText}>ou continuer avec</Text>
          <View style={styles.sepLine} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity
            style={styles.socialBtn}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Google', 'Connexion Google disponible après publication sur les stores')}
          >
            {/* G stylisé Google colors */}
            <View style={styles.googleG}>
              <Text style={styles.googleGBlue}>G</Text>
            </View>
            <Text style={styles.socialBtnText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialBtn}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Apple', 'Connexion Apple disponible après publication sur les stores')}
          >
            {/* Apple mark */}
            <View style={styles.appleA}>
              <Text style={styles.appleAText}>&#63743;</Text>
            </View>
            <Text style={styles.socialBtnText}>Apple</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.switchBtn} onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
            <Text style={styles.switchLink}>{isLogin ? "S'inscrire" : 'Se connecter'}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal mot de passe oublié */}
      <Modal
        visible={resetModal}
        transparent
        animationType="slide"
        onRequestClose={() => setResetModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setResetModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Mot de passe oublié</Text>
            <Text style={styles.modalSub}>
              Entre ton email pour recevoir un lien de réinitialisation.
            </Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="ton@email.com"
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
            </View>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleResetPassword}
              disabled={resetLoading}
            >
              {resetLoading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.btnPrimaryText}>Envoyer le lien</Text>}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    backgroundColor: '#0D0D0D',
    paddingTop: 72,
    paddingBottom: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 12,
  },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', letterSpacing: -0.4 },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },

  scroll: { flex: 1 },
  form: { padding: 24, paddingBottom: 40 },

  inputWrapper: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 7 },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#0D0D0D',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 18, marginTop: -4 },
  forgotText: { color: '#1558E7', fontSize: 13, fontWeight: '600' },

  btnPrimary: {
    backgroundColor: '#1558E7',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 2,
  },
  btnDisabled: { opacity: 0.4 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  cguRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 18 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#1558E7', borderColor: '#1558E7' },
  checkmark: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  cguText: { flex: 1, fontSize: 13, color: '#6B7280', lineHeight: 20 },
  cguLink: { color: '#1558E7', fontWeight: '600' },

  separator: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  sepLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB' },
  sepText: { color: '#9CA3AF', fontSize: 13 },

  socialRow: { flexDirection: 'row', gap: 10 },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  socialBtnText: { fontSize: 14, fontWeight: '600', color: '#0D0D0D' },
  googleG: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  googleGBlue: { fontSize: 16, fontWeight: '800', color: '#4285F4' },
  appleA: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  appleAText: { fontSize: 16, fontWeight: '600', color: '#000000' },

  switchBtn: { paddingTop: 22, alignItems: 'center' },
  switchText: { fontSize: 14, color: '#9CA3AF' },
  switchLink: { color: '#1558E7', fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 28,
    paddingBottom: 44,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 22,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0D0D0D', marginBottom: 6 },
  modalSub: { fontSize: 14, color: '#6B7280', marginBottom: 22, lineHeight: 20 },
});
