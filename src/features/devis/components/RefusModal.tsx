import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";

const MAX = 1000;

type Props = {
  visible: boolean;
  enCours: boolean;
  onFermer: () => void;
  onConfirmer: (motif: string) => void;
};

/** « Le client a refusé » : the reason is required (same rule as the API). */
export function RefusModal({ visible, enCours, onFermer, onConfirmer }: Props) {
  const [motif, setMotif] = useState("");
  useEffect(() => {
    if (visible) setMotif("");
  }, [visible]);

  const valide = motif.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onFermer}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Le client a refusé le devis</Text>
          <Text style={styles.label}>Motif du refus (obligatoire)</Text>
          <TextInput
            value={motif}
            onChangeText={setMotif}
            maxLength={MAX}
            multiline
            placeholder="Ex. budget trop élevé, a choisi un autre artisan…"
            placeholderTextColor={colors.text.muted}
            style={styles.input}
            accessibilityLabel="Motif du refus"
          />
          <Text style={styles.compteur}>
            {motif.length}/{MAX}
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={!valide || enCours}
            onPress={() => onConfirmer(motif)}
            style={[styles.button, styles.danger, (!valide || enCours) && styles.dim]}
          >
            <Text style={styles.primaryText}>{enCours ? "Enregistrement…" : "Marquer comme refusé"}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={enCours} onPress={onFermer} style={[styles.button, styles.outline]}>
            <Text style={styles.outlineText}>Annuler</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.45)" },
  sheet: { backgroundColor: colors.surface.DEFAULT, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing["2xl"] },
  title: { fontSize: 16, fontWeight: "700", color: colors.text.DEFAULT, marginBottom: spacing.xs },
  label: { fontSize: 13, color: colors.text.muted },
  input: { minHeight: 96, borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: 10, padding: spacing.md, fontSize: 15, color: colors.text.DEFAULT, textAlignVertical: "top" },
  compteur: { fontSize: 12, color: colors.text.muted, textAlign: "right" },
  button: { minHeight: 46, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md },
  danger: { backgroundColor: colors.status.error },
  outline: { borderWidth: 1, borderColor: colors.border.DEFAULT },
  dim: { opacity: 0.5 },
  primaryText: { color: colors.white, fontWeight: "700" },
  outlineText: { color: colors.text.DEFAULT, fontWeight: "600" },
});
