import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { useFileEnvoi } from "@/core/offline/useFileEnvoi";

/** Daily actions of the chef de chantier, one tap from the home screen. */
const ACTIONS: { label: string; icone: string; href: Href }[] = [
  { label: "Préparer un devis", icone: "✦", href: "/devis/brouillon-chef" },
  { label: "Nouveau prospect", icone: "＋", href: "/prospects-terrain/nouveau" },
  { label: "Ticket SAV", icone: "⚑", href: "/sav/nouveau" },
  { label: "Facture fournisseur", icone: "🧾", href: "/depenses/nouvelle" },
  { label: "Mes prospects", icone: "☰", href: "/prospects-terrain" },
];

export function ActionsRapidesChef() {
  const router = useRouter();
  const file = useFileEnvoi();
  const attente = file.enAttente + file.refuses;
  return (
    <View style={styles.rangee}>
      {attente ? (
        <Pressable accessibilityRole="button" onPress={() => router.push("/envois")} style={styles.alerte}>
          <Text style={styles.alerteTexte}>
            ⏳ {file.enAttente} envoi(s) en attente de réseau{file.refuses ? ` · ${file.refuses} refusé(s)` : ""} — voir
          </Text>
        </Pressable>
      ) : null}
      {ACTIONS.map((a) => (
        <Pressable key={a.label} accessibilityRole="button" onPress={() => router.push(a.href)} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <Text style={styles.icone}>{a.icone}</Text>
          <Text style={styles.label}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rangee: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  action: { flexGrow: 1, flexBasis: "30%", minHeight: 72, backgroundColor: colors.brand[700], borderRadius: 14, padding: spacing.md, justifyContent: "center", gap: 4 },
  pressed: { opacity: 0.8 },
  icone: { color: colors.white, fontSize: 18 },
  label: { color: colors.white, fontWeight: "700", fontSize: 14 },
  alerte: { flexBasis: "100%", backgroundColor: "#FEF3C7", borderRadius: 10, padding: spacing.md },
  alerteTexte: { color: "#92400E", fontWeight: "600" },
});
