import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { AudioApi, PhotoApi } from "@/shared/media/FichierApi";
import { formatDate, fullName } from "@/shared/utils/format";
import { actionsPossibles, DEMANDE_SOURCES, DEMANDE_STATUTS, lignesBesoin, peutTransformer, type ActionDemande } from "../models/Demande";
import { useDemandeDetailViewModel } from "../viewmodels/useDemandeDetailViewModel";

/** Detail of a request: client, need, photos, voice notes, actions, quote made from it. */
export function DemandeDetailView({ id }: { id: number }) {
  const vm = useDemandeDetailViewModel(id);
  const { user } = useAuth();
  const router = useRouter();
  const d = vm.demande;

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
        <ErrorMessage message={vm.erreur ?? "Demande introuvable."} />
        <Pressable accessibilityRole="button" onPress={() => void vm.recharger()}>
          <Text style={styles.lien}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  const s = DEMANDE_STATUTS[d.statut];
  const photos = d.fichiers.filter((f) => f.type === "PHOTO");
  const audios = d.fichiers.filter((f) => f.type === "AUDIO");
  const besoin = lignesBesoin(d.besoinStructure);
  const transformable = peutTransformer(d.statut) && !!user && permissions.canConvertRequest(user.role);
  const occupe = vm.enCours !== null;

  const confirmer = (action: ActionDemande, label: string) => {
    if (action !== "perdre") {
      void vm.agir(action);
      return;
    }
    Alert.alert("Rejeter la demande ?", `${d.reference} passera « Rejetée ». Vous pourrez la rouvrir plus tard.`, [
      { text: "Annuler", style: "cancel" },
      { text: label, style: "destructive", onPress: () => void vm.agir(action) },
    ]);
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.contenu}>
      {/* Client */}
      <View style={styles.carte}>
        <View style={styles.ligneEntre}>
          <Text style={styles.reference}>{d.reference}</Text>
          <Text style={[styles.badge, { color: s.couleur, backgroundColor: s.fond }]}>{s.label}</Text>
        </View>
        <Text style={styles.client}>{fullName(d.client) || "Client"}</Text>
        <View style={styles.rangee}>
          {d.client.telephone ? (
            <Pressable accessibilityRole="button" onPress={() => void Linking.openURL(`tel:${d.client.telephone}`)} style={[styles.petitBouton, styles.outline]}>
              <Text style={styles.outlineTexte}>📞 {d.client.telephone}</Text>
            </Pressable>
          ) : null}
          {d.client.email ? (
            <Pressable accessibilityRole="button" onPress={() => void Linking.openURL(`mailto:${d.client.email}`)} style={[styles.petitBouton, styles.outline]}>
              <Text style={styles.outlineTexte}>✉ Email</Text>
            </Pressable>
          ) : null}
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/clients/[id]", params: { id: String(d.client.id) } })} style={[styles.petitBouton, styles.outline]}>
            <Text style={styles.outlineTexte}>Fiche client</Text>
          </Pressable>
        </View>
        <Text style={styles.muted}>
          {DEMANDE_SOURCES[d.source] ?? d.source} · reçue le {formatDate(d.createdAt)}
          {d.createur ? ` · par ${fullName(d.createur)}` : ""}
        </Text>
      </View>

      {/* Need */}
      <View style={styles.carte}>
        <Text style={styles.titre}>Besoin</Text>
        <Text style={styles.texte}>{d.description}</Text>
        {besoin.map((b) => (
          <Text key={b.cle} style={styles.texte}>
            <Text style={styles.cle}>{b.cle} : </Text>
            {b.valeur}
          </Text>
        ))}
      </View>

      {/* Photos and voice notes */}
      {photos.length || audios.length ? (
        <View style={styles.carte}>
          <Text style={styles.titre}>Photos et notes vocales</Text>
          {photos.length ? (
            <View style={styles.galerie}>
              {photos.map((p) => (
                <PhotoApi key={p.id} fichier={p.fichier} taille={100} />
              ))}
            </View>
          ) : null}
          {audios.map((a) => (
            <AudioApi key={a.id} fichier={a.fichier} dureeSecondes={a.dureeSecondes} />
          ))}
        </View>
      ) : null}

      {/* Quote made from it */}
      {d.devis.length ? (
        <View style={styles.carte}>
          <Text style={styles.titre}>Devis</Text>
          {d.devis.map((dv) => (
            <Pressable key={dv.id} accessibilityRole="button" onPress={() => router.push({ pathname: "/devis/[id]", params: { id: String(dv.id) } })} style={({ pressed }) => [styles.ligneDevis, pressed && styles.pressed]}>
              <Text style={styles.texte}>{dv.reference}</Text>
              <Text style={styles.lien}>Ouvrir ›</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {vm.erreur ? <ErrorMessage message={vm.erreur} /> : null}

      {/* Actions */}
      {transformable ? (
        <Pressable accessibilityRole="button" disabled={occupe} onPress={() => void vm.transformer()} style={[styles.bouton, styles.primaire, occupe && styles.dim]}>
          <Text style={styles.primaireTexte}>{vm.enCours === "transformer" ? "Création du devis…" : "Transformer en devis"}</Text>
        </Pressable>
      ) : null}
      {actionsPossibles(d.statut).map((a) => (
        <Pressable key={a.action} accessibilityRole="button" disabled={occupe} onPress={() => confirmer(a.action, a.label)} style={[styles.bouton, styles.outline, occupe && styles.dim]}>
          <Text style={[styles.outlineTexte, a.danger && styles.danger]}>{vm.enCours === a.action ? "…" : a.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
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
  client: { fontSize: 16, fontWeight: "600", color: colors.text.DEFAULT },
  badge: { fontSize: 12, fontWeight: "700", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: "hidden" },
  titre: { fontSize: 16, fontWeight: "700", color: colors.text.DEFAULT },
  texte: { color: colors.text.DEFAULT, lineHeight: 20 },
  cle: { fontWeight: "600" },
  muted: { color: colors.text.muted, fontSize: 13 },
  galerie: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  ligneDevis: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm },
  pressed: { opacity: 0.7 },
  lien: { color: colors.brand[700], fontWeight: "700" },
  bouton: { borderRadius: 10, padding: spacing.md, alignItems: "center", minHeight: 48, justifyContent: "center" },
  petitBouton: { borderRadius: 8, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  primaire: { backgroundColor: colors.brand[700] },
  primaireTexte: { color: colors.white, fontWeight: "700" },
  outline: { borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  outlineTexte: { color: colors.brand[700], fontWeight: "600" },
  danger: { color: colors.status.error },
  dim: { opacity: 0.5 },
});
