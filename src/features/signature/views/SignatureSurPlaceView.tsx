import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { SignaturePad } from "@/shared/components/SignaturePad";
import { formatEuros, formatUnite, fullName } from "@/shared/utils/format";
import { DEVIS_STATUT } from "@/features/devis/models/Devis";
import { useSignatureSurPlaceViewModel } from "../viewmodels/useSignatureSurPlaceViewModel";

/** « Signer sur place » : the client signs the quote on the advisor's phone. */
export function SignatureSurPlaceView({ id }: { id: number }) {
  const vm = useSignatureSurPlaceViewModel(id);
  const router = useRouter();
  const d = vm.devis;

  if (vm.loading) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
      </View>
    );
  }
  if (!d) {
    return (
      <View style={styles.centre}>
        <ErrorMessage message={vm.erreur ?? "Devis introuvable."} />
        <Pressable accessibilityRole="button" onPress={vm.recharger}>
          <Text style={styles.lien}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  // ── Success ──
  if (vm.signe) {
    const chantier = vm.signe.chantier;
    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.contenu}>
        <View style={[styles.carte, styles.succes]}>
          <Text style={styles.succesIcone}>✓</Text>
          <Text style={styles.succesTitre}>Devis {vm.signe.reference} signé</Text>
          <Text style={styles.texteCentre}>Signé par {vm.nomSignataire.trim()} le {new Date().toLocaleDateString("fr-FR")}.</Text>
        </View>
        <View style={styles.carte}>
          <Text style={styles.titreSection}>Ce qui a été créé</Text>
          <Text style={styles.puce}>- Chantier : {chantier ? chantier.reference : "en préparation par le bureau"}</Text>
          <Text style={styles.puce}>- Facture d’acompte : préparée automatiquement (selon les réglages de l’entreprise)</Text>
          <Text style={styles.puce}>- Commandes fournisseur : créées pour les matériaux du devis (s’il y en a)</Text>
        </View>
        {chantier ? (
          <Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: "/chantiers/[id]", params: { id: String(chantier.id) } })} style={[styles.bouton, styles.primaire]}>
            <Text style={styles.primaireTexte}>Voir le chantier</Text>
          </Pressable>
        ) : null}
        <Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: "/devis/[id]", params: { id: String(d.id) } })} style={[styles.bouton, styles.outline]}>
          <Text style={styles.outlineTexte}>Retour au devis</Text>
        </Pressable>
      </ScrollView>
    );
  }

  const statut = DEVIS_STATUT[d.statut];

  const confirmer = () =>
    Alert.alert("Valider la signature ?", `Le devis ${d.reference} passera « Signé ». Le chantier, l’acompte et les commandes seront créés.`, [
      { text: "Annuler", style: "cancel" },
      { text: "Valider", onPress: () => void vm.signer() },
    ]);

  return (
    <>
      <ScrollView style={styles.page} contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        {/* 1. Summary */}
        <View style={styles.carte}>
          <View style={styles.ligneEntre}>
            <Text style={styles.reference}>{d.reference}</Text>
            {statut ? <Text style={[styles.badge, { color: statut.couleur, backgroundColor: statut.fond }]}>{statut.label}</Text> : null}
          </View>
          <Text style={styles.client}>{fullName(d.client) || "Client"}</Text>
          {d.client.adresseChantier ? <Text style={styles.muted}>Chantier : {d.client.adresseChantier}</Text> : null}
        </View>

        {!vm.signable ? (
          <ErrorMessage message="Ce devis ne peut pas être signé sur place : il doit être envoyé, remis ou accepté." />
        ) : null}

        <View style={styles.carte}>
          <Text style={styles.titreSection}>Récapitulatif</Text>
          {d.lignes.map((l) => (
            <View key={l.id} style={styles.ligneDevis}>
              <View style={styles.flex}>
                <Text style={styles.ligneNom}>{l.description ?? "Prestation"}</Text>
                <Text style={styles.muted}>
                  {String(l.quantite).replace(".", ",")} {formatUnite(l.unite)}
                </Text>
              </View>
              <Text style={styles.ligneTotal}>{formatEuros(l.totalHT)}</Text>
            </View>
          ))}
          <View style={styles.ligneEntre}>
            <Text style={styles.muted}>Total HT</Text>
            <Text>{formatEuros(d.totalHT)}</Text>
          </View>
          <View style={styles.ligneEntre}>
            <Text style={styles.muted}>TVA ({String(d.tauxTVA ?? "—").replace(".", ",")} %)</Text>
            <Text>{formatEuros(d.totalTVA)}</Text>
          </View>
          <View style={styles.ligneEntre}>
            <Text style={styles.totalLabel}>Total TTC</Text>
            <Text style={styles.total}>{formatEuros(d.totalTTC)}</Text>
          </View>
          <Text style={styles.mention}>« Bon pour accord » — en signant, le client accepte ce devis et ses conditions.</Text>
        </View>

        {/* 2. Advisor */}
        <View style={styles.carte}>
          <Text style={styles.titreSection}>Signature du conseiller</Text>
          {vm.signatureConseiller ? (
            <Image source={{ uri: vm.signatureConseiller }} style={styles.apercu} resizeMode="contain" accessibilityLabel="Votre signature" />
          ) : (
            <Text style={styles.muted}>Pas encore de signature dans votre profil : signez une fois, elle sera gardée.</Text>
          )}
          <Pressable accessibilityRole="button" disabled={vm.enregistrementConseiller} onPress={() => vm.setPad("conseiller")} style={[styles.bouton, styles.outline, vm.enregistrementConseiller && styles.dim]}>
            <Text style={styles.outlineTexte}>{vm.enregistrementConseiller ? "Enregistrement…" : vm.signatureConseiller ? "Signer à nouveau" : "Signer"}</Text>
          </Pressable>
        </View>

        {/* 3. Client */}
        <View style={styles.carte}>
          <Text style={styles.titreSection}>Signature du client</Text>
          <Text style={styles.label}>Nom du signataire</Text>
          <TextInput value={vm.nomSignataire} onChangeText={vm.setNomSignataire} maxLength={150} placeholder="Prénom Nom" placeholderTextColor={colors.text.muted} style={styles.input} accessibilityLabel="Nom du signataire" />
          {vm.signatureClient ? <Image source={{ uri: vm.signatureClient }} style={styles.apercu} resizeMode="contain" accessibilityLabel="Signature du client" /> : null}
          <Pressable accessibilityRole="button" disabled={!vm.signable} onPress={() => vm.setPad("client")} style={[styles.bouton, styles.outline, !vm.signable && styles.dim]}>
            <Text style={styles.outlineTexte}>{vm.signatureClient ? "Recommencer la signature" : "Faire signer le client"}</Text>
          </Pressable>
          <Text style={styles.aide}>La position GPS est ajoutée si le téléphone l’autorise (preuve du lieu de signature).</Text>
        </View>

        {vm.erreur ? <ErrorMessage message={vm.erreur} /> : null}
        {vm.message ? <Text style={styles.info}>{vm.message}</Text> : null}

        <Pressable accessibilityRole="button" disabled={!vm.pret} onPress={confirmer} style={[styles.bouton, styles.primaire, !vm.pret && styles.dim]}>
          <Text style={styles.primaireTexte}>{vm.envoi ? "Signature en cours…" : "Valider la signature"}</Text>
        </Pressable>

        {vm.peutLienEmail ? (
          <Pressable accessibilityRole="button" disabled={vm.envoiEmail} onPress={() => void vm.envoyerLienEmail()} style={[styles.bouton, styles.outline, vm.envoiEmail && styles.dim]}>
            <Text style={styles.outlineTexte}>{vm.envoiEmail ? "Envoi…" : "Envoyer le lien de signature par email"}</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <SignaturePad
        visible={vm.pad === "conseiller"}
        titre="Votre signature"
        sousTitre="Elle sera gardée dans votre profil pour les prochains devis."
        onFermer={() => vm.setPad(null)}
        onValider={(png) => void vm.validerConseiller(png)}
        onErreur={vm.setErreur}
      />
      <SignaturePad
        visible={vm.pad === "client"}
        titre={`Signature de ${vm.nomSignataire.trim() || "client"}`}
        sousTitre={`Bon pour accord — devis ${d.reference}, ${formatEuros(d.totalTTC)} TTC`}
        onFermer={() => vm.setPad(null)}
        onValider={vm.validerClient}
        onErreur={vm.setErreur}
      />
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT },
  contenu: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: spacing.md },
  lien: { color: colors.brand[700], fontWeight: "600" },
  carte: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.lg, gap: spacing.sm },
  ligneEntre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  reference: { fontSize: 18, fontWeight: "700", color: colors.text.DEFAULT },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: "hidden", fontSize: 12, fontWeight: "600" },
  client: { fontSize: 16, fontWeight: "600", color: colors.text.DEFAULT },
  muted: { color: colors.text.muted, fontSize: 13 },
  titreSection: { fontSize: 16, fontWeight: "700", color: colors.text.DEFAULT },
  ligneDevis: { flexDirection: "row", gap: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border.DEFAULT },
  flex: { flex: 1 },
  ligneNom: { color: colors.text.DEFAULT, fontWeight: "500" },
  ligneTotal: { color: colors.text.DEFAULT, fontWeight: "600" },
  totalLabel: { fontWeight: "700", color: colors.text.DEFAULT },
  total: { fontWeight: "700", fontSize: 18, color: colors.brand[900] },
  mention: { marginTop: spacing.sm, fontStyle: "italic", color: colors.text.DEFAULT },
  apercu: { height: 120, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: 10 },
  label: { color: colors.text.muted, fontSize: 13 },
  input: { backgroundColor: colors.surface.DEFAULT, borderColor: colors.border.DEFAULT, borderRadius: 10, borderWidth: 1, color: colors.text.DEFAULT, padding: spacing.md },
  aide: { color: colors.text.muted, fontSize: 12 },
  info: { color: colors.status.success, fontWeight: "600" },
  bouton: { borderRadius: 10, padding: spacing.md, alignItems: "center" },
  primaire: { backgroundColor: colors.brand[700] },
  primaireTexte: { color: colors.white, fontWeight: "700" },
  outline: { borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  outlineTexte: { color: colors.brand[700], fontWeight: "600" },
  dim: { opacity: 0.5 },
  succes: { alignItems: "center", borderColor: colors.status.success },
  succesIcone: { fontSize: 40, color: colors.status.success, fontWeight: "700" },
  succesTitre: { fontSize: 20, fontWeight: "700", color: colors.text.DEFAULT, textAlign: "center" },
  texteCentre: { textAlign: "center", color: colors.text.muted },
  puce: { color: colors.text.DEFAULT, lineHeight: 20 },
});
