import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Cache } from '../src/cache';
import { useTheme } from '../src/theme';

interface SettingRow {
  id: string;
  icon: string;
  label: string;
  sublabel?: string;
  type: 'toggle' | 'link' | 'destructive';
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
}

interface SettingSection {
  title: string;
  rows: SettingRow[];
}

export default function Settings() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();

  const [notifBookings, setNotifBookings] = useState(true);
  const [notifWasher, setNotifWasher] = useState(true);
  const [notifPromos, setNotifPromos] = useState(true);
  const [notifReminders, setNotifReminders] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [locationBg, setLocationBg] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  const clearCache = () => {
    Alert.alert(
      'Vider le cache',
      'Cela supprimera les données sauvegardées localement (photos, préférences mises en cache). Vos données Supabase ne seront pas affectées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider', style: 'destructive', onPress: async () => {
            await Cache.clear();
            Alert.alert('Cache vidé', 'Les données locales ont été supprimées.');
          }
        },
      ]
    );
  };

  const sections: SettingSection[] = [
    {
      title: 'Apparence',
      rows: [
        {
          id: 'dark_mode',
          icon: isDark ? '🌙' : '☀️',
          label: isDark ? 'Mode sombre' : 'Mode clair',
          sublabel: 'Changer le thème de l\'application',
          type: 'toggle',
          value: isDark,
          onToggle: toggleTheme,
        },
      ],
    },
    {
      title: 'Notifications push',
      rows: [
        {
          id: 'notif_bookings',
          icon: '📋',
          label: 'Réservations',
          sublabel: 'Confirmations, annulations, rappels',
          type: 'toggle',
          value: notifBookings,
          onToggle: setNotifBookings,
        },
        {
          id: 'notif_washer',
          icon: '🚗',
          label: 'Laveur en route',
          sublabel: 'Quand votre laveur approche',
          type: 'toggle',
          value: notifWasher,
          onToggle: setNotifWasher,
        },
        {
          id: 'notif_promos',
          icon: '🎁',
          label: 'Promotions',
          sublabel: 'Offres exclusives et codes promo',
          type: 'toggle',
          value: notifPromos,
          onToggle: setNotifPromos,
        },
        {
          id: 'notif_reminders',
          icon: '🔔',
          label: 'Rappels de lavage',
          sublabel: 'Quand votre voiture n\'a pas été lavée',
          type: 'toggle',
          value: notifReminders,
          onToggle: setNotifReminders,
        },
      ],
    },
    {
      title: 'Communications',
      rows: [
        {
          id: 'notif_email',
          icon: '📧',
          label: 'Emails récapitulatifs',
          sublabel: 'Factures et résumés de commandes',
          type: 'toggle',
          value: notifEmail,
          onToggle: setNotifEmail,
        },
      ],
    },
    {
      title: 'Confidentialité',
      rows: [
        {
          id: 'location_bg',
          icon: '📍',
          label: 'Localisation en arrière-plan',
          sublabel: 'Pour le suivi de votre laveur',
          type: 'toggle',
          value: locationBg,
          onToggle: setLocationBg,
        },
        {
          id: 'analytics',
          icon: '📊',
          label: 'Données analytiques',
          sublabel: 'Améliorer l\'expérience de l\'app',
          type: 'toggle',
          value: analytics,
          onToggle: setAnalytics,
        },
        {
          id: 'legal',
          icon: '📄',
          label: 'CGU & Politique de confidentialité',
          type: 'link',
          onPress: () => router.push('/legal' as any),
        },
      ],
    },
    {
      title: 'Données',
      rows: [
        {
          id: 'clear_cache',
          icon: '🗑️',
          label: 'Vider le cache local',
          sublabel: 'Libère de l\'espace sur votre appareil',
          type: 'link',
          onPress: clearCache,
        },
        {
          id: 'export_data',
          icon: '📤',
          label: 'Exporter mes données',
          sublabel: 'Recevoir une copie de vos données',
          type: 'link',
          onPress: () => Alert.alert('Export demandé', 'Vous recevrez un email avec vos données dans 24h.'),
        },
      ],
    },
    {
      title: 'À propos',
      rows: [
        {
          id: 'version',
          icon: 'ℹ️',
          label: 'Version de l\'application',
          sublabel: 'WashNow 1.0.0 (build 42)',
          type: 'link',
        },
        {
          id: 'rate',
          icon: '⭐',
          label: 'Noter l\'application',
          type: 'link',
          onPress: () => Alert.alert('Merci !', 'Vous allez être redirigé vers le store.'),
        },
        {
          id: 'support',
          icon: '💬',
          label: 'Support & Aide',
          type: 'link',
          onPress: () => router.push('/support' as any),
        },
      ],
    },
    {
      title: 'Compte',
      rows: [
        {
          id: 'delete_account',
          icon: '🗑️',
          label: 'Supprimer mon compte',
          type: 'destructive',
          onPress: () => router.push('/delete-account' as any),
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {sections.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSub }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
              {section.rows.map((row, ri) => (
                <View
                  key={row.id}
                  style={[
                    styles.row,
                    ri > 0 && [styles.rowBorder, { borderTopColor: colors.border ?? '#f0f0f0' }],
                  ]}
                >
                  <View style={[styles.rowIcon, { backgroundColor: colors.cardAlt ?? '#f5f5f5' }]}>
                    <Text style={{ fontSize: 18 }}>{row.icon}</Text>
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={[
                      styles.rowLabel,
                      { color: row.type === 'destructive' ? '#cc3333' : colors.text }
                    ]}>
                      {row.label}
                    </Text>
                    {row.sublabel && (
                      <Text style={[styles.rowSub, { color: colors.textSub }]}>{row.sublabel}</Text>
                    )}
                  </View>
                  {row.type === 'toggle' ? (
                    <Switch
                      value={row.value}
                      onValueChange={row.onToggle}
                      trackColor={{ false: '#e0e0e0', true: '#1a6bff' }}
                      thumbColor="white"
                    />
                  ) : (
                    <TouchableOpacity onPress={row.onPress} style={styles.rowArrowBtn} disabled={!row.onPress}>
                      {row.onPress && <Text style={[styles.rowArrow, { color: row.type === 'destructive' ? '#cc3333' : colors.textSub }]}>›</Text>}
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
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
  content: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
    color: '#999',
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowBorder: { borderTopWidth: 1 },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowSub: { fontSize: 12, marginTop: 2, color: '#999' },
  rowArrowBtn: { padding: 4 },
  rowArrow: { fontSize: 20, color: '#ccc' },
});
