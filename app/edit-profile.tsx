import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../src/supabase';

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, email, phone, avatar_url')
      .eq('id', user.id)
      .single();
    if (data) {
      setForm({
        full_name: data.full_name ?? '',
        email: data.email ?? user.email ?? '',
        phone: data.phone ?? '',
      });
      setAvatarUri(data.avatar_url ?? null);
    } else {
      setForm(f => ({ ...f, email: user.email ?? '' }));
    }
    setLoading(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Autorise l\'accès à ta galerie pour changer ta photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      Alert.alert('Erreur', 'Le prénom est requis.');
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non connecté');

      let avatarUrl = avatarUri;

      // Upload avatar si c'est un fichier local (pas une URL distante)
      if (avatarUri && avatarUri.startsWith('file://')) {
        const ext = avatarUri.split('.').pop() ?? 'jpg';
        const fileName = `${user.id}/avatar.${ext}`;
        const formData = new FormData();
        formData.append('file', { uri: avatarUri, name: fileName, type: `image/${ext}` } as any);
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, formData, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
          avatarUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      Alert.alert('Profil mis à jour !', '', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a6bff" />
      </View>
    );
  }

  const initials = form.full_name ? form.full_name[0].toUpperCase() : '?';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrap} onPress={pickImage}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{initials}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Text style={{ fontSize: 14 }}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Appuie pour changer ta photo</Text>
        </View>

        {/* Champs */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>INFORMATIONS PERSONNELLES</Text>
          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldIcon}>👤</Text>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Prénom</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form.full_name}
                  onChangeText={v => setForm(f => ({ ...f, full_name: v }))}
                  placeholder="Ton prénom"
                  placeholderTextColor="#bbb"
                />
              </View>
            </View>

            <View style={[styles.fieldRow, styles.fieldBorder]}>
              <Text style={styles.fieldIcon}>✉️</Text>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form.email}
                  onChangeText={v => setForm(f => ({ ...f, email: v }))}
                  placeholder="ton@email.com"
                  placeholderTextColor="#bbb"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={[styles.fieldRow, styles.fieldBorder]}>
              <Text style={styles.fieldIcon}>📱</Text>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>Téléphone</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form.phone}
                  onChangeText={v => setForm(f => ({ ...f, phone: v }))}
                  placeholder="+33 6 00 00 00 00"
                  placeholderTextColor="#bbb"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.saveSection}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color="white" />
              : <Text style={styles.saveBtnText}>Enregistrer les modifications</Text>}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  scroll: { flex: 1 },
  avatarSection: { alignItems: 'center', paddingVertical: 32 },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: '#1a6bff' },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#1a6bff',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { fontSize: 38, color: 'white', fontWeight: '700' },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#f5f5f5',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  avatarHint: { marginTop: 10, fontSize: 13, color: '#999' },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  card: { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  fieldBorder: { borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  fieldIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 11, color: '#999', fontWeight: '600', marginBottom: 3 },
  fieldInput: { fontSize: 15, color: '#0a0a0a', fontWeight: '500', padding: 0 },
  saveSection: { paddingHorizontal: 20, marginTop: 8 },
  saveBtn: { backgroundColor: '#1a6bff', borderRadius: 50, padding: 18, alignItems: 'center' },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
