import React, { useCallback } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useInstallationsViewModel } from "./useInstallationsViewModel";
import { installationsVisibles } from "./entreprise";
import { livraisonEnRetard } from "./types";

export default function InstallationsListScreen() {
  const router = useRouter();
  const vm = useInstallationsViewModel();

  useFocusEffect(
    useCallback(() => {
      vm.reload();
    }, [])
  );

  // Menu visible uniquement pour Régie ou « Les deux »
  if (!installationsVisibles()) {
    return (
      <View style={styles.page}>
        <Text style={styles.titre}>Installations déléguées</Text>
        <Text style={styles.vide}>Ce module n'est pas disponible pour votre type d'entreprise.</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Text style={styles.titre}>Installations déléguées</Text>

      {vm.nbRetards > 0 && (
        <View style={styles.alerte}>
          <Text style={styles.alerteTxt}>
            ⚠ {vm.nbRetards} livraison(s) en retard retardent l'installation
          </Text>
        </View>
      )}

      {vm.isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {vm.groupes.length === 0 && <Text style={styles.vide}>Aucune installation.</Text>}
          {vm.groupes.map((g) => (
            <View key={g.etape.key} style={{ marginBottom: 16 }}>
              <Text style={styles.section}>
                {g.etape.label} ({g.items.length})
              </Text>
              {g.items.map((i) => {
                const retard = livraisonEnRetard(i);
                return (
                  <TouchableOpacity
                    key={i.id}
                    style={[styles.card, retard && styles.cardRetard]}
                    onPress={() => router.push(`/partie4/installations/${i.id}` as any)}
                  >
                    <Text style={styles.nom}>{i.chantier}</Text>
                    <Text style={styles.sous}>
                      {i.client} · livraison prévue {i.dateLivraisonPrevue}
                    </Text>
                    {retard && <Text style={styles.retard}>⚠ Livraison en retard</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f4f6f8", paddingTop: 60 },
  titre: { fontSize: 24, fontWeight: "700", paddingHorizontal: 16, marginBottom: 12 },
  alerte: { backgroundColor: "#fee2e2", marginHorizontal: 16, padding: 12, borderRadius: 8 },
  alerteTxt: { color: "#b91c1c", fontWeight: "600" },
  vide: { color: "#888", textAlign: "center", marginTop: 20, paddingHorizontal: 16 },
  section: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 8 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 8, elevation: 1 },
  cardRetard: { borderLeftWidth: 4, borderLeftColor: "#dc2626" },
  nom: { fontSize: 15, fontWeight: "700" },
  sous: { fontSize: 13, color: "#666", marginTop: 2 },
  retard: { color: "#dc2626", fontWeight: "700", marginTop: 6, fontSize: 12 },
});