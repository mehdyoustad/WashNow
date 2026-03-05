import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Tab = 'cgu' | 'privacy';

const CGU_TEXT = `CONDITIONS GÉNÉRALES D'UTILISATION — WashNow

Dernière mise à jour : 1er mars 2025

1. OBJET
WashNow (ci-après "l'Application") est un service de mise en relation entre des particuliers souhaitant faire laver leur véhicule et des laveurs professionnels indépendants. Ces CGU régissent l'utilisation de l'Application.

2. ACCEPTATION
En créant un compte, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas, vous ne pouvez pas utiliser le service.

3. CRÉATION DE COMPTE
Vous devez fournir des informations exactes et à jour. Vous êtes responsable de la confidentialité de votre mot de passe. Tout usage frauduleux de votre compte doit être signalé immédiatement.

4. SERVICES ET PRIX
Les prix affichés incluent toutes taxes. WashNow se réserve le droit de modifier les tarifs à tout moment, les réservations déjà validées ne sont pas affectées.

5. ANNULATION ET REMBOURSEMENT
• Annulation ≥ 2h avant : remboursement intégral
• Annulation < 2h avant : frais de 50% du montant
• Annulation par le laveur : remboursement intégral automatique

6. RESPONSABILITÉS
WashNow agit en tant qu'intermédiaire. La responsabilité de WashNow est limitée au montant payé pour la prestation concernée. WashNow décline toute responsabilité pour les dommages indirects.

7. PROPRIÉTÉ INTELLECTUELLE
L'Application, son contenu et ses marques sont la propriété exclusive de WashNow SAS. Toute reproduction est interdite sans autorisation écrite.

8. MODIFICATION DES CGU
WashNow peut modifier ces CGU à tout moment. Vous serez notifié et devrez les accepter à nouveau.

9. DROIT APPLICABLE
Les présentes CGU sont soumises au droit français. Tout litige sera porté devant les tribunaux compétents de Paris.

10. CONTACT
WashNow SAS — contact@washnow.fr — 01 23 45 67 89`;

const PRIVACY_TEXT = `POLITIQUE DE CONFIDENTIALITÉ — WashNow

Dernière mise à jour : 1er mars 2025

1. RESPONSABLE DU TRAITEMENT
WashNow SAS, 12 rue de la Paix, 75001 Paris — DPO : dpo@washnow.fr

2. DONNÉES COLLECTÉES
• Données d'identité : prénom, nom, email, téléphone
• Données de paiement : traitées par Stripe (WashNow ne stocke pas vos coordonnées bancaires)
• Données de localisation : utilisées uniquement lors d'une session active
• Données d'utilisation : réservations, historique, préférences
• Photos de véhicules : uploadées lors des missions

3. FINALITÉS DU TRAITEMENT
• Exécution du contrat de service
• Gestion des paiements
• Amélioration de l'expérience utilisateur
• Notifications push (avec votre consentement)
• Conformité légale et fiscale

4. BASE LÉGALE
• Exécution contractuelle (art. 6.1.b RGPD)
• Intérêt légitime (amélioration du service)
• Consentement (notifications, cookies analytics)

5. PARTAGE DES DONNÉES
Vos données ne sont jamais vendues. Elles peuvent être partagées avec :
• Les laveurs (prénom, adresse de lavage, véhicule) pour exécuter la mission
• Stripe (paiements)
• Supabase (infrastructure cloud sécurisée)
• Autorités légales si requis

6. CONSERVATION
• Données de compte : durée de la relation contractuelle + 3 ans
• Données de paiement : 5 ans (obligation légale)
• Données supprimées sur demande sous 30 jours

7. VOS DROITS (RGPD)
Vous pouvez exercer vos droits d'accès, rectification, suppression, portabilité et opposition en contactant dpo@washnow.fr ou via l'application (Profil > Supprimer mon compte).

8. COOKIES ET ANALYTICS
L'application utilise des outils de mesure d'audience anonymisés pour améliorer le service. Vous pouvez vous y opposer dans les paramètres.

9. SÉCURITÉ
Vos données sont chiffrées en transit (HTTPS/TLS) et au repos. Nous réalisons des audits de sécurité réguliers.

10. TRANSFERTS HORS UE
Supabase utilise des serveurs en Europe (Frankfurt). Stripe est certifié PCI DSS niveau 1.`;

export default function Legal() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('cgu');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mentions légales</Text>
      </View>

      <View style={styles.tabBar}>
        {([['cgu', '📋 CGU'], ['privacy', '🔒 Confidentialité']] as [Tab, string][]).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, tab === key && styles.tabActive]}
            onPress={() => setTab(key)}
          >
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.body}>{tab === 'cgu' ? CGU_TEXT : PRIVACY_TEXT}</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#0a0a0a', flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, gap: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 32, color: 'white', lineHeight: 36 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: 'white' },
  tabBar: { flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e8e8e8' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#1a6bff' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#999' },
  tabTextActive: { color: '#1a6bff' },
  scroll: { flex: 1, padding: 20 },
  body: { fontSize: 13, lineHeight: 22, color: '#333', backgroundColor: 'white', borderRadius: 12, padding: 16 },
});
