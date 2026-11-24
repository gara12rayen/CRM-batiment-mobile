import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { formatDate, fullName } from "@/shared/utils/format";
import { DEMANDE_SOURCES, DEMANDE_STATUTS, FILTRES_DEMANDES, type DemandeListItem } from "../models/Demande";
import { useDemandesViewModel } from "../viewmodels/useDemandesViewModel";

function Ligne({ d, onPress }: { d: DemandeListItem; onPress: () => void }) {
  const s = DEMANDE_STATUTS[d.statut];
  const terrain = d.source === "TERRAIN";
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Demande ${d.reference}, ${fullName(d.client)}`} onPress={onPress} style={({ pressed }) => [styles.carte, pressed && styles.pressed]}>
      <View style={styles.ligneEntre}>
        <Text style={styles.client} numberOfLines={1}>
          {fullName(d.client) || "Client"}
        </Text>
        <Text style={[styles.badge, { color: s.couleur, backgroundColor: s.fond }]}>{s.label}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {d.description}
      </Text>
      <View style={styles.ligneEntre}>
        <Text style={styles.muted}>
          {d.reference} · {formatDate(d.createdAt)}
        </Text>
        <Text style={[styles.source, terrain && styles.sourceTerrain]}>{DEMANDE_SOURCES[d.source] ?? d.source}</Text>
      </View>
    </Pressable>
  );
}

/** Quote requests (bureau): « À traiter » first, filter « Prospects terrain », search. */
export function DemandesView() {
  const vm = useDemandesViewModel();
  const router = useRouter();

  return (
    <View style={styles.page}>
      <View style={styles.entete}>
        <TextInput
          value={vm.recherche}
          onChangeText={vm.setRecherche}
          placeholder="Rechercher : client, référence, besoin…"
          placeholderTextColor={colors.text.muted}
          style={styles.recherche}
          accessibilityLabel="Rechercher une demande"
          returnKeyType="search"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtres}>
          {FILTRES_DEMANDES.map((f) => {
            const actif = vm.filtre === f.value;
            return (
              <Pressable key={f.value} accessibilityRole="button" accessibilityState={{ selected: actif }} onPress={() => vm.setFiltre(f.value)} style={[styles.puce, actif && styles.puceActive]}>
                <Text style={[styles.puceTexte, actif && styles.puceTexteActif]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.ligneEntre}>
          <Text style={styles.terrainLabel}>Prospects terrain seulement</Text>
          <Switch value={vm.terrainSeulement} onValueChange={vm.setTerrainSeulement} accessibilityLabel="Prospects terrain seulement" />
        </View>
      </View>

      {vm.erreur ? (
        <View style={styles.erreur}>
          <ErrorMessage message={vm.erreur} />
          <Pressable accessibilityRole="button" onPress={() => void vm.retry()}>
            <Text style={styles.lien}>Réessayer</Text>
          </Pressable>
        </View>
      ) : null}

      {vm.loading ? (
        <ActivityIndicator style={styles.chargement} size="large" color={colors.brand[700]} />
      ) : (
        <FlatList
          data={vm.items}
          keyExtractor={(d) => String(d.id)}
          renderItem={({ item }) => <Ligne d={item} onPress={() => router.push({ pathname: "/prospects/[id]", params: { id: String(item.id) } })} />}
          contentContainerStyle={styles.liste}
          refreshControl={<RefreshControl refreshing={vm.refreshing} onRefresh={vm.refresh} />}
          onEndReached={vm.chargerPlus}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={vm.items.length ? <Text style={styles.muted}>{vm.total} demande(s)</Text> : null}
          ListEmptyComponent={
            vm.erreur ? null : (
              <View style={styles.vide}>
                <Text style={styles.videTitre}>Aucune demande</Text>
                <Text style={styles.muted}>Changez le filtre ou la recherche.</Text>
              </View>
            )
          }
          ListFooterComponent={vm.plus ? <ActivityIndicator style={styles.chargementPlus} /> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT },
  entete: { padding: spacing.md, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  recherche: { backgroundColor: colors.background.DEFAULT, borderColor: colors.border.DEFAULT, borderWidth: 1, borderRadius: 10, padding: spacing.md, color: colors.text.DEFAULT },
  filtres: { gap: spacing.sm, paddingVertical: 2 },
  puce: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  puceActive: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
  puceTexte: { color: colors.text.DEFAULT, fontWeight: "600", fontSize: 13 },
  puceTexteActif: { color: colors.white },
  terrainLabel: { color: colors.text.DEFAULT, fontWeight: "600" },
  liste: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing["3xl"] },
  carte: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.md, gap: 6 },
  pressed: { opacity: 0.7 },
  ligneEntre: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  client: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.text.DEFAULT },
  description: { color: colors.text.DEFAULT, fontSize: 13, lineHeight: 18 },
  muted: { color: colors.text.muted, fontSize: 12 },
  badge: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: "hidden" },
  source: { fontSize: 11, fontWeight: "600", color: colors.text.muted },
  sourceTerrain: { color: "#B45309" },
  erreur: { padding: spacing.md, gap: spacing.sm },
  lien: { color: colors.brand[700], fontWeight: "700" },
  chargement: { marginTop: spacing["2xl"] },
  chargementPlus: { marginVertical: spacing.md },
  vide: { alignItems: "center", paddingVertical: spacing["2xl"], gap: 4 },
  videTitre: { fontSize: 16, fontWeight: "700", color: colors.text.DEFAULT },
});
