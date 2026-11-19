import { StyleSheet } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";

/** Shared look of the two catalogue detail screens (prestation, material). */
export const detailStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.DEFAULT },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.lg },
  card: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.lg, gap: spacing.sm },
  titre: { fontSize: 20, fontWeight: "800", color: colors.brand[900] },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text.DEFAULT },
  texte: { fontSize: 15, color: colors.text.DEFAULT, lineHeight: 21 },
  muted: { fontSize: 13, color: colors.text.muted },
  prix: { fontSize: 16, fontWeight: "800", color: colors.brand[700] },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, paddingVertical: 4 },
  ligne: { borderTopWidth: 1, borderTopColor: colors.border.DEFAULT, paddingTop: spacing.sm, gap: 2 },
  label: { fontSize: 14, color: colors.text.muted },
  valeur: { fontSize: 14, fontWeight: "600", color: colors.text.DEFAULT, flexShrink: 1, textAlign: "right" },
  badge: { alignSelf: "flex-start", fontSize: 12, fontWeight: "700", color: colors.status.warning, backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: "hidden" },
  link: { color: colors.brand[700], fontWeight: "700" },
});
