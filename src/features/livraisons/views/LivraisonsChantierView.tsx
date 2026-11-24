import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { formatDate } from "@/shared/utils/format";
import { COMMANDE_STATUTS, RECEPTIONNABLES, type CommandeListItem } from "../models/Livraison";
import { listCommandesChantier } from "../services/livraisons.service";

/** Supplier orders of a job site: receive a delivery (photo of the note) or send the invoice. */
export function LivraisonsChantierView({ chantierId }: { chantierId: number }) {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<CommandeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const facture = !!user && permissions.canSendSupplierInvoice(user.role);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      setItems(await listCommandesChantier(chantierId));
    } catch (e) {
      setErreur(getErrorMessage(e, "Impossible de charger les commandes."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [chantierId]);

  useFocusEffect(
    useCallback(() => {
      void charger();
    }, [charger]),
  );

  return (
    <FlatList
      style={styles.page}
      data={items}
      keyExtractor={(c) => String(c.id)}
      contentContainerStyle={styles.liste}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void charger(); }} />}
      ListHeaderComponent={
        <>
          {erreur ? <ErrorMessage message={erreur} /> : null}
          {loading ? <ActivityIndicator style={styles.chargement} /> : null}
        </>
      }
      ListEmptyComponent={!loading && !erreur ? <Text style={styles.vide}>Aucune commande en livraison pour ce chantier.</Text> : null}
      renderItem={({ item: c }) => {
        const s = COMMANDE_STATUTS[c.statutLivraison];
        const attendue = RECEPTIONNABLES.includes(c.statutLivraison);
        return (
          <View style={styles.carte}>
            <View style={styles.entre}>
              <Text style={styles.nom}>{c.reference}</Text>
              {s ? <Text style={[styles.badge, { color: s.couleur, backgroundColor: s.fond }]}>{s.label}</Text> : null}
            </View>
            <Text style={styles.muted}>
              {c.fournisseur.nom}
              {c.dateLivraisonPrevue ? ` · livraison prévue le ${formatDate(c.dateLivraisonPrevue)}` : ""}
            </Text>
            <View style={styles.rangee}>
              {attendue ? (
                <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/livraisons/[commandeId]", params: { commandeId: String(c.id) } })} style={[styles.bouton, styles.primaire]}>
                  <Text style={styles.primaireTexte}>Réceptionner</Text>
                </Pressable>
              ) : null}
              {facture ? (
                <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/depenses/nouvelle", params: { chantierId: String(chantierId), commandeId: String(c.id) } })} style={[styles.bouton, styles.outline]}>
                  <Text style={styles.outlineTexte}>Facture</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT },
  liste: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing["3xl"] },
  chargement: { marginTop: spacing.lg },
  carte: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.md, gap: spacing.sm },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  rangee: { flexDirection: "row", gap: spacing.sm },
  nom: { fontWeight: "700", color: colors.text.DEFAULT },
  badge: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: "hidden" },
  muted: { color: colors.text.muted, fontSize: 12 },
  vide: { color: colors.text.muted, textAlign: "center", paddingVertical: spacing.xl },
  bouton: { flex: 1, borderRadius: 10, minHeight: 46, alignItems: "center", justifyContent: "center" },
  primaire: { backgroundColor: colors.brand[700] },
  primaireTexte: { color: colors.white, fontWeight: "700" },
  outline: { borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  outlineTexte: { color: colors.brand[700], fontWeight: "600" },
});
