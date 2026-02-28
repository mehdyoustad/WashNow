import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  const handleResetPassword = async () => {
    if (!resetEmail) { Alert.alert('Erreur', 'Entre ton adresse email'); return; }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: 'washnow://reset-password',
      });
      if (error) throw error;
      setResetModal(false);
      Alert.alert('Email envoyé !', 'Vérifie ta boîte mail pour réinitialiser ton mot de passe.');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) { Alert.alert('Erreur', 'Remplis tous les champs'); return; }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Timeout - vérifie ta connexion internet')), 10000))
        ]);
        if (error) throw error;
        router.push('/home');
      } else {
        if (!name) { Alert.alert('Erreur', 'Entre ton prénom'); setLoading(false); return; }
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert({ id: data.user.id, full_name: name, email });
        }
        Alert.alert('Compte créé !', 'Vérifie ton email pour confirmer ton compte.');
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
        <View style={styles.logo}><Text style={{ fontSize: 32 }}>🚿</Text></View>
        <Text style={styles.title}>{isLogin ? 'Bon retour !' : 'Créer un compte'}</Text>
        <Text style={styles.subtitle}>{isLogin ? 'Connectez-vous à WashNow' : 'Rejoignez WashNow'}</Text>
      </View>

      {/* Formulaire */}
      <View style={styles.form}>
        {!isLogin && (
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput style={styles.input} placeholder="Mehdy" value={name} onChangeText={setName} placeholderTextColor="#999" />
          </View>
        )}

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="ton@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#999" />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput style={styles.input} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#999" />
        </View>

        {isLogin && (
          <TouchableOpacity style={styles.forgotBtn} onPress={() => { setResetEmail(email); setResetModal(true); }}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.btnPrimary} onPress={handleAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnPrimaryText}>{isLogin ? 'Se connecter' : 'Créer mon compte'}</Text>}
        </TouchableOpacity>

        {/* Séparateur */}
        <View style={styles.separator}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>ou continuer avec</Text>
          <View style={styles.line} />
        </View>

        {/* Boutons sociaux */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn} onPress={() => Alert.alert('Google', 'Connexion Google disponible après publication sur les stores')}>
            <Text style={styles.socialIcon}>G</Text>
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn} onPress={() => Alert.alert('Apple', 'Connexion Apple disponible après publication sur les stores')}>
            <Text style={styles.socialIcon}>🍎</Text>
            <Text style={styles.socialText}>Apple</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Switch login/signup */}
      <TouchableOpacity style={styles.switchBtn} onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switchText}>
          {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <Text style={styles.switchLink}>{isLogin ? 'S\'inscrire' : 'Se connecter'}</Text>
        </Text>
      </TouchableOpacity>

      {/* Modal mot de passe oublié */}
      <Modal visible={resetModal} transparent animationType="slide" onRequestClose={() => setResetModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setResetModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Mot de passe oublié</Text>
            <Text style={styles.modalSub}>Entre ton email pour recevoir un lien de réinitialisation.</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="ton@email.com"
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
                autoFocus
              />
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleResetPassword} disabled={resetLoading}>
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
  container: { flex: 1, backgroundColor: 'white' },
  header: { backgroundColor: '#0a0a0a', paddingTop: 80, paddingBottom: 40, paddingHorizontal: 28, alignItems: 'center' },
  logo: { width: 72, height: 72, backgroundColor: '#1a6bff', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { color: 'white', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 6 },
  form: { padding: 28, flex: 1 },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, fontSize: 15, color: '#0a0a0a', borderWidth: 2, borderColor: 'transparent' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText: { color: '#1a6bff', fontSize: 13, fontWeight: '600' },
  btnPrimary: { backgroundColor: '#1a6bff', borderRadius: 50, padding: 18, alignItems: 'center', marginTop: 4 },
  btnPrimaryText: { color: 'white', fontSize: 16, fontWeight: '700' },
  separator: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: '#e8e8e8' },
  separatorText: { color: '#999', fontSize: 13 },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 2, borderColor: '#e8e8e8', backgroundColor: 'white' },
  socialIcon: { fontSize: 18, fontWeight: '700' },
  socialText: { fontSize: 14, fontWeight: '600', color: '#0a0a0a' },
  switchBtn: { padding: 20, alignItems: 'center' },
  switchText: { fontSize: 14, color: '#999' },
  switchLink: { color: '#1a6bff', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 44 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0a0a0a', marginBottom: 6 },
  modalSub: { fontSize: 14, color: '#999', marginBottom: 24 },
});