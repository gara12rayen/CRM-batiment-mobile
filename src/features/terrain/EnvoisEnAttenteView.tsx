import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { useFileEnvoi } from "@/core/offline/useFileEnvoi";
import type { EnvoiType } from "@/core/offline/fileEnvoi";

const TYPES: Record<EnvoiType, string> = {
  SAV: "Ticket SAV",
  PHOTOS_CHANTIER: "Photos de chantier",
  RAPPORT_CHANTIER: "Rapport de chantier",
  PROSPECT_TERRAIN: "Prospect terrain",
};

/** What is waiting for the network (or was refused by the server) on this phone. */
export function EnvoisEnAttenteView() {
  const f = useFileEnvoi();

  const retirer = (id: string) =>
    Alert.alert("Retirer cet envoi ?", "Il ne sera pas envoyé (les photos gardées pour lui sont effacées du téléphone).", [
      { text: "Annuler", style: "cancel" },
      { text: "Retirer", style: "destructive", onPress: () => void f.retirer(id) },
    ]);

  return (
    <FlatList
      style={styles.page}
      data={f.items}
      keyExtractor={(i) => i.id}
      contentContainerStyle={styles.liste}
      ListHeaderComponent={
        <View style={styles.entete}>
          <Text style={styles.intro}>Ces envois partent tout seuls dès que le réseau revient (au retour dans l’app, puis toutes les 45 secondes).</Text>
          {f.enAttente ? (
            <Pressable accessibilityRole="button" onPress={() => void f.rejouer()} style={styles.bouton}>
              <Text style={styles.boutonTexte}>Réessayer maintenant</Text>
            </Pressable>
          ) : null}
        </View>
      }
      ListEmptyComponent={<Text style={styles.vide}>Rien en attente : tout est envoyé.</Text>}
      renderItem={({ item: i }) => (
        <View style={[styles.carte, i.refus && styles.refus]}>
          <Text style={styles.type}>{TYPES[i.type]}</Text>
          <Text style={styles.libelle}>{i.libelle}</Text>
          <Text style={styles.muted}>
            Créé le {new Date(i.creeLe).toLocaleString("fr-FR")} · {i.fichiers.length} fichier(s) · {i.tentatives} essai(s)
          </Text>
          {i.refus ? <Text style={styles.erreur}>Refusé par le serveur : {i.refus}</Text> : <Text style={styles.attente}>⏳ En attente de réseau</Text>}
          <View style={styles.rangee}>
            {i.refus ? (
              <Pressable accessibilityRole="button" onPress={() => void f.reessayer(i.id)} hitSlop={6}>
                <Text style={styles.lien}>Réessayer</Text>
              </Pressable>
            ) : null}
            <Pressable accessibilityRole="button" onPress={() => retirer(i.id)} hitSlop={6}>
              <Text style={styles.supprimer}>Retirer</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT },
  liste: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing["3xl"] },
  entete: { gap: spacing.sm, marginBottom: spacing.sm },
  intro: { color: colors.text.muted },
  bouton: { backgroundColor: colors.brand[700], borderRadius: 12, minHeight: 48, alignItems: "center", justifyContent: "center" },
  boutonTexte: { color: colors.white, fontWeight: "700" },
  carte: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.md, gap: 4 },
  refus: { borderColor: colors.status.error, backgroundColor: "#FEF2F2" },
  type: { fontSize: 12, fontWeight: "700", color: colors.brand[700], textTransform: "uppercase" },
  libelle: { fontWeight: "600", color: colors.text.DEFAULT },
  muted: { color: colors.text.muted, fontSize: 12 },
  attente: { color: "#92400E", fontWeight: "600" },
  erreur: { color: colors.status.error, fontWeight: "600" },
  rangee: { flexDirection: "row", gap: spacing.lg, marginTop: 4 },
  lien: { color: colors.brand[700], fontWeight: "700" },
  supprimer: { color: colors.status.error, fontWeight: "700" },
  vide: { color: colors.text.muted, textAlign: "center", paddingVertical: spacing.xl },
});
