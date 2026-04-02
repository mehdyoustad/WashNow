import { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';

type Message = { id: string; from: 'user' | 'bot'; text: string };

const FAQ: Array<{ triggers: string[]; answer: string }> = [
  {
    triggers: ['où est', 'laveur', 'position', 'localiser', 'gps', 'où'],
    answer: "Votre laveur Karim B. est actuellement en route ! Il sera chez vous dans environ 8 minutes. Rendez-vous sur l'écran Suivi pour voir sa position en temps réel.",
  },
  {
    triggers: ['annuler', 'annulation', 'cancel'],
    answer: "Pour annuler votre réservation, rendez-vous dans Historique › sélectionnez le lavage › puis appuyez sur « Annuler ». Un remboursement sera effectué sous 3 à 5 jours ouvrés si l'annulation est faite plus de 2h avant.",
  },
  {
    triggers: ['service', 'choisir', 'recommande', 'quel', 'différence', 'offre'],
    answer: "Voici nos recommandations :\n• Extérieur (19€) — rapide, idéal si l'intérieur est propre\n• Complet (39€) — intérieur + extérieur, le plus demandé\n• Premium (59€) — traitement carrosserie + lustrage, parfait pour les occasions\n\nPour un SUV, le Complet est généralement le meilleur rapport qualité/prix.",
  },
  {
    triggers: ['prix', 'tarif', 'coût', 'combien'],
    answer: "Nos tarifs :\n• Extérieur : 19€\n• Complet : 39€\n• Premium : 59€\n• Abonnement mensuel : dès 49€/mois (-20%)\n\nDéplacement toujours gratuit !",
  },
  {
    triggers: ['paiement', 'payer', 'carte', 'stripe'],
    answer: "Nous acceptons les cartes bancaires (Visa, Mastercard), Apple Pay et Google Pay. Votre paiement est sécurisé via Stripe. Vous pouvez gérer vos cartes dans Profil › Paiement.",
  },
  {
    triggers: ['points', 'fidélité', 'récompense', 'loyalty'],
    answer: "Vous cumulez des points à chaque lavage :\n• 1 point = 1€ dépensé\n• 500 pts → -5€\n• 1000 pts → -10€\n• 1500 pts → Lavage offert\n\nRetrouvez votre solde dans Profil › Programme fidélité.",
  },
  {
    triggers: ['heure', 'disponible', 'créneau', 'horaire', 'rdv'],
    answer: "Nos laveurs sont disponibles de 8h à 18h, 7j/7. Les créneaux sont affichés directement dans l'étape 3 de la réservation. Pour une intervention urgente, une option +1h est disponible avec un supplément de 15€.",
  },
  {
    triggers: ['météo', 'pluie', 'mauvais temps'],
    answer: "En cas de pluie, le lavage extérieur est déconseillé. Nous vous recommandons le service intérieur uniquement (nettoyage complet de l'habitacle). Vous pouvez reporter votre RDV sans frais jusqu'à 2h avant.",
  },
  {
    triggers: ['parrainage', 'code', 'ami', 'réduction', 'parrain'],
    answer: "Parrainez vos amis et gagnez 10€ pour chaque inscription ! Votre code de parrainage est disponible dans Profil › Parrainer un ami. Votre ami bénéficie aussi de 5€ offerts.",
  },
];

const FALLBACK = "Je n'ai pas bien compris votre question. Voici ce que je peux vous aider :\n• Localiser votre laveur\n• Annuler une réservation\n• Choisir un service\n• Tarifs et paiement\n• Points fidélité\n\nOu appelez-nous au 01 23 45 67 89";

function getBotAnswer(input: string): string {
  const lower = input.toLowerCase();
  for (const faq of FAQ) {
    if (faq.triggers.some(t => lower.includes(t))) return faq.answer;
  }
  return FALLBACK;
}

export default function HelpButton() {
  const { colors, isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', from: 'bot', text: "Bonjour ! Je suis l'assistant WashNow. Comment puis-je vous aider ?" },
  ]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.88, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now().toString(), from: 'user', text };
    const botMsg: Message = { id: (Date.now() + 1).toString(), from: 'bot', text: getBotAnswer(text) };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const QUICK = ['Où est mon laveur ?', 'Quel service choisir ?', 'Je veux annuler'];

  return (
    <>
      {/* Bouton flottant */}
      <Animated.View style={[styles.fab, { transform: [{ scale }] }]}>
        <TouchableOpacity
          style={styles.fabInner}
          onPress={() => setOpen(true)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1}
        >
          <Text style={styles.fabIcon}>?</Text>
          <Text style={styles.fabLabel}>Aide</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal chatbot */}
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.sheet, { backgroundColor: colors.card }]}>
            {/* Header */}
            <View style={[styles.chatHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.botAvatar}><Text style={{ fontSize: 14, fontWeight: '800', color: '#1558E7' }}>AI</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.chatTitle, { color: colors.text }]}>Assistant WashNow</Text>
                <Text style={styles.chatOnline}>● En ligne</Text>
              </View>
              <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
                <Text style={[styles.closeText, { color: colors.textSub }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={m => m.id}
              style={styles.messageList}
              contentContainerStyle={{ padding: 16, gap: 10 }}
              renderItem={({ item }) => (
                <View style={[
                  styles.bubble,
                  item.from === 'user' ? styles.bubbleUser : [styles.bubbleBot, { backgroundColor: colors.cardAlt }],
                ]}>
                  <Text style={[styles.bubbleText, item.from === 'user' ? { color: 'white' } : { color: colors.text }]}>
                    {item.text}
                  </Text>
                </View>
              )}
            />

            {/* Quick replies */}
            <View style={[styles.quickRow, { borderTopColor: colors.border }]}>
              {QUICK.map(q => (
                <TouchableOpacity key={q} style={[styles.quickChip, { backgroundColor: colors.cardAlt }]}
                  onPress={() => { setInput(q); }}>
                  <Text style={[styles.quickText, { color: colors.text }]} numberOfLines={1}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Input */}
            <View style={[styles.inputRow, { backgroundColor: colors.inputBg, borderTopColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={input}
                onChangeText={setInput}
                placeholder="Posez votre question..."
                placeholderTextColor={colors.textSub}
                onSubmitEditing={send}
                returnKeyType="send"
              />
              <TouchableOpacity style={[styles.sendBtn, !input.trim() && { opacity: 0.4 }]} onPress={send} disabled={!input.trim()}>
                <Text style={styles.sendIcon}>➤</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', bottom: 100, right: 20, zIndex: 999 },
  fabInner: { backgroundColor: '#1a6bff', borderRadius: 28, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 6, shadowColor: '#1a6bff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  fabIcon: { fontSize: 18 },
  fabLabel: { color: 'white', fontSize: 13, fontWeight: '700' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderBottomWidth: 1 },
  botAvatar: { width: 40, height: 40, backgroundColor: '#e8f0ff', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  chatTitle: { fontSize: 15, fontWeight: '700' },
  chatOnline: { fontSize: 11, color: '#00c853', fontWeight: '600', marginTop: 2 },
  closeBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  closeText: { fontSize: 18 },
  messageList: { flexGrow: 0, maxHeight: 360 },
  bubble: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  bubbleUser: { backgroundColor: '#1a6bff', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleBot: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  quickRow: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1, flexWrap: 'wrap' },
  quickChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50 },
  quickText: { fontSize: 12, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, paddingBottom: 30, borderTopWidth: 1 },
  input: { flex: 1, fontSize: 15, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: 'transparent' },
  sendBtn: { backgroundColor: '#1a6bff', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendIcon: { color: 'white', fontSize: 16 },
});
