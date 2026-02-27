import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../src/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Merci de remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert({ id: data.user.id, full_name: fullName });
          Alert.alert('Compte créé !', 'Vérifie ton email pour confirmer ton compte.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/home');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.body}>
        <Text style={styles.title}>{isSignUp ? 'Créer un compte 🚿' : 'Bienvenue 👋'}</Text>
        <Text style={styles.subtitle}>{isSignUp ? 'Rejoins WashNow dès maintenant' : 'Connectez-vous à votre compte'}</Text>

        {isSignUp && (
          <>
            <Text style={styles.label}>Prénom et nom</Text>
            <TextInput style={styles.input} placeholder="Thomas Martin" placeholderTextColor="#aaa" value={fullName} onChangeText={setFullName} />
          </>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="exemple@email.com" placeholderTextColor="#aaa" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#aaa" secureTextEntry value={password} onChangeText={setPassword} />

        <TouchableOpacity style={styles.btnPrimary} onPress={handleAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnPrimaryText}>{isSignUp ? 'Créer mon compte' : 'Se connecter'}</Text>}
        </TouchableOpacity>

        <Text style={styles.registerText}>
          {isSignUp ? 'Déjà un compte ? ' : "Pas encore de compte ? "}
          <Text style={styles.registerLink} onPress={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Se connecter' : "S'inscrire"}
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  body: { flex: 1, padding: 24, paddingTop: 80 },
  title: { fontSize: 30, fontWeight: '700', color: '#0a0a0a', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#999', marginTop: 6, marginBottom: 28 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 16, fontSize: 15, color: '#0a0a0a', borderWidth: 2, borderColor: '#e8e8e8' },
  btnPrimary: { backgroundColor: '#1a6bff', borderRadius: 50, padding: 18, alignItems: 'center', marginTop: 28 },
  btnPrimaryText: { color: 'white', fontSize: 16, fontWeight: '700' },
  registerText: { textAlign: 'center', marginTop: 20, color: '#999', fontSize: 14 },
  registerLink: { color: '#1a6bff', fontWeight: '700' },
});