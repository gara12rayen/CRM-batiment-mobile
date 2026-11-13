import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { formatDate, fullName } from "@/shared/utils/format";
import { TacheCard } from "../components/TacheCard";
import { CHANTIER_STATUT } from "../models/Chantier";
import { TACHE_STATUT, TACHE_STATUTS } from "../models/Tache";
import { type FiltreTaches, useTachesViewModel } from "../viewmodels/useTachesViewModel";

const FILTRES: { value: FiltreTaches; label: string }[] = [
  { value: "TOUTES", label: "Toutes" },
  { value: "RETARD", label: "En retard" },
  ...TACHE_STATUTS.map((s) => ({ value: s, label: TACHE_STATUT[s].label })),
];

/** Liste des tâches d'un chantier (création, avancement, affectation dans la fiche de la tâche). */
export function TachesView({ chantierId }: { chantierId: number }) {
  const router = useRouter();
  const vm = useTachesViewModel(chantierId);
  const c = vm.chantier;

  const ouvrirFiche = (tacheId?: number) =>
    router.push({ pathname: "/chantiers/tache", params: { chantierId: String(chantierId), ...(tacheId ? { tacheId: String(tacheId) } : {}) } });

  if (vm.loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
      </View>
    );
  }
  if (!c) {
    return (
      <View style={styles.centered}>
        <ErrorMessage message={vm.error ?? "Chantier introuvable."} />
        <Pressable accessibilityRole="button" onPress={vm.retry}>
          <Text style={styles.link}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  const statut = CHANTIER_STATUT[c.statut];

  return (
    <View style={styles.container}>
      <FlatList
        data={vm.taches}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={vm.refreshing} onRefresh={vm.refresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.reference}>{c.reference}</Text>
                {statut ? <Text style={[styles.badge, { color: statut.couleur, backgroundColor: statut.fond }]}>{statut.label}</Text> : null}
              </View>
              <Text style={styles.client}>{fullName(c.client) || "Client"}</Text>
              <Text style={styles.muted}>{c.adresse}</Text>
              <Text style={styles.muted}>
                {formatDate(c.dateDebut)} → {formatDate(c.dateFin)} · avancement {c.avancement} %
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtres}>
              {FILTRES.map((f) => {
                const actif = vm.filtre === f.value;
                return (
                  <Pressable key={f.value} accessibilityRole="button" accessibilityState={{ selected: actif }} onPress={() => vm.setFiltre(f.value)} style={[styles.chip, actif && styles.chipActif]}>
                    <Text style={[styles.chipTexte, actif && styles.chipTexteActif]}>
                      {f.label} ({vm.compteurs[f.value]})
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {vm.peutModifier ? (
              <Pressable accessibilityRole="button" onPress={() => ouvrirFiche()} style={styles.nouvelle}>
                <Text style={styles.nouvelleTexte}>＋ Nouvelle tâche</Text>
              </Pressable>
            ) : null}
            {vm.actionError ? <ErrorMessage message={vm.actionError} /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <TacheCard
            tache={item}
            enRetard={vm.estEnRetard(item)}
            peutModifier={vm.peutModifier}
            enCours={vm.enCours === item.id}
            onPress={() => ouvrirFiche(item.id)}
            onStatut={(s) => void vm.changerStatut(item, s)}
          />
        )}
        ListEmptyComponent={<Text style={styles.vide}>{vm.total ? "Aucune tâche pour ce filtre." : "Aucune tâche sur ce chantier."}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.DEFAULT },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing["3xl"] },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.lg, backgroundColor: colors.background.DEFAULT },
  header: { gap: spacing.sm, marginBottom: spacing.xs },
  card: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.lg, gap: 4 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  reference: { fontSize: 18, fontWeight: "800", color: colors.brand[900] },
  badge: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: "hidden" },
  client: { fontSize: 15, fontWeight: "600", color: colors.text.DEFAULT },
  muted: { fontSize: 13, color: colors.text.muted },
  filtres: { gap: spacing.sm, paddingVertical: 2 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT, paddingHorizontal: spacing.md, paddingVertical: 6 },
  chipActif: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
  chipTexte: { fontSize: 13, fontWeight: "600", color: colors.text.DEFAULT },
  chipTexteActif: { color: colors.white },
  nouvelle: { minHeight: 44, borderRadius: 12, backgroundColor: colors.brand[700], alignItems: "center", justifyContent: "center" },
  nouvelleTexte: { color: colors.white, fontWeight: "700", fontSize: 15 },
  vide: { textAlign: "center", color: colors.text.muted, marginTop: spacing.xl },
  link: { color: colors.brand[700], fontWeight: "700" },
});
