import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../src/supabase';
import { useTheme } from '../src/theme';

type Message = {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

const MOCK_BOOKING_ID = 'booking-001';

export default function Chat() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const bookingId = params.bookingId ?? MOCK_BOOKING_ID;

  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Récupérer l'utilisateur connecté + charger les messages existants
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));

    supabase
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Message[]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
      });

    // Supabase Realtime — écoute les nouveaux messages en temps réel
    const channel = supabase
      .channel(`chat:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [bookingId]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setInput('');

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      booking_id: bookingId,
      sender_id: userId ?? '',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      await supabase.from('messages').insert({
        booking_id: bookingId,
        sender_id: userId,
        content,
      });
    } catch {
      // Le message optimiste reste affiché — pas de rollback en démo
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = userId !== null && item.sender_id === userId;
    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>
        {!isMe && (
          <View style={styles.avatar}>
            <Text style={{ fontSize: 14 }}>K</Text>
          </View>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : [styles.bubbleThem, { backgroundColor: colors.card }]]}>
          <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : { color: colors.text }]}>
            {item.content}
          </Text>
          <Text style={[styles.bubbleTime, isMe ? { color: 'rgba(255,255,255,0.6)' } : { color: colors.textSub }]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.washerAvatar}><Text style={{ color: 'white', fontWeight: '700' }}>K</Text></View>
          <View>
            <Text style={styles.headerName}>Karim B.</Text>
            <Text style={styles.headerStatus}>● En ligne</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
      />

      {/* Saisie */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.inputField, { backgroundColor: colors.inputBg, color: colors.text }]}
            value={input}
            onChangeText={setInput}
            placeholder="Envoyer un message..."
            placeholderTextColor={colors.textSub}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, { opacity: input.trim() ? 1 : 0.4 }]}
            onPress={sendMessage}
            disabled={!input.trim() || sending}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 32, color: 'white', lineHeight: 36 },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  washerAvatar: { width: 36, height: 36, backgroundColor: '#1a6bff', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerName: { fontSize: 15, fontWeight: '700', color: 'white' },
  headerStatus: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  messagesList: { padding: 16, gap: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 3 },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowThem: { justifyContent: 'flex-start' },
  avatar: { width: 28, height: 28, backgroundColor: '#e0e0e0', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  bubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: '#1a6bff', borderBottomRightRadius: 4 },
  bubbleThem: { borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTextMe: { color: 'white' },
  bubbleTime: { fontSize: 11, marginTop: 4, textAlign: 'right' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, paddingBottom: 28, borderTopWidth: 1 },
  inputField: { flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, backgroundColor: '#1a6bff', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendIcon: { color: 'white', fontSize: 16, marginLeft: 2 },
});
