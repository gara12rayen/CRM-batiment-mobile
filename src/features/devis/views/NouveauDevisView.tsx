import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { Input } from "@/shared/components/Input";
import { fullName } from "@/shared/utils/format";
import { useNouveauDevisViewModel } from "../viewmodels/useNouveauDevisViewModel";

/** New quote: choose the client, the draft opens right away (lines are added on the quote screen). */
export function NouveauDevisView({ clientId }: { clientId?: number }) {
  const vm = useNouveauDevisViewModel(clientId);

  if (clientId || vm.creation) {
    return (
      <View style={styles.centered}>
        {vm.error ? <ErrorMessage message={vm.error} /> : <ActivityIndicator size="large" color={colors.brand[700]} />}
        {!vm.error ? <Text style={styles.muted}>Création du devis…</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pour quel client ?</Text>
        <Input value={vm.search} onChangeText={vm.setSearch} placeholder="Nom, email, téléphone…" autoFocus accessibilityLabel="Rechercher un client" />
        <Text style={styles.muted}>Client absent ? Créez-le d’abord dans l’onglet Clients.</Text>
        {vm.error ? <ErrorMessage message={vm.error} /> : null}
      </View>
      {vm.loading ? (
        <ActivityIndicator style={styles.loader} color={colors.brand[700]} />
      ) : (
        <FlatList
          data={vm.clients}
          keyExtractor={(c) => String(c.id)}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable accessibilityRole="button" onPress={() => vm.choisir(item)} style={({ pressed }) => [styles.client, pressed && styles.pressed]}>
              <Text style={styles.nom}>{item.typeClient === "PROFESSIONNEL" ? item.nom : fullName(item)}</Text>
              <Text style={styles.muted}>{item.telephone ?? item.email ?? ""}</Text>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun client trouvé.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.DEFAULT },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.lg },
  header: { padding: spacing.lg, gap: spacing.sm },
  title: { fontSize: 18, fontWeight: "700", color: colors.text.DEFAULT },
  loader: { marginTop: spacing.xl },
  client: { backgroundColor: colors.surface.DEFAULT, marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.border.DEFAULT, gap: 2 },
  pressed: { opacity: 0.8 },
  nom: { fontSize: 15, fontWeight: "600", color: colors.text.DEFAULT },
  muted: { fontSize: 13, color: colors.text.muted },
  empty: { textAlign: "center", marginTop: spacing.xl, color: colors.text.muted },
});
