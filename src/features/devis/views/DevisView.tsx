import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { useAuth } from "@/features/auth/context/AuthContext";
import { permissions } from "@/features/auth/utils/permissions";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { Input } from "@/shared/components/Input";
import { PlaceholderView } from "@/shared/components/PlaceholderView";
import { formatDate, formatEuros, fullName } from "@/shared/utils/format";
import { DEVIS_FILTRES, DEVIS_STATUT, type DevisListItem } from "../models/Devis";
import { useDevisListViewModel } from "../viewmodels/useDevisListViewModel";

/** Quotes tab: list of the quotes saved in the database (same as the web « Devis » page). */
export function DevisView() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user || !permissions.canReadQuotes(user.role)) {
    return (
      <PlaceholderView
        title="Accès non autorisé"
        description="Vous n'avez pas accès aux devis."
      />
    );
  }

  return <DevisListe peutCreer={permissions.canManageQuotes(user.role)} />;
}

function DevisCarte({ d, onPress }: { d: DevisListItem; onPress: () => void }) {
  const statut = DEVIS_STATUT[d.statut] ?? { label: d.statut, couleur: colors.text.muted, fond: colors.surface.muted };
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.rowBetween}>
        <Text style={styles.reference}>{d.reference}</Text>
        <Text style={[styles.badge, { color: statut.couleur, backgroundColor: statut.fond }]}>{statut.label}</Text>
      </View>
      <Text style={styles.client}>{fullName(d.client) || "Client"}</Text>
      <View style={styles.rowBetween}>
        <Text style={styles.muted}>
          {formatDate(d.dateEnvoi ?? d.dateCreation)}
          {d.versionCourante > 1 ? ` · v${d.versionCourante}` : ""}
        </Text>
        {d.totalTTC !== undefined ? <Text style={styles.total}>{formatEuros(d.totalTTC)} TTC</Text> : null}
      </View>
    </Pressable>
  );
}

function DevisListe({ peutCreer }: { peutCreer: boolean }) {
  const router = useRouter();
  const vm = useDevisListViewModel();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Input value={vm.search} onChangeText={vm.setSearch} placeholder="Rechercher (référence, client)…" accessibilityLabel="Rechercher un devis" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtres}>
          {DEVIS_FILTRES.map((f) => {
            const actif = vm.filtre === f.value;
            return (
              <Pressable key={f.value} accessibilityRole="button" accessibilityState={{ selected: actif }} onPress={() => vm.setFiltre(f.value)} style={[styles.chip, actif && styles.chipActif]}>
                <Text style={[styles.chipTexte, actif && styles.chipTexteActif]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {peutCreer ? (
          <Pressable accessibilityRole="button" onPress={() => router.push("/devis/create")} style={styles.nouveau}>
            <Text style={styles.nouveauTexte}>＋ Nouveau devis</Text>
          </Pressable>
        ) : null}
      </View>

      {vm.loading ? (
        <ActivityIndicator size="large" color={colors.brand[700]} style={styles.loader} />
      ) : vm.error && !vm.devis.length ? (
        <View style={styles.centered}>
          <ErrorMessage message={vm.error} />
          <Pressable accessibilityRole="button" onPress={vm.retry}>
            <Text style={styles.link}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={vm.devis}
          keyExtractor={(d) => String(d.id)}
          renderItem={({ item }) => <DevisCarte d={item} onPress={() => router.push(`/devis/${item.id}`)} />}
          contentContainerStyle={styles.liste}
          refreshControl={<RefreshControl refreshing={vm.refreshing} onRefresh={vm.refresh} />}
          onEndReached={vm.chargerPlus}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={<Text style={styles.vide}>Aucun devis.</Text>}
          ListFooterComponent={vm.loadingMore ? <ActivityIndicator color={colors.brand[700]} style={styles.loader} /> : null}
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
  nouveau: { minHeight: 44, borderRadius: 12, backgroundColor: colors.brand[700], alignItems: "center", justifyContent: "center" },
  nouveauTexte: { color: colors.white, fontWeight: "700", fontSize: 15 },
  liste: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, paddingBottom: spacing["3xl"] },
  card: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.md, gap: 4 },
  pressed: { opacity: 0.8 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  reference: { fontSize: 16, fontWeight: "800", color: colors.brand[900] },
  badge: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: "hidden" },
  client: { fontSize: 14, fontWeight: "600", color: colors.text.DEFAULT },
  muted: { fontSize: 13, color: colors.text.muted },
  total: { fontSize: 14, fontWeight: "700", color: colors.text.DEFAULT },
  loader: { marginVertical: spacing.xl },
  centered: { alignItems: "center", gap: spacing.md, padding: spacing.lg },
  link: { color: colors.brand[700], fontWeight: "700" },
  vide: { textAlign: "center", color: colors.text.muted, marginTop: spacing.xl },
});
