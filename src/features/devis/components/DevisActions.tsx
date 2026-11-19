import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import type { ActionDevis } from "../viewmodels/useDevisActionsViewModel";

type Bouton = { action: ActionDevis; label: string; aide?: string | null; style: "primary" | "outline" | "whatsapp" | "danger"; onPress: () => void };

type Props = {
  peutPdf: boolean;
  dispo: { envoyer: boolean; remettre: boolean; whatsapp: boolean; refuser: boolean; blocageEnvoi: string | null; blocageWhatsapp: string | null } | null;
  enCours: ActionDevis | null;
  onPdf: () => void;
  onEnvoyer: () => void;
  onRemettre: () => void;
  onWhatsapp: () => void;
  onRefuser: () => void;
};

/** « Actions » card of the quote detail: only the buttons allowed for the current status. */
export function DevisActions({ peutPdf, dispo, enCours, onPdf, onEnvoyer, onRemettre, onWhatsapp, onRefuser }: Props) {
  const boutons: Bouton[] = [];
  if (dispo?.envoyer) boutons.push({ action: "envoyer", label: "Envoyer par email", aide: dispo.blocageEnvoi, style: "primary", onPress: onEnvoyer });
  if (dispo?.remettre) boutons.push({ action: "remettre", label: "Remis au client (sans email)", style: "outline", onPress: onRemettre });
  if (dispo?.whatsapp) boutons.push({ action: "whatsapp", label: "Partager sur WhatsApp", aide: dispo.blocageWhatsapp, style: "whatsapp", onPress: onWhatsapp });
  if (peutPdf) boutons.push({ action: "pdf", label: "Voir le PDF", style: "outline", onPress: onPdf });
  if (dispo?.refuser) boutons.push({ action: "refuser", label: "Le client a refusé", style: "danger", onPress: onRefuser });

  if (!boutons.length) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Actions</Text>
      {boutons.map((b) => {
        const actif = enCours === b.action;
        return (
          <View key={b.action} style={styles.bloc}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !!enCours, busy: actif }}
              disabled={!!enCours}
              onPress={b.onPress}
              style={({ pressed }) => [styles.button, styles[b.style], pressed && styles.pressed, !!enCours && !actif && styles.dim]}
            >
              {actif ? <ActivityIndicator color={b.style === "outline" ? colors.brand[700] : colors.white} /> : null}
              <Text style={b.style === "outline" ? styles.outlineText : styles.primaryText}>{b.label}</Text>
            </Pressable>
            {b.aide ? <Text style={styles.aide}>{b.aide}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.lg, gap: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text.DEFAULT },
  bloc: { gap: 4 },
  button: { minHeight: 46, borderRadius: 12, flexDirection: "row", gap: spacing.sm, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md },
  primary: { backgroundColor: colors.brand[700] },
  outline: { borderWidth: 1, borderColor: colors.brand[500], backgroundColor: colors.surface.DEFAULT },
  whatsapp: { backgroundColor: "#1F9D55" },
  danger: { backgroundColor: colors.status.error },
  pressed: { opacity: 0.8 },
  dim: { opacity: 0.5 },
  primaryText: { color: colors.white, fontWeight: "700", fontSize: 15 },
  outlineText: { color: colors.brand[700], fontWeight: "700", fontSize: 15 },
  aide: { fontSize: 12, color: colors.status.warning },
});
