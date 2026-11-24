import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { CHANTIER_STATUT } from "@/features/chantiers/models/Chantier";
import { listChantiersSousTraitant, type ChantierSousTraitantItem } from "../services/chantierFiche.service";

/** Portal of the sous-traitant: the job sites opened to him → read-only sheet (no price). */
export function ChantiersSousTraitantListe() {
  const router = useRouter();
  const [items, setItems] = useState<ChantierSousTraitantItem[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      listChantiersSousTraitant()
        .then(setItems)
        .catch((e) => setErreur(getErrorMessage(e, "Impossible de charger vos chantiers.")));
    }, []),
  );

  return (
    <View style={styles.bloc}>
      <Text style={styles.titre}>Mes chantiers</Text>
      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
      {!items && !erreur ? <ActivityIndicator /> : null}
      {items && !items.length ? <Text style={styles.muted}>Aucun chantier ouvert à votre compte.</Text> : null}
      {items?.map((c) => {
        const s = CHANTIER_STATUT[c.statut];
        return (
          <Pressable key={c.id} accessibilityRole="button" onPress={() => router.push({ pathname: "/chantiers/[id]", params: { id: String(c.id) } })} style={({ pressed }) => [styles.ligne, pressed && styles.pressed]}>
            <View style={styles.entre}>
              <Text style={styles.nom}>{c.reference}</Text>
              {s ? <Text style={[styles.badge, { color: s.couleur, backgroundColor: s.fond }]}>{s.label}</Text> : null}
            </View>
            <Text style={styles.muted}>
              {c.client.nom} · {c.adresse}
            </Text>
            <Text style={styles.muted}>
              Avancement {Math.round(c.avancement)} % · {c.mesTaches} tâche(s) pour vous
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { marginTop: spacing.lg, gap: spacing.sm, alignSelf: "stretch" },
  titre: { fontSize: 16, fontWeight: "700", color: colors.text.DEFAULT },
  ligne: { backgroundColor: colors.surface.DEFAULT, borderRadius: 12, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.md, gap: 4 },
  pressed: { opacity: 0.7 },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  nom: { fontWeight: "700", color: colors.text.DEFAULT },
  muted: { color: colors.text.muted, fontSize: 13 },
  erreur: { color: colors.status.error },
  badge: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: "hidden" },
});
