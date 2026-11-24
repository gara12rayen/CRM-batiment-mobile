import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { choisirPhotos, prendrePhoto } from "@/shared/media/media.service";
import { formatEuros } from "@/shared/utils/format";
import { CHAMPS_FACTURE, LIBELLES_CHAMPS } from "../models/Depense";
import { useNouvelleDepenseViewModel } from "../viewmodels/useNouvelleDepenseViewModel";

/** Supplier invoice: photo → reading by the AI → check → expense to validate by the office. */
export function NouvelleDepenseView({ chantierId, commandeId }: { chantierId?: number; commandeId?: number }) {
  const vm = useNouvelleDepenseViewModel({ chantierId, commandeId });
  const router = useRouter();

  const photographier = async (source: "camera" | "galerie") => {
    try {
      const p = source === "camera" ? await prendrePhoto() : (await choisirPhotos(1))[0] ?? null;
      if (p) await vm.lire(p);
    } catch (e) {
      Alert.alert("Photo", getErrorMessage(e));
    }
  };

  if (vm.fini) {
    return (
      <View style={styles.centre}>
        <Text style={styles.succesIcone}>✓</Text>
        <Text style={styles.succes}>Facture envoyée : le bureau la vérifie et la valide.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={[styles.bouton, styles.primaire, styles.large]}>
          <Text style={styles.primaireTexte}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  const ecart = vm.ht !== null && vm.tva !== null && vm.ttc !== null && !vm.coherent;

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        <View style={styles.carte}>
          <Text style={styles.titre}>1. Photo de la facture</Text>
          {vm.photo ? <Image source={{ uri: vm.photo.uri }} style={styles.photo} resizeMode="cover" accessibilityLabel="Facture" /> : null}
          {vm.lecture ? (
            <View style={styles.lecture}>
              <ActivityIndicator color={colors.brand[700]} />
              <Text style={styles.muted}>Lecture de la facture par l’IA…</Text>
            </View>
          ) : (
            <View style={styles.rangee}>
              <Pressable accessibilityRole="button" onPress={() => void photographier("camera")} style={[styles.bouton, styles.outline, styles.flex]}>
                <Text style={styles.outlineTexte}>📷 {vm.photo ? "Reprendre" : "Photographier"}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => void photographier("galerie")} style={[styles.bouton, styles.outline, styles.flex]}>
                <Text style={styles.outlineTexte}>🖼 Galerie</Text>
              </Pressable>
            </View>
          )}
          {vm.info ? (
            <View style={styles.alerte}>
              <Text style={styles.alerteTexte}>{vm.info}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.carte}>
          <Text style={styles.titre}>2. Valeurs de la facture</Text>
          {CHAMPS_FACTURE.map((c) => {
            const surligne = vm.douteux.has(c) && !vm.modifies.has(c);
            return (
              <View key={c} style={styles.champ}>
                <Text style={styles.label}>
                  {LIBELLES_CHAMPS[c]}
                  {surligne ? "  · à vérifier" : ""}
                </Text>
                <TextInput
                  value={vm.valeurs[c]}
                  onChangeText={(v) => vm.modifier(c, v)}
                  keyboardType={c.startsWith("montant") ? "decimal-pad" : c === "dateFacture" ? "numbers-and-punctuation" : "default"}
                  style={[styles.input, surligne && styles.surligne]}
                  accessibilityLabel={LIBELLES_CHAMPS[c]}
                />
              </View>
            );
          })}
          {ecart ? <Text style={styles.erreur}>HT + TVA = {formatEuros((vm.ht ?? 0) + (vm.tva ?? 0))}, différent du TTC : corrigez un montant.</Text> : null}
          <Text style={styles.aide}>Les montants servent au bureau : ils ne sont pas réaffichés ensuite pour le chef de chantier.</Text>
        </View>

        {vm.erreur ? <ErrorMessage message={vm.erreur} /> : null}
        {!vm.photo ? <Text style={styles.aide}>La photo de la facture est obligatoire.</Text> : null}
        <Pressable accessibilityRole="button" disabled={!vm.pret} onPress={() => void vm.envoyer()} style={[styles.bouton, styles.primaire, !vm.pret && styles.dim]}>
          <Text style={styles.primaireTexte}>{vm.envoi ? "Envoi…" : "Envoyer au bureau"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT },
  contenu: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background.DEFAULT },
  carte: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.lg, gap: spacing.sm },
  titre: { fontSize: 15, fontWeight: "700", color: colors.text.DEFAULT },
  rangee: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
  photo: { width: "100%", height: 180, borderRadius: 10, backgroundColor: colors.surface.muted },
  lecture: { flexDirection: "row", gap: spacing.sm, alignItems: "center", paddingVertical: spacing.md },
  muted: { color: colors.text.muted, fontSize: 12 },
  aide: { color: colors.text.muted, fontSize: 12 },
  champ: { gap: 4 },
  label: { color: colors.text.muted, fontSize: 13 },
  input: { backgroundColor: colors.background.DEFAULT, borderColor: colors.border.DEFAULT, borderWidth: 1, borderRadius: 10, padding: spacing.md, color: colors.text.DEFAULT },
  surligne: { backgroundColor: "#FEF3C7", borderColor: colors.status.warning },
  erreur: { color: colors.status.error, fontWeight: "600" },
  alerte: { backgroundColor: "#FEF3C7", borderRadius: 10, padding: spacing.md },
  alerteTexte: { color: "#92400E" },
  bouton: { borderRadius: 12, minHeight: 52, alignItems: "center", justifyContent: "center", padding: spacing.sm },
  large: { alignSelf: "stretch" },
  primaire: { backgroundColor: colors.brand[700] },
  primaireTexte: { color: colors.white, fontWeight: "700", fontSize: 15 },
  outline: { borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  outlineTexte: { color: colors.brand[700], fontWeight: "600" },
  dim: { opacity: 0.5 },
  succesIcone: { fontSize: 44, color: colors.status.success, fontWeight: "700" },
  succes: { textAlign: "center", color: colors.text.DEFAULT, fontSize: 16 },
});
