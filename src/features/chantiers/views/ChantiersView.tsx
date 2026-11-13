import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { Input } from "@/shared/components/Input";
import { formatDate, fullName } from "@/shared/utils/format";
import { CHANTIER_STATUT } from "../models/Chantier";
import { FILTRES_CHANTIERS, useChantiersViewModel } from "../viewmodels/useChantiersViewModel";

/** Liste des chantiers (sans aucun prix) : toucher un chantier ouvre ses tâches. */
export function ChantiersView() {
  const router = useRouter();
  const vm = useChantiersViewModel();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Input value={vm.search} onChangeText={vm.setSearch} placeholder="Rechercher (référence, adresse, client)…" accessibilityLabel="Rechercher un chantier" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtres}>
          {FILTRES_CHANTIERS.map((f) => {
            const actif = vm.filtre === f.value;
            return (
              <Pressable key={f.value} accessibilityRole="button" accessibilityState={{ selected: actif }} onPress={() => vm.setFiltre(f.value)} style={[styles.chip, actif && styles.chipActif]}>
                <Text style={[styles.chipTexte, actif && styles.chipTexteActif]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {vm.loading ? (
        <ActivityIndicator size="large" color={colors.brand[700]} style={styles.loader} />
      ) : vm.error && !vm.chantiers.length ? (
        <View style={styles.centered}>
          <ErrorMessage message={vm.error} />
          <Pressable accessibilityRole="button" onPress={vm.retry}>
            <Text style={styles.link}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={vm.chantiers}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={styles.liste}
          refreshControl={<RefreshControl refreshing={vm.refreshing} onRefresh={vm.refresh} />}
          onEndReached={vm.chargerPlus}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={<Text style={styles.vide}>Aucun chantier.</Text>}
          ListFooterComponent={vm.loadingMore ? <ActivityIndicator color={colors.brand[700]} style={styles.loader} /> : null}
          renderItem={({ item: c }) => {
            const s = CHANTIER_STATUT[c.statut];
            return (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push({ pathname: "/chantiers/taches", params: { chantierId: String(c.id) } })}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.reference}>{c.reference}</Text>
                  {s ? <Text style={[styles.badge, { color: s.couleur, backgroundColor: s.fond }]}>{s.label}</Text> : null}
                </View>
                <Text style={styles.client}>{fullName(c.client) || "Client"}</Text>
                <Text style={styles.muted}>{c.adresse}</Text>
                <Text style={styles.muted}>
                  {formatDate(c.dateDebut)} → {formatDate(c.dateFin)}
                  {c.chefChantier ? ` · chef : ${fullName(c.chefChantier)}` : ""}
                </Text>
                <View style={styles.rowBetween}>
                  <View style={styles.barre}>
                    <View style={[styles.barreRemplie, { width: `${c.avancement}%` }]} />
                  </View>
                  <Text style={styles.pourcent}>
                    {c.avancement} % · {c.nombreTaches} tâche{c.nombreTaches > 1 ? "s" : ""}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.DEFAULT },
  header: { padding: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  filtres: { gap: spacing.sm, paddingVertical: 2 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT, paddingHorizontal: spacing.md, paddingVertical: 6 },
  chipActif: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
  chipTexte: { fontSize: 13, fontWeight: "600", color: colors.text.DEFAULT },
  chipTexteActif: { color: colors.white },
  liste: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, paddingBottom: spacing["3xl"] },
  card: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.md, gap: 4 },
  pressed: { opacity: 0.8 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  reference: { fontSize: 16, fontWeight: "800", color: colors.brand[900] },
  badge: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: "hidden" },
  client: { fontSize: 14, fontWeight: "600", color: colors.text.DEFAULT },
  muted: { fontSize: 13, color: colors.text.muted },
  barre: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surface.muted, overflow: "hidden" },
  barreRemplie: { height: 6, borderRadius: 3, backgroundColor: colors.brand[500] },
  pourcent: { fontSize: 12, fontWeight: "600", color: colors.text.DEFAULT },
  loader: { marginVertical: spacing.xl },
  centered: { alignItems: "center", gap: spacing.md, padding: spacing.lg },
  link: { color: colors.brand[700], fontWeight: "700" },
  vide: { textAlign: "center", color: colors.text.muted, marginTop: spacing.xl },
});
