import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import type { ChantierListItem } from "@/features/chantiers/models/Chantier";
import { listChantiers } from "@/features/chantiers/services/chantiers.service";
import type { ProspectTerrain } from "@/features/prospects-terrain/models/ProspectTerrain";
import { listProspectsTerrain } from "@/features/prospects-terrain/services/prospectsTerrain.service";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { fullName } from "@/shared/utils/format";
import { creerBrouillonChef } from "../services/brouillonChef.service";

type Choix = { cle: string; clientId: number; demandeDevisId?: number; titre: string; detail: string };

/** Chef: pick the client (one of his job sites, or a prospect he sent) → draft → Devis IA. */
export function BrouillonChefView() {
  const router = useRouter();
  const [chantiers, setChantiers] = useState<ChantierListItem[]>([]);
  const [prospects, setProspects] = useState<ProspectTerrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [creation, setCreation] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      const [c, p] = await Promise.all([
        listChantiers({ statuts: ["PLANIFIE", "EN_COURS", "SUSPENDU", "TERMINE"], limit: 100 }),
        listProspectsTerrain({ limit: 50 }).catch(() => ({ data: [] as ProspectTerrain[] })),
      ]);
      setChantiers(c.data);
      setProspects(p.data);
    } catch (e) {
      setErreur(getErrorMessage(e, "Impossible de charger vos chantiers."));
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

  const choixChantiers = useMemo<Choix[]>(() => {
    const vus = new Map<number, Choix>();
    for (const c of chantiers) {
      const existant = vus.get(c.client.id);
      if (existant) existant.detail += ` · ${c.reference}`;
      else vus.set(c.client.id, { cle: `c${c.client.id}`, clientId: c.client.id, titre: fullName(c.client) || "Client", detail: `${c.reference} — ${c.adresse}` });
    }
    return [...vus.values()];
  }, [chantiers]);

  // Prospects still open (a converted one already has its quote)
  const choixProspects = useMemo<Choix[]>(
    () =>
      prospects
        .filter((p) => p.statut !== "CONVERTI" && p.statut !== "PERDU")
        .map((p) => ({ cle: `p${p.id}`, clientId: p.client.id, demandeDevisId: p.id, titre: fullName(p.client) || "Prospect", detail: `${p.reference} — ${p.description}` })),
    [prospects],
  );

  async function choisir(c: Choix) {
    setCreation(c.cle);
    setErreur(null);
    try {
      const devis = await creerBrouillonChef({ clientId: c.clientId, demandeDevisId: c.demandeDevisId });
      router.replace({ pathname: "/devis/ia", params: { id: String(devis.id) } });
    } catch (e) {
      setErreur(getErrorMessage(e, "Le brouillon n’a pas pu être créé."));
    } finally {
      setCreation(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
      </View>
    );
  }

  const liste = (titre: string, items: Choix[], vide: string) => (
    <View style={styles.carte}>
      <Text style={styles.titre}>{titre}</Text>
      {!items.length ? <Text style={styles.muted}>{vide}</Text> : null}
      {items.map((c) => (
        <Pressable key={c.cle} accessibilityRole="button" accessibilityLabel={`Préparer un devis pour ${c.titre}`} disabled={creation !== null} onPress={() => void choisir(c)} style={({ pressed }) => [styles.ligne, (pressed || creation === c.cle) && styles.pressed]}>
          <View style={styles.flex}>
            <Text style={styles.nom}>{c.titre}</Text>
            <Text style={styles.muted} numberOfLines={2}>
              {c.detail}
            </Text>
          </View>
          {creation === c.cle ? <ActivityIndicator /> : <Text style={styles.chevron}>›</Text>}
        </Pressable>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.contenu} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void charger(); }} />}>
      <Text style={styles.intro}>Choisissez le client : un brouillon est créé, puis le Devis IA s’ouvre. Le bureau ajoute les prix avant l’envoi.</Text>
      {erreur ? <ErrorMessage message={erreur} /> : null}
      {liste("Clients de mes chantiers", choixChantiers, "Aucun chantier en cours.")}
      {liste("Mes prospects terrain", choixProspects, "Aucun prospect envoyé en attente de devis.")}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT },
  contenu: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },
  centre: { flex: 1, alignItems: "center", justifyContent: "center" },
  intro: { color: colors.text.muted, lineHeight: 20 },
  carte: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.lg, gap: spacing.xs },
  titre: { fontSize: 16, fontWeight: "700", color: colors.text.DEFAULT, marginBottom: spacing.xs },
  ligne: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.DEFAULT, minHeight: 56 },
  pressed: { opacity: 0.6 },
  flex: { flex: 1 },
  nom: { fontSize: 15, fontWeight: "600", color: colors.text.DEFAULT },
  muted: { color: colors.text.muted, fontSize: 13 },
  chevron: { fontSize: 22, color: colors.text.muted },
});
