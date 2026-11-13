import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { formatDate, fullName } from "@/shared/utils/format";
import { intervenantsDe, TACHE_STATUT, type Tache, type TacheStatut } from "../models/Tache";

/** Action rapide proposée selon le statut (le reste se fait dans la fiche de la tâche). */
function actionRapide(statut: TacheStatut): { label: string; statut: TacheStatut } | null {
  if (statut === "A_FAIRE") return { label: "Commencer", statut: "EN_COURS" };
  if (statut === "EN_COURS" || statut === "BLOQUEE") return { label: "Terminer", statut: "TERMINEE" };
  return null;
}

export function TacheCard({
  tache,
  enRetard,
  peutModifier,
  enCours,
  onPress,
  onStatut,
}: {
  tache: Tache;
  enRetard: boolean;
  peutModifier: boolean;
  enCours: boolean;
  onPress: () => void;
  onStatut: (statut: TacheStatut) => void;
}) {
  const s = TACHE_STATUT[tache.statut];
  const intervenants = intervenantsDe(tache);
  const faits = tache.checklist.filter((c) => c.fait).length;
  const action = peutModifier ? actionRapide(tache.statut) : null;

  return (
    // Carte = View ; la zone qui ouvre la fiche et le bouton d'action sont deux Pressable côte à côte
    // (un bouton dans un bouton est interdit sur le web : « <button> cannot contain a nested <button> »)
    <View style={[styles.card, enRetard && styles.cardRetard]}>
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.zone, pressed && styles.pressed]}>
        <View style={styles.rowBetween}>
          <Text style={[styles.titre, styles.flex]}>{tache.libelle}</Text>
          <Text style={[styles.badge, { color: s.couleur, backgroundColor: s.fond }]}>{s.label}</Text>
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.barre} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: tache.avancement }}>
            <View style={[styles.barreRemplie, tache.statut === "TERMINEE" && styles.barreFinie, { width: `${tache.avancement}%` }]} />
          </View>
          <Text style={styles.pourcent}>{tache.avancement} %</Text>
        </View>

        {tache.dateDebut || tache.dateFin ? (
          <Text style={[styles.muted, enRetard && styles.retard]}>
            {formatDate(tache.dateDebut)} → {formatDate(tache.dateFin)}
            {enRetard ? " · en retard" : ""}
          </Text>
        ) : null}
        {intervenants.length ? <Text style={styles.muted}>Intervenants : {intervenants.map((i) => fullName(i)).join(", ")}</Text> : <Text style={styles.muted}>Personne n’est affecté</Text>}
        {tache.checklist.length ? (
          <Text style={styles.muted}>
            Checklist : {faits}/{tache.checklist.length}
          </Text>
        ) : null}
      </Pressable>

      {action ? (
        <Pressable accessibilityRole="button" disabled={enCours} onPress={() => onStatut(action.statut)} style={({ pressed }) => [styles.action, (pressed || enCours) && styles.pressed]}>
          {enCours ? <ActivityIndicator color={colors.brand[700]} /> : <Text style={styles.actionTexte}>{action.label}</Text>}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.md, gap: 6 },
  cardRetard: { borderColor: colors.status.error },
  zone: { gap: 6 },
  pressed: { opacity: 0.75 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  flex: { flex: 1 },
  titre: { fontSize: 15, fontWeight: "700", color: colors.text.DEFAULT },
  badge: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: "hidden" },
  barre: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surface.muted, overflow: "hidden" },
  barreRemplie: { height: 6, borderRadius: 3, backgroundColor: colors.brand[500] },
  barreFinie: { backgroundColor: colors.status.success },
  pourcent: { width: 44, textAlign: "right", fontSize: 13, fontWeight: "600", color: colors.text.DEFAULT },
  muted: { fontSize: 13, color: colors.text.muted },
  retard: { color: colors.status.error, fontWeight: "600" },
  action: { alignSelf: "flex-start", minHeight: 36, minWidth: 110, borderRadius: 10, borderWidth: 1, borderColor: colors.brand[500], paddingHorizontal: spacing.md, alignItems: "center", justifyContent: "center", marginTop: 2 },
  actionTexte: { color: colors.brand[700], fontWeight: "700" },
});
