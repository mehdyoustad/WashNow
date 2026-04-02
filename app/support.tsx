import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../src/theme';

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: "Comment réserver un lavage ?",
    answer: "Appuyez sur l'onglet \"Réserver\" en bas de l'écran, choisissez votre service, votre adresse, un créneau horaire et confirmez le paiement. Votre laveur sera assigné automatiquement.",
  },
  {
    question: "Puis-je annuler ma réservation ?",
    answer: "Oui, vous pouvez annuler jusqu'à 2h avant le créneau sans frais. Au-delà, des frais d'annulation de 50% s'appliquent. Rendez-vous dans Historique > votre réservation > Annuler.",
  },
  {
    question: "Comment fonctionne le paiement ?",
    answer: "Le paiement est sécurisé via Stripe. Vous pouvez payer par carte bancaire, Apple Pay ou Google Pay. Votre carte n'est débitée qu'une fois la mission acceptée.",
  },
  {
    question: "Que faire si je ne suis pas satisfait ?",
    answer: "Nous prenons la qualité très au sérieux. Contactez-nous dans les 24h après votre lavage via ce formulaire ou en ouvrant un litige depuis votre historique. Nous remboursons ou refaisons le lavage.",
  },
  {
    question: "Comment fonctionne le programme fidélité ?",
    answer: "Vous gagnez 50 points par lavage. 1 000 points = 10€ de réduction sur votre prochaine réservation. Les points sont valables 12 mois. Retrouvez votre solde dans votre profil.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Oui. Vos données sont chiffrées et stockées sur Supabase (serveurs Europe). Nous ne vendons jamais vos données. Vous pouvez les exporter ou les supprimer à tout moment depuis les paramètres.",
  },
  {
    question: "Comment ajouter une méthode de paiement ?",
    answer: "Allez dans Profil > Paiement > Ajouter une carte. Vos informations bancaires sont gérées directement par Stripe, WashNow n'y a pas accès.",
  },
  {
    question: "Quels véhicules acceptez-vous ?",
    answer: "Nous acceptons tous les véhicules : citadines, berlines, SUV, coupés, breaks, monospaces et utilitaires. Ajoutez votre véhicule dans Profil > Mes véhicules avant de réserver.",
  },
];

const CONTACT_OPTIONS = [
  { icon: 'CH', label: 'Chat en direct', sublabel: 'Réponse en moins de 5 min', color: '#1558E7', onPress: () => {} },
  { icon: 'EM', label: 'Envoyer un email', sublabel: 'contact@washnow.fr', color: '#7C3AED', onPress: () => Linking.openURL('mailto:contact@washnow.fr') },
  { icon: 'TL', label: 'Appeler le support', sublabel: 'Lun-Ven 9h-18h', color: '#16A34A', onPress: () => Linking.openURL('tel:+33123456789') },
];

export default function Support() {
  const router = useRouter();
  const { colors } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Champs manquants', 'Veuillez remplir l\'objet et le message.');
      return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSubject('');
    setMessage('');
    Alert.alert('Message envoyé', 'Notre équipe vous répondra dans les 24h sur votre email.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aide & Support</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Bloc contact rapide */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Nous contacter</Text>
          {CONTACT_OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.contactCard, { backgroundColor: colors.card }]}
              onPress={opt.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIcon, { backgroundColor: opt.color + '18' }]}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: opt.color }}>{opt.icon}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: colors.text }]}>{opt.label}</Text>
                <Text style={[styles.contactSub, { color: colors.textSub }]}>{opt.sublabel}</Text>
              </View>
              <Text style={[styles.arrow, { color: opt.color }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Questions fréquentes</Text>
          <View style={[styles.faqCard, { backgroundColor: colors.card }]}>
            {FAQS.map((faq, i) => (
              <View key={i} style={[i > 0 && { borderTopWidth: 1, borderTopColor: colors.border ?? '#f0f0f0' }]}>
                <TouchableOpacity
                  style={styles.faqRow}
                  onPress={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.faqQuestion, { color: colors.text }]} numberOfLines={expandedIndex === i ? undefined : 2}>
                    {faq.question}
                  </Text>
                  <Text style={[styles.faqChevron, { color: '#1a6bff', transform: [{ rotate: expandedIndex === i ? '90deg' : '0deg' }] }]}>›</Text>
                </TouchableOpacity>
                {expandedIndex === i && (
                  <Text style={[styles.faqAnswer, { color: colors.textSub }]}>{faq.answer}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Formulaire contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSub }]}>Envoyer un message</Text>
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.fieldLabel, { color: colors.textSub }]}>Objet</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardAlt ?? '#f5f5f5', color: colors.text }]}
              placeholder="Ex: Problème avec ma réservation"
              placeholderTextColor="#aaa"
              value={subject}
              onChangeText={setSubject}
            />
            <Text style={[styles.fieldLabel, { color: colors.textSub }]}>Message</Text>
            <TextInput
              style={[styles.textarea, { backgroundColor: colors.cardAlt ?? '#f5f5f5', color: colors.text }]}
              placeholder="Décrivez votre problème en détail..."
              placeholderTextColor="#aaa"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
              onPress={sendMessage}
              disabled={sending}
            >
              <Text style={styles.sendBtnText}>{sending ? 'Envoi en cours...' : 'Envoyer le message'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSub }]}>WashNow SAS — 12 rue de la Paix, 75001 Paris</Text>
          <Text style={[styles.footerText, { color: colors.textSub }]}>SIRET : 123 456 789 00010</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#0a0a0a',
    gap: 12,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  backArrow: { fontSize: 30, color: 'white', lineHeight: 34 },
  headerTitle: { fontSize: 19, fontWeight: '700', color: 'white' },
  section: { padding: 20, paddingBottom: 0 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 2,
    color: '#999',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: 15, fontWeight: '600' },
  contactSub: { fontSize: 12, marginTop: 2 },
  arrow: { fontSize: 22, color: '#ccc' },
  faqCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  faqChevron: { fontSize: 22, color: '#1a6bff' },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
    color: '#666',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  formCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 8 },
  input: {
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    marginBottom: 16,
  },
  textarea: {
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    height: 110,
    marginBottom: 16,
  },
  sendBtn: {
    backgroundColor: '#1a6bff',
    borderRadius: 50,
    padding: 16,
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  footer: { padding: 20, alignItems: 'center', gap: 4 },
  footerText: { fontSize: 11, color: '#bbb', textAlign: 'center' },
});
