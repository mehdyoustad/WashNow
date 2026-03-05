import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '../src/theme';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';
import { Cache, CACHE_KEYS } from '../src/cache';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const PAGE_SIZE = 4;

type Booking = {
  id: string;
  service: string;
  date: string;
  address: string;
  price: string;
  status: 'terminé' | 'annulé' | 'en cours' | 'confirmé' | 'en attente';
  washer: string;
  washerInitial: string;
  rating: number | null;
  recurring?: boolean;
  recurrenceType?: 'weekly' | 'biweekly' | 'monthly';
};

const MOCK_BOOKINGS: Booking[] = [
  {
    id: '-1',
    service: 'Lavage complet',
    date: 'Sam. 15 mars 2025, 10h00',
    address: '12 rue de Paris, Drancy',
    price: '35€',
    status: 'confirmé',
    washer: 'Karim B.',
    washerInitial: 'K',
    rating: null,
    recurring: true,
    recurrenceType: 'weekly',
  },
  {
    id: '0',
    service: 'Lavage premium',
    date: 'Sam. 8 mars 2025, 11h00',
    address: '12 rue de Paris, Drancy',
    price: '59€',
    status: 'confirmé',
    washer: 'Karim B.',
    washerInitial: 'K',
    rating: null,
  },
  {
    id: '1',
    service: 'Lavage complet',
    date: 'Dim. 2 mars 2025, 10h00',
    address: '12 rue de Paris, Drancy',
    price: '39€',
    status: 'terminé',
    washer: 'Karim B.',
    washerInitial: 'K',
    rating: null,
  },
  {
    id: '2',
    service: 'Lavage extérieur',
    date: 'Mar. 18 fév. 2025, 14h00',
    address: '12 rue de Paris, Drancy',
    price: '19€',
    status: 'terminé',
    washer: 'Youssef M.',
    washerInitial: 'Y',
    rating: 5,
  },
  {
    id: '3',
    service: 'Lavage premium',
    date: 'Sam. 8 fév. 2025, 09h30',
    address: '12 rue de Paris, Drancy',
    price: '59€',
    status: 'annulé',
    washer: 'Thomas L.',
    washerInitial: 'T',
    rating: null,
  },
  {
    id: '4',
    service: 'Lavage complet',
    date: 'Lun. 20 jan. 2025, 11h00',
    address: '12 rue de Paris, Drancy',
    price: '39€',
    status: 'terminé',
    washer: 'Karim B.',
    washerInitial: 'K',
    rating: 4,
  },
];

const STATUS_COLORS: Record<Booking['status'], { bg: string; text: string; label: string }> = {
  terminé: { bg: '#e8faf0', text: '#00c853', label: 'Terminé' },
  annulé: { bg: '#ffeaea', text: '#cc3333', label: 'Annulé' },
  'en cours': { bg: '#e8f0ff', text: '#1a6bff', label: 'En cours' },
  confirmé: { bg: '#fff8e6', text: '#cc8800', label: 'Confirmé' },
  'en attente': { bg: '#f5f5f5', text: '#999', label: 'En attente' },
};

