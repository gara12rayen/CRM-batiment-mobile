import { useState } from "react";
import { useRouter, type Href } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { CHANTIER_STATUT } from "@/features/chantiers/models/Chantier";
import { creerBrouillonChef } from "@/features/devis-ia/services/brouillonChef.service";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { PlaceholderView } from "@/shared/components/PlaceholderView";
import { fullName } from "@/shared/utils/format";
import { appeler, itineraire } from "@/shared/utils/liens";
import { ModifierChantierModal } from "../components/ModifierChantierModal";
import { ACTIONS_STATUT, piecesDuPlan, type ActionStatut } from "../models/ChantierFiche";
import { useChantierFicheViewModel, versDateFr } from "../viewmodels/useChantierFicheViewModel";

/** Job site sheet: client, address, dates, team, documents, 2D plan, and the field actions. */
export function ChantierFicheView({ id }: { id: number }) {
  const vm = useChantierFicheViewModel(id);
  const { user } = useAuth();
  const router = useRouter();
  const [edition, setEdition] = useState(false);
  const [brouillon, setBrouillon] = useState(false);
  const f = vm.fiche;

  if (vm.loading) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
      </View>
    );
  }
  if (vm.refuse) {
    return <PlaceholderView title="Accès refusé" description="Ce chantier ne fait pas partie de vos chantiers." />;
  }
  if (!f || !user) {
    return (
      <View style={styles.centre}>
        <ErrorMessage message={vm.erreur ?? "Chantier introuvable."} />
        <Pressable accessibilityRole="button" onPress={() => void vm.recharger()}>
          <Text style={styles.lien}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  const s = CHANTIER_STATUT[f.statut];
  const ferme = f.statut === "CLOTURE" || f.statut === "ANNULE";
  const pieces = piecesDuPlan(f.plan2d);
  const role = user.role;
  const chef = role === "CHEF_CHANTIER";
  const p = { chantierId: String(f.id) };

  const liens: { label: string; detail: string; href: Href; visible: boolean }[] = [
    { label: "Tâches", detail: `${f.taches.length} tâche(s)`, href: { pathname: "/chantiers/taches", params: p }, visible: !vm.sousTraitant },
    { label: "Photos et rapports", detail: "Avant / après, rapports du jour", href: { pathname: "/chantiers/photos", params: p }, visible: permissions.canReadPhotosChantier(role) },
    { label: "Livraisons", detail: "Bon de livraison, écarts", href: { pathname: "/chantiers/livraisons", params: p }, visible: !vm.sousTraitant && permissions.canReceiveDelivery(role) },
    { label: "Facture fournisseur", detail: "Photographier une facture", href: { pathname: "/depenses/nouvelle", params: p }, visible: permissions.canSendSupplierInvoice(role) && !ferme },
    { label: "Ticket SAV", detail: "Signaler un problème après travaux", href: { pathname: "/sav/nouveau", params: p }, visible: permissions.canCreateSav(role) && (f.statut === "TERMINE" || f.statut === "CLOTURE") },
  ];

  const changer = (a: ActionStatut) => {
    if (!a.confirmer) {
      void vm.changerStatut(a.action);
      return;
    }
    Alert.alert(a.label, a.confirmer, [
      { text: "Annuler", style: "cancel" },
      { text: "Confirmer", onPress: () => void vm.changerStatut(a.action) },
    ]);
  };

  async function preparerDevis() {
    if (!f?.client.id) return;
    setBrouillon(true);
    try {
      const d = await creerBrouillonChef({ clientId: f.client.id });
      router.push({ pathname: "/devis/ia", params: { id: String(d.id) } });
    } catch (e) {
      Alert.alert("Brouillon impossible", getErrorMessage(e));
    } finally {
      setBrouillon(false);
    }
  }

  return (
    <>
      <ScrollView style={styles.page} contentContainerStyle={styles.contenu}>
        {/* Head */}
        <View style={styles.carte}>
          <View style={styles.ligneEntre}>
            <Text style={styles.reference}>{f.reference}</Text>
            {s ? <Text style={[styles.badge, { color: s.couleur, backgroundColor: s.fond }]}>{s.label}</Text> : null}
          </View>
          <View style={styles.avancement}>
            <View style={styles.barre}>
              <View style={[styles.barreRemplie, { width: `${Math.min(100, Math.max(0, f.avancement))}%` }]} />
            </View>
            <Text style={styles.pourcent}>{Math.round(f.avancement)} %</Text>
          </View>
          {f.description ? <Text style={styles.texte}>{f.description}</Text> : null}
        </View>

        {/* Client and place */}
        <View style={styles.carte}>
          <Text style={styles.titre}>Client</Text>
          <Text style={styles.nom}>{fullName(f.client) || f.client.nom}</Text>
          <Text style={styles.texte}>{f.adresse}</Text>
          <View style={styles.rangee}>
            {f.client.telephone ? (
              <Pressable accessibilityRole="button" onPress={() => appeler(f.client.telephone!)} style={[styles.petit, styles.outline]}>
                <Text style={styles.outlineTexte}>📞 Appeler</Text>
              </Pressable>
            ) : null}
            <Pressable accessibilityRole="button" onPress={() => itineraire(f.adresse)} style={[styles.petit, styles.outline]}>
              <Text style={styles.outlineTexte}>🧭 Itinéraire</Text>
            </Pressable>
          </View>
        </View>

        {/* Dates and team */}
        <View style={styles.carte}>
          <View style={styles.ligneEntre}>
            <Text style={styles.titre}>Dates et équipe</Text>
            {vm.peutModifier && !ferme ? (
              <Pressable accessibilityRole="button" onPress={() => setEdition(true)} hitSlop={8}>
                <Text style={styles.lien}>Modifier</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.texte}>
            Du {versDateFr(f.dateDebut) || "—"} au {versDateFr(f.dateFin) || "—"}
          </Text>
          {f.chefChantier ? (
            <View style={styles.ligneEntre}>
              <Text style={styles.texte}>Chef : {fullName(f.chefChantier)}</Text>
              {f.chefChantier.telephone && !chef ? (
                <Pressable accessibilityRole="button" onPress={() => appeler(f.chefChantier!.telephone!)} hitSlop={8}>
                  <Text style={styles.lien}>Appeler</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {f.notes ? <Text style={styles.muted}>Notes : {f.notes}</Text> : null}
        </View>

        {/* Status */}
        {vm.peutModifier && ACTIONS_STATUT[f.statut]?.length ? (
          <View style={styles.rangee}>
            {ACTIONS_STATUT[f.statut]!.map((a) => (
              <Pressable key={a.action} accessibilityRole="button" disabled={vm.action !== null} onPress={() => changer(a)} style={[styles.bouton, a.action === "suspendre" ? styles.outline : styles.primaire, vm.action !== null && styles.dim]}>
                <Text style={a.action === "suspendre" ? styles.outlineTexte : styles.primaireTexte}>{vm.action === a.action ? "…" : a.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {vm.erreur ? <ErrorMessage message={vm.erreur} /> : null}

        {/* Field actions */}
        <View style={styles.carte}>
          {liens
            .filter((l) => l.visible)
            .map((l) => (
              <Pressable key={l.label} accessibilityRole="button" onPress={() => router.push(l.href)} style={({ pressed }) => [styles.lienLigne, pressed && styles.pressed]}>
                <View style={styles.flex}>
                  <Text style={styles.nom}>{l.label}</Text>
                  <Text style={styles.muted}>{l.detail}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          {chef && permissions.canCreateChefDraft(role) && !ferme ? (
            <Pressable accessibilityRole="button" disabled={brouillon} onPress={() => void preparerDevis()} style={({ pressed }) => [styles.lienLigne, (pressed || brouillon) && styles.pressed]}>
              <View style={styles.flex}>
                <Text style={styles.nom}>Préparer un devis</Text>
                <Text style={styles.muted}>Travaux en plus demandés par le client (Devis IA)</Text>
              </View>
              {brouillon ? <ActivityIndicator /> : <Text style={styles.chevron}>›</Text>}
            </Pressable>
          ) : null}
        </View>

        {/* Documents */}
        <View style={styles.carte}>
          <Text style={styles.titre}>Documents</Text>
          {!f.documents.length ? <Text style={styles.muted}>Aucun document.</Text> : null}
          {f.documents.map((d) => (
            <Pressable key={d.id} accessibilityRole="button" disabled={vm.ouverture !== null} onPress={() => void vm.ouvrirDocument(d)} style={({ pressed }) => [styles.lienLigne, pressed && styles.pressed]}>
              <View style={styles.flex}>
                <Text style={styles.nom}>{d.nom}</Text>
                <Text style={styles.muted}>{d.type}</Text>
              </View>
              {vm.ouverture === d.id ? <ActivityIndicator /> : <Text style={styles.lien}>Ouvrir</Text>}
            </Pressable>
          ))}
        </View>

        {/* 2D plan, read only */}
        {f.plan2d ? (
          <View style={styles.carte}>
            <Text style={styles.titre}>Plan 2D</Text>
            {pieces.length ? (
              pieces.map((pc, i) => (
                <View key={`${pc.nom}-${i}`} style={styles.ligneEntre}>
                  <Text style={styles.texte}>{pc.nom}</Text>
                  {pc.detail ? <Text style={styles.muted}>{pc.detail}</Text> : null}
                </View>
              ))
            ) : (
              <Text style={styles.muted}>Plan disponible : consultez-le en grand sur le site web.</Text>
            )}
          </View>
        ) : null}
      </ScrollView>

      <ModifierChantierModal
        visible={edition}
        dateDebut={f.dateDebut}
        dateFin={f.dateFin}
        notes={f.notes ?? null}
        enCours={vm.action === "modifier"}
        onFermer={() => setEdition(false)}
        onEnregistrer={vm.enregistrer}
      />
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT },
  contenu: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: spacing.md },
  carte: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.lg, gap: spacing.sm },
  ligneEntre: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  rangee: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  reference: { fontSize: 18, fontWeight: "700", color: colors.text.DEFAULT },
  badge: { fontSize: 12, fontWeight: "700", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: "hidden" },
  avancement: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  barre: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.surface.muted, overflow: "hidden" },
  barreRemplie: { height: 8, borderRadius: 4, backgroundColor: colors.brand[500] },
  pourcent: { width: 48, textAlign: "right", fontWeight: "700", color: colors.text.DEFAULT },
  titre: { fontSize: 16, fontWeight: "700", color: colors.text.DEFAULT },
  nom: { fontSize: 15, fontWeight: "600", color: colors.text.DEFAULT },
  texte: { color: colors.text.DEFAULT, lineHeight: 20 },
  muted: { color: colors.text.muted, fontSize: 13 },
  lien: { color: colors.brand[700], fontWeight: "700" },
  lienLigne: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.md, minHeight: 56, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border.DEFAULT },
  chevron: { fontSize: 22, color: colors.text.muted },
  flex: { flex: 1 },
  pressed: { opacity: 0.6 },
  petit: { borderRadius: 8, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 44, justifyContent: "center" },
  bouton: { flexGrow: 1, borderRadius: 10, padding: spacing.md, alignItems: "center", minHeight: 48, justifyContent: "center" },
  primaire: { backgroundColor: colors.brand[700] },
  primaireTexte: { color: colors.white, fontWeight: "700" },
  outline: { borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  outlineTexte: { color: colors.brand[700], fontWeight: "600" },
  dim: { opacity: 0.5 },
});
