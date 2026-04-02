import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../src/supabase';
import { useTheme } from '../src/theme';

type PhotoType = 'before' | 'after';

type PhotoState = {
  before: string | null;
  after: string | null;
};

// Mock photos pour la démo
const MOCK_PHOTOS: PhotoState = {
  before: null,
  after: null,
};

export default function Photos() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ bookingId?: string; mode?: string }>();
  const bookingId = params.bookingId ?? 'booking-001';
  // mode='view' → lecture seule (historique), mode='edit' → prise de photos (tracking)
  const isViewMode = params.mode === 'view';

  const [photos, setPhotos] = useState<PhotoState>(MOCK_PHOTOS);
  const [uploading, setUploading] = useState<PhotoType | null>(null);

  const pickAndUpload = async (type: PhotoType) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      const { status: libStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libStatus !== 'granted') {
        Alert.alert('Permission requise', 'Autorise l\'accès à la caméra ou la galerie.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    setUploading(type);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const ext = uri.split('.').pop() ?? 'jpg';
      const path = `${bookingId}/${type}_${Date.now()}.${ext}`;

      const formData = new FormData();
      formData.append('file', { uri, name: path, type: `image/${ext}` } as any);

      const { error } = await supabase.storage
        .from('wash-photos')
        .upload(path, formData, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('wash-photos').getPublicUrl(path);

      // Sauvegarder l'URL en base
      await supabase.from('booking_photos').upsert({
        booking_id: bookingId,
        type,
        url: urlData.publicUrl,
        uploaded_by: user?.id,
      });

      setPhotos((prev) => ({ ...prev, [type]: uri }));
      Alert.alert('Photo enregistrée !', `Photo ${type === 'before' ? 'avant' : 'après'} enregistrée avec succès.`);
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setUploading(null);
    }
  };

  const PhotoSlot = ({ type, label }: { type: PhotoType; label: string }) => {
    const uri = photos[type];
    const isLoading = uploading === type;

    return (
      <View style={styles.slotWrap}>
        <Text style={[styles.slotLabel, { color: colors.textSub }]}>{label}</Text>
        {uri ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
            {!isViewMode && (
              <TouchableOpacity style={styles.retakeBtn} onPress={() => pickAndUpload(type)}>
                <Text style={styles.retakeBtnText}>Reprendre</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.emptySlot, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => !isViewMode && pickAndUpload(type)}
            disabled={isViewMode || isLoading}
          >
            {isLoading ? (
              <View style={styles.emptyIconBox}><Text style={styles.emptyIconText}>...</Text></View>
            ) : isViewMode ? (
              <>
                <View style={styles.emptyIconBox}><Text style={styles.emptyIconText}>PH</Text></View>
                <Text style={[styles.emptyText, { color: colors.textSub }]}>Pas encore de photo</Text>
              </>
            ) : (
              <>
                <View style={styles.emptyIconBox}><Text style={styles.emptyIconText}>PH</Text></View>
                <Text style={[styles.emptyText, { color: colors.textSub }]}>Prendre une photo</Text>
                <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Appuie pour ouvrir la caméra</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photos avant / après</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <View style={styles.infoIconBox}><Text style={styles.infoIconText}>{isViewMode ? 'GL' : 'PH'}</Text></View>
          <Text style={[styles.infoText, { color: colors.text }]}>
            {isViewMode
              ? 'Photos prises lors de cette prestation'
              : 'Prenez une photo avant de commencer et une autre à la fin de la prestation.'}
          </Text>
        </View>

        <View style={styles.photosGrid}>
          <PhotoSlot type="before" label="AVANT" />
          <PhotoSlot type="after" label="APRÈS" />
        </View>

        {!isViewMode && photos.before && photos.after && (
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Photos enregistrées</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 12, margin: 20, padding: 16, backgroundColor: '#e8f0ff', borderRadius: 14 },
  infoIcon: { fontSize: 24 },
  infoIconBox: { width: 36, height: 36, backgroundColor: '#EFF6FF', borderRadius: 9, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  infoIconText: { fontSize: 9, fontWeight: '800', color: '#1558E7' },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  photosGrid: { flexDirection: 'row', gap: 14, paddingHorizontal: 20 },
  slotWrap: { flex: 1 },
  slotLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  photoContainer: { position: 'relative' },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 16 },
  retakeBtn: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  retakeBtnText: { color: 'white', fontSize: 12, fontWeight: '600' },
  emptySlot: {
    aspectRatio: 4 / 3, borderRadius: 16, borderWidth: 2,
    borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  emptyIcon: { fontSize: 28 },
  emptyIconBox: { width: 56, height: 56, backgroundColor: '#F3F4F6', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  emptyIconText: { fontSize: 12, fontWeight: '800', color: '#9CA3AF' },
  emptyText: { fontSize: 13, fontWeight: '600' },
  emptyHint: { fontSize: 11 },
  doneBtn: { backgroundColor: '#00c853', borderRadius: 50, padding: 18, alignItems: 'center', margin: 20 },
  doneBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