export default function History() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isConnected } = useNetworkStatus();
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [page, setPage] = useState(1);
  const [fromCache, setFromCache] = useState(false);
  const [ratingModal, setRatingModal] = useState<{ visible: boolean; bookingId: string | null }>({
    visible: false,
    bookingId: null,
  });
  const [hoverRating, setHoverRating] = useState(0);

  // Cache : sauvegarder + charger
  useEffect(() => {
    Cache.set(CACHE_KEYS.HISTORY, MOCK_BOOKINGS);
  }, []);

  useEffect(() => {
    if (!isConnected) {
      Cache.get<Booking[]>(CACHE_KEYS.HISTORY).then(cached => {
        if (cached) { setBookings(cached); setFromCache(true); }
      });
    } else {
      setFromCache(false);
    }
  }, [isConnected]);

  // Pagination
  const visibleBookings = useMemo(() => bookings.slice(0, page * PAGE_SIZE), [bookings, page]);
  const hasMore = bookings.length > page * PAGE_SIZE;

  const loadMore = useCallback(() => setPage(p => p + 1), []);

  const openRatingModal = useCallback((id: string) => {
    setHoverRating(0);
    setRatingModal({ visible: true, bookingId: id });
  }, []);

  const cancelBooking = useCallback((booking: Booking) => {
    Alert.alert(
      'Annuler la réservation',
      `Annuler le ${booking.service} du ${booking.date} ?\n\nVous serez remboursé sous 3 à 5 jours ouvrés.`,
      [
        { text: 'Retour', style: 'cancel' },
        {
          text: 'Annuler la réservation',
          style: 'destructive',
          onPress: async () => {
            setBookings(prev =>
              prev.map(b => b.id === booking.id ? { ...b, status: 'annulé' } : b)
            );
            // TODO: await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id)
            Alert.alert(
              'Réservation annulée',
              `Remboursement de ${booking.price} en cours. Vous recevrez un email de confirmation.`
            );
          },
        },
      ]
    );
  }, []);

  const submitRating = useCallback((stars: number) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === ratingModal.bookingId ? { ...b, rating: stars } : b))
    );
    setRatingModal({ visible: false, bookingId: null });
    // TODO: await supabase.from('ratings').upsert({ booking_id: ratingModal.bookingId, stars })
  }, [ratingModal.bookingId]);

  const currentBooking = bookings.find((b) => b.id === ratingModal.bookingId);

  const downloadInvoice = async (booking: Booking) => {
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8"/>
        <style>
          body { font-family: Arial, sans-serif; color: #1a1a1a; padding: 40px; max-width: 600px; margin: 0 auto; }
          .logo { font-size: 28px; font-weight: 900; color: #1a6bff; margin-bottom: 4px; }
          .tagline { font-size: 13px; color: #888; margin-bottom: 40px; }
          h2 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
          .invoice-num { font-size: 13px; color: #888; margin-bottom: 32px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { text-align: left; font-size: 12px; color: #888; text-transform: uppercase; padding: 8px 0; border-bottom: 1px solid #eee; }
          td { padding: 12px 0; font-size: 14px; border-bottom: 1px solid #f5f5f5; }
          .total-row td { font-weight: 700; font-size: 16px; border-bottom: none; padding-top: 16px; }
          .total-row td:last-child { color: #1a6bff; }
          .footer { margin-top: 48px; font-size: 12px; color: #aaa; text-align: center; }
        </style>
      </head>
      <body>
        <div class="logo">🚿 WashNow</div>
        <div class="tagline">Le lavage auto à domicile</div>
        <h2>Facture</h2>
        <div class="invoice-num">N° WN-${booking.id.padStart(5, '0')} · ${booking.date}</div>
        <table>
          <tr><th>Description</th><th>Laveur</th><th>Total</th></tr>
          <tr><td>${booking.service}</td><td>${booking.washer}</td><td>${booking.price}</td></tr>
          <tr><td>TVA (20%)</td><td></td><td>${(parseFloat(booking.price) * 0.2).toFixed(2).replace('.', ',')}€</td></tr>
          <tr class="total-row"><td>Total TTC</td><td></td><td>${booking.price}</td></tr>
        </table>
        <table>
          <tr><th>Client</th><th>Adresse</th></tr>
          <tr><td>Mehdy</td><td>${booking.address}</td></tr>
        </table>
        <div class="footer">WashNow SAS · contact@washnow.app · washnow.app<br/>Merci de votre confiance !</div>
      </body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Télécharger la facture' });
      } else {
        Alert.alert('PDF généré', `Fichier disponible : ${uri}`);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de générer la facture.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes lavages</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={{ height: 8 }} />
        {fromCache && (
          <View style={styles.cacheBanner}>
            <Text style={styles.cacheBannerText}>📵 Données en cache — reconnectez-vous pour actualiser</Text>
          </View>
        )}
        {visibleBookings.map((booking) => {
          const status = STATUS_COLORS[booking.status];
          return (
            <View key={booking.id} style={[styles.card, { backgroundColor: colors.card }]}>
              {/* Top row */}
              <View style={styles.cardTop}>
                <View style={styles.washerAvatar}>
                  <Text style={styles.washerInitial}>{booking.washerInitial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceName}>{booking.service}</Text>
                  <Text style={styles.washerName}>{booking.washer}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                  </View>
                  {booking.recurring && (
                    <View style={styles.recurringBadge}>
                      <Text style={styles.recurringBadgeText}>🔄 Récurrent</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Details */}
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📅</Text>
                <Text style={[styles.detailText, { color: colors.textSub }]}>{booking.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📍</Text>
                <Text style={[styles.detailText, { color: colors.textSub }]}>{booking.address}</Text>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <Text style={styles.price}>{booking.price}</Text>
                <View style={styles.footerActions}>
                  {(booking.status === 'confirmé' || booking.status === 'en attente') && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelBooking(booking)}>
                      <Text style={styles.cancelBtnText}>Annuler</Text>
                    </TouchableOpacity>
                  )}
                  {booking.status === 'terminé' && (
                    <>
                      {booking.rating ? (
                        <View style={styles.ratingDisplay}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Text key={s} style={[styles.star, s <= booking.rating! && styles.starFilled]}>★</Text>
                          ))}
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.rateBtn} onPress={() => openRatingModal(booking.id)}>
                          <Text style={styles.rateBtnText}>Noter</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={styles.pdfBtn} onPress={() => downloadInvoice(booking)}>
                        <Text style={styles.pdfBtnText}>📄</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>
          );
        })}
        {hasMore && (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
            <Text style={styles.loadMoreText}>Charger plus ({bookings.length - page * PAGE_SIZE} restants)</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Rating modal */}
      <Modal
        visible={ratingModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setRatingModal({ visible: false, bookingId: null })}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRatingModal({ visible: false, bookingId: null })}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Noter votre laveur</Text>
            {currentBooking && (
              <Text style={styles.modalSub}>{currentBooking.washer} · {currentBooking.service}</Text>
            )}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setHoverRating(s)}>
                  <Text style={[styles.starLarge, s <= hoverRating && styles.starLargeFilled]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            {hoverRating > 0 && (
              <Text style={styles.ratingLabel}>
                {['', 'Décevant', 'Passable', 'Bien', 'Très bien', 'Excellent !'][hoverRating]}
              </Text>
            )}
            <TouchableOpacity
              style={[styles.submitBtn, hoverRating === 0 && { opacity: 0.4 }]}
              onPress={() => hoverRating > 0 && submitRating(hoverRating)}
              disabled={hoverRating === 0}
            >
              <Text style={styles.submitBtnText}>Envoyer ma note</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
  scroll: { flex: 1, paddingHorizontal: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    marginTop: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  washerAvatar: {
    width: 44,
    height: 44,
    backgroundColor: '#1a6bff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  washerInitial: { color: 'white', fontWeight: '700', fontSize: 18 },
  serviceName: { fontSize: 15, fontWeight: '700', color: '#0a0a0a' },
  washerName: { fontSize: 13, color: '#999', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  recurringBadge: { backgroundColor: '#e8f0ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  recurringBadgeText: { fontSize: 11, fontWeight: '700', color: '#1a6bff' },
  divider: { height: 1, backgroundColor: '#f5f5f5', marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  detailIcon: { fontSize: 14 },
  detailText: { fontSize: 13, color: '#666' }, // overridden by colors.textSub inline
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  price: { fontSize: 18, fontWeight: '800', color: '#0a0a0a' },
  footerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rateBtn: {
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rateBtnText: { color: '#1a6bff', fontWeight: '700', fontSize: 13 },
  pdfBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfBtnText: { fontSize: 16 },
  cancelBtn: {
    backgroundColor: '#fff0f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelBtnText: { color: '#cc3333', fontWeight: '700', fontSize: 13 },
  ratingDisplay: { flexDirection: 'row', gap: 2 },
  star: { fontSize: 18, color: '#e0e0e0' },
  starFilled: { color: '#FFB800' },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 44,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0a0a0a', marginBottom: 6 },
  modalSub: { fontSize: 14, color: '#999', marginBottom: 28 },
  starsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  starLarge: { fontSize: 44, color: '#e0e0e0' },
  starLargeFilled: { color: '#FFB800' },
  ratingLabel: { fontSize: 15, fontWeight: '600', color: '#0a0a0a', marginBottom: 28, height: 22 },
  submitBtn: {
    backgroundColor: '#1a6bff',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  cacheBanner: { backgroundColor: '#fff8e6', borderRadius: 10, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#ffe0a0' },
  cacheBannerText: { fontSize: 12, color: '#cc8800', textAlign: 'center', fontWeight: '600' },
  loadMoreBtn: { margin: 16, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#e0e0e0', alignItems: 'center' },
  loadMoreText: { fontSize: 14, fontWeight: '600', color: '#1a6bff' },
});
