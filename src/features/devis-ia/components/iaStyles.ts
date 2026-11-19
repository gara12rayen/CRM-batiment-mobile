import { StyleSheet } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";

/** Styles shared by the Devis IA screens (cards, buttons, inputs). */
export const ia = StyleSheet.create({
  carte: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.lg, gap: spacing.sm },
  titre: { fontSize: 16, fontWeight: "700", color: colors.text.DEFAULT },
  texte: { color: colors.text.DEFAULT, lineHeight: 20 },
  muted: { color: colors.text.muted, fontSize: 13 },
  aide: { color: colors.text.muted, fontSize: 12 },
  input: { backgroundColor: colors.surface.DEFAULT, borderColor: colors.border.DEFAULT, borderRadius: 10, borderWidth: 1, color: colors.text.DEFAULT, padding: spacing.md },
  zoneTexte: { minHeight: 140, textAlignVertical: "top" },
  ligneEntre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  rangee: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  bouton: { borderRadius: 10, padding: spacing.md, alignItems: "center", justifyContent: "center" },
  primaire: { backgroundColor: colors.brand[700] },
  primaireTexte: { color: colors.white, fontWeight: "700" },
  outline: { borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  outlineTexte: { color: colors.brand[700], fontWeight: "600" },
  flex1: { flex: 1 },
  dim: { opacity: 0.5 },
  pressed: { opacity: 0.7 },
  alerte: { backgroundColor: "#FEF3C7", borderRadius: 10, padding: spacing.md, gap: spacing.xs },
  alerteTexte: { color: "#92400E" },
  danger: { color: colors.status.error, fontWeight: "700" },
});
