import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { useFileEnvoi } from "@/core/offline/useFileEnvoi";
import { DEMANDE_STATUTS } from "@/features/demandes/models/Demande";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { formatDate, fullName } from "@/shared/utils/format";
import type { ProspectTerrain } from "../models/ProspectTerrain";
import { listProspectsTerrain } from "../services/prospectsTerrain.service";

/** Prospects I sent from the field and where they are (no amount). */
export function MesProspectsView() {
  const router = useRouter();
  const file = useFileEnvoi();
  const [items, setItems] = useState<ProspectTerrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const enAttente = file.items.filter((i) => i.type === "PROSPECT_TERRAIN").length;

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      setItems((await listProspectsTerrain()).data);
    } catch (e) {
      setErreur(getErrorMessage(e, "Impossible de charger vos prospects."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void charger();
    }, [charger]),
  );

  return (
    <View style={styles.page}>
      <FlatList
        data={items}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={styles.liste}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void charger(); }} />}
        ListHeaderComponent={
          <View style={styles.entete}>
            <Pressable accessibilityRole="button" onPress={() => router.push("/prospects-terrain/nouveau")} style={styles.nouveau}>
              <Text style={styles.nouveauTexte}>+ Nouveau prospect</Text>
            </Pressable>
            {enAttente ? (
              <Pressable accessibilityRole="button" onPress={() => router.push("/envois")} style={styles.attente}>
                <Text style={styles.attenteTexte}>⏳ {enAttente} prospect(s) en attente de réseau — voir</Text>
              </Pressable>
            ) : null}
            {erreur ? <ErrorMessage message={erreur} /> : null}
            {loading ? <ActivityIndicator style={styles.chargement} /> : null}
          </View>
        }
        ListEmptyComponent={!loading && !erreur ? <Text style={styles.vide}>Aucun prospect envoyé pour l’instant.</Text> : null}
        renderItem={({ item: p }) => {
          const s = DEMANDE_STATUTS[p.statut];
          return (
            <View style={styles.carte}>
              <View style={styles.entre}>
                <Text style={styles.nom}>{fullName(p.client) || p.client.nom}</Text>
                {s ? <Text style={[styles.badge, { color: s.couleur, backgroundColor: s.fond }]}>{s.label}</Text> : null}
              </View>
              <Text style={styles.texte} numberOfLines={2}>
                {p.description}
              </Text>
              <Text style={styles.muted}>
                {p.reference} · envoyé le {formatDate(p.createdAt)} · {p._count.fichiers} pièce(s) jointe(s)
              </Text>
              {p.devis.length ? <Text style={styles.devis}>Devis préparé : {p.devis[0].reference}</Text> : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT },
  liste: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing["3xl"] },
  entete: { gap: spacing.sm, marginBottom: spacing.sm },
  nouveau: { backgroundColor: colors.brand[700], borderRadius: 12, minHeight: 52, alignItems: "center", justifyContent: "center" },
  nouveauTexte: { color: colors.white, fontWeight: "700", fontSize: 15 },
  attente: { backgroundColor: "#FEF3C7", borderRadius: 10, padding: spacing.md },
  attenteTexte: { color: "#92400E", fontWeight: "600" },
  chargement: { marginTop: spacing.lg },
  carte: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.md, gap: 4 },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  nom: { flex: 1, fontWeight: "700", color: colors.text.DEFAULT },
  badge: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: "hidden" },
  texte: { color: colors.text.DEFAULT, fontSize: 13 },
  muted: { color: colors.text.muted, fontSize: 12 },
  devis: { color: colors.status.success, fontWeight: "600", fontSize: 13 },
  vide: { color: colors.text.muted, textAlign: "center", paddingVertical: spacing.xl },
});
