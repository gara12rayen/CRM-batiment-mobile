import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { formatEuros, formatUnite, lireNombre, nombreVersTexte } from "@/shared/utils/format";
import type { DevisLigne } from "../models/Devis";

type Props = {
  ligne: DevisLigne | null;
  enregistrement: boolean;
  onFermer: () => void;
  onEnregistrer: (quantite: number, prixUnitaireVente: number) => void;
  onSupprimer: () => void;
};

/** Quantity and unit price of a line (total recalculated by the API), or delete it. */
export function LigneEditModal({ ligne, enregistrement, onFermer, onEnregistrer, onSupprimer }: Props) {
  const [quantite, setQuantite] = useState("");
  const [prix, setPrix] = useState("");
  useEffect(() => {
    if (!ligne) return;
    setQuantite(nombreVersTexte(ligne.quantite));
    setPrix(nombreVersTexte(ligne.prixUnitaireVente));
  }, [ligne]);

  const q = lireNombre(quantite);
  const p = lireNombre(prix);
  const valide = q > 0 && p >= 0;

  return (
    <Modal visible={!!ligne} transparent animationType="slide" onRequestClose={onFermer}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title} numberOfLines={2}>
            {ligne?.description ?? "Prestation"}
          </Text>
          <Text style={styles.label}>Quantité ({ligne ? formatUnite(ligne.unite) : ""})</Text>
          <TextInput value={quantite} onChangeText={setQuantite} keyboardType="decimal-pad" style={styles.input} accessibilityLabel="Quantité" />
          <Text style={styles.label}>Prix unitaire HT (€)</Text>
          <TextInput value={prix} onChangeText={setPrix} keyboardType="decimal-pad" style={styles.input} accessibilityLabel="Prix unitaire HT" />
          {valide ? <Text style={styles.total}>Total HT : {formatEuros(Math.round(q * p * 100) / 100)}</Text> : <Text style={styles.erreur}>Quantité &gt; 0 et prix ≥ 0.</Text>}

          <Pressable accessibilityRole="button" disabled={!valide || enregistrement} onPress={() => onEnregistrer(q, p)} style={[styles.button, styles.primary, (!valide || enregistrement) && styles.dim]}>
            <Text style={styles.primaryText}>{enregistrement ? "Enregistrement…" : "Enregistrer"}</Text>
          </Pressable>
          <View style={styles.row}>
            <Pressable accessibilityRole="button" onPress={onSupprimer} disabled={enregistrement} style={[styles.button, styles.flex, styles.danger]}>
              <Text style={styles.primaryText}>Supprimer la ligne</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onFermer} style={[styles.button, styles.flex, styles.outline]}>
              <Text style={styles.outlineText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.45)" },
  sheet: { backgroundColor: colors.surface.DEFAULT, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing["2xl"] },
  title: { fontSize: 16, fontWeight: "700", color: colors.text.DEFAULT, marginBottom: spacing.sm },
  label: { fontSize: 13, color: colors.text.muted },
  input: { borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: 10, padding: spacing.md, fontSize: 16, color: colors.text.DEFAULT },
  total: { fontSize: 15, fontWeight: "700", color: colors.text.DEFAULT, marginVertical: spacing.xs },
  erreur: { fontSize: 13, color: colors.status.error },
  row: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
  button: { minHeight: 46, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md },
  primary: { backgroundColor: colors.brand[700] },
  danger: { backgroundColor: colors.status.error },
  outline: { borderWidth: 1, borderColor: colors.border.DEFAULT },
  dim: { opacity: 0.5 },
  primaryText: { color: colors.white, fontWeight: "700" },
  outlineText: { color: colors.text.DEFAULT, fontWeight: "600" },
});
