import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { useFileEnvoi } from "@/core/offline/useFileEnvoi";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { formatDate } from "@/shared/utils/format";
import { SAV_STATUTS, type SavTicket } from "../models/Sav";
import { listSav } from "../services/sav.service";

/** SAV tab of the chef: his tickets and « Nouveau ticket ». */
export function SavListeView() {
  const router = useRouter();
  const file = useFileEnvoi();
  const [items, setItems] = useState<SavTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const enAttente = file.items.filter((i) => i.type === "SAV").length;

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      setItems((await listSav()).data);
    } catch (e) {
      setErreur(getErrorMessage(e, "Impossible de charger les tickets SAV."));
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
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={styles.liste}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void charger(); }} />}
        ListHeaderComponent={
          <View style={styles.entete}>
            <Pressable accessibilityRole="button" onPress={() => router.push("/sav/nouveau")} style={styles.nouveau}>
              <Text style={styles.nouveauTexte}>+ Nouveau ticket SAV</Text>
            </Pressable>
            {enAttente ? (
              <Pressable accessibilityRole="button" onPress={() => router.push("/envois")} style={styles.attente}>
                <Text style={styles.attenteTexte}>⏳ {enAttente} ticket(s) en attente de réseau — voir</Text>
              </Pressable>
            ) : null}
            {erreur ? <ErrorMessage message={erreur} /> : null}
            {loading ? <ActivityIndicator style={styles.chargement} /> : null}
          </View>
        }
        ListEmptyComponent={!loading && !erreur ? <Text style={styles.vide}>Aucun ticket SAV.</Text> : null}
        renderItem={({ item: t }) => {
          const s = SAV_STATUTS[t.statut];
          return (
            <View style={styles.carte}>
              <View style={styles.entre}>
                <Text style={styles.titre} numberOfLines={1}>
                  {t.titre}
                </Text>
                {s ? <Text style={[styles.badge, { color: s.couleur, backgroundColor: s.fond }]}>{s.label}</Text> : null}
              </View>
              <Text style={styles.muted}>
                {t.reference} · {t.client.nom} · {formatDate(t.createdAt)}
              </Text>
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
  titre: { flex: 1, fontWeight: "700", color: colors.text.DEFAULT },
  badge: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: "hidden" },
  muted: { color: colors.text.muted, fontSize: 12 },
  vide: { color: colors.text.muted, textAlign: "center", paddingVertical: spacing.xl },
});
