import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { Input } from "@/shared/components/Input";
import { formatUnite } from "@/shared/utils/format";
import type { Materiau, OngletCatalogue } from "../models/Catalogue";
import type { Prestation } from "../models/Prestation";
import { fourchettePrix } from "../utils/prix";
import { useCatalogueViewModel } from "../viewmodels/useCatalogueViewModel";

const ONGLETS: { value: OngletCatalogue; label: string }[] = [
  { value: "PRESTATIONS", label: "Prestations" },
  { value: "MATERIAUX", label: "Matériaux" },
];

function PrestationCarte({ p, onPress }: { p: Prestation; onPress: () => void }) {
  const prix = fourchettePrix(p);
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Text style={styles.nom}>{p.nom}</Text>
      <Text style={styles.muted}>
        {p.categorie.nom}
        {p.sousCategorie ? ` › ${p.sousCategorie.nom}` : ""} · {formatUnite(p.unite)}
      </Text>
      {prix ? <Text style={styles.prix}>{prix}</Text> : null}
    </Pressable>
  );
}

function MateriauCarte({ m, onPress }: { m: Materiau; onPress: () => void }) {
  const details = [m.couleur, m.finition].filter(Boolean).join(" · ");
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Text style={styles.nom}>{m.nom}</Text>
      <Text style={styles.muted}>
        {formatUnite(m.unite)}
        {details ? ` · ${details}` : ""}
        {m.fournisseur ? ` · ${m.fournisseur.nom}` : ""}
      </Text>
    </Pressable>
  );
}

/** Catalogue (read only): prestations and materials of the company, with search. */
export function CatalogueView() {
  const router = useRouter();
  const vm = useCatalogueViewModel();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.onglets}>
          {ONGLETS.map((o) => {
            const actif = vm.onglet === o.value;
            return (
              <Pressable key={o.value} accessibilityRole="tab" accessibilityState={{ selected: actif }} onPress={() => vm.changerOnglet(o.value)} style={[styles.onglet, actif && styles.ongletActif]}>
                <Text style={[styles.ongletTexte, actif && styles.ongletTexteActif]}>{o.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Input
          value={vm.search}
          onChangeText={vm.setSearch}
          placeholder={vm.onglet === "PRESTATIONS" ? "Rechercher une prestation…" : "Rechercher un matériau…"}
          accessibilityLabel="Rechercher dans le catalogue"
          autoCorrect={false}
        />
        {vm.onglet === "PRESTATIONS" && vm.categories.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: vm.categorieId === null }} onPress={() => vm.choisirCategorie(null)} style={[styles.chip, vm.categorieId === null && styles.chipActif]}>
              <Text style={[styles.chipTexte, vm.categorieId === null && styles.chipTexteActif]}>Toutes</Text>
            </Pressable>
            {vm.categories.map((c) => {
              const actif = vm.categorieId === c.id;
              return (
                <Pressable key={c.id} accessibilityRole="button" accessibilityState={{ selected: actif }} onPress={() => vm.choisirCategorie(c.id)} style={[styles.chip, actif && styles.chipActif]}>
                  <Text style={[styles.chipTexte, actif && styles.chipTexteActif]}>{c.nom}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}
      </View>

      {vm.loading ? (
        <ActivityIndicator size="large" color={colors.brand[700]} style={styles.loader} />
      ) : vm.error && !vm.elements.length ? (
        <View style={styles.centered}>
          <ErrorMessage message={vm.error} />
          <Pressable accessibilityRole="button" onPress={vm.retry}>
            <Text style={styles.link}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={vm.elements}
          keyExtractor={(e) => `${e.type}-${e.item.id}`}
          renderItem={({ item: e }) =>
            e.type === "PRESTATIONS" ? (
              <PrestationCarte p={e.item} onPress={() => router.push({ pathname: "/catalogue/prestation/[id]", params: { id: String(e.item.id) } })} />
            ) : (
              <MateriauCarte m={e.item} onPress={() => router.push({ pathname: "/catalogue/materiau/[id]", params: { id: String(e.item.id) } })} />
            )
          }
          contentContainerStyle={styles.liste}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={vm.refreshing} onRefresh={vm.refresh} />}
          onEndReached={vm.chargerPlus}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={<Text style={styles.vide}>{vm.search.trim() ? "Aucun résultat." : "Le catalogue est vide."}</Text>}
          ListFooterComponent={vm.loadingMore ? <ActivityIndicator color={colors.brand[700]} style={styles.loader} /> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.DEFAULT },
  header: { padding: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  onglets: { flexDirection: "row", backgroundColor: colors.surface.muted, borderRadius: 12, padding: 4, gap: 4 },
  onglet: { flex: 1, minHeight: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  ongletActif: { backgroundColor: colors.surface.DEFAULT, borderWidth: 1, borderColor: colors.border.DEFAULT },
  ongletTexte: { fontSize: 14, fontWeight: "600", color: colors.text.muted },
  ongletTexteActif: { color: colors.brand[900] },
  chips: { gap: spacing.sm, paddingVertical: 2 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT, paddingHorizontal: spacing.md, paddingVertical: 6 },
  chipActif: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
  chipTexte: { fontSize: 13, fontWeight: "600", color: colors.text.DEFAULT },
  chipTexteActif: { color: colors.white },
  liste: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, paddingBottom: spacing["3xl"] },
  card: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.md, gap: 4 },
  pressed: { opacity: 0.8 },
  nom: { fontSize: 15, fontWeight: "700", color: colors.text.DEFAULT },
  muted: { fontSize: 13, color: colors.text.muted },
  prix: { fontSize: 13, fontWeight: "700", color: colors.brand[700] },
  loader: { marginVertical: spacing.xl },
  centered: { alignItems: "center", gap: spacing.md, padding: spacing.lg },
  link: { color: colors.brand[700], fontWeight: "700" },
  vide: { textAlign: "center", color: colors.text.muted, marginTop: spacing.xl },
});
