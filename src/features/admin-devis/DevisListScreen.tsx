import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useDevisViewModel } from "./useDevisViewModel";
import { DevisStatut, totalDevis } from "./types";

const FILTRES: (DevisStatut | "TOUS")[] = ["TOUS", "BROUILLON", "ENVOYE", "SIGNE", "FACTURE", "REFUSE"];

export const COULEURS: Record<DevisStatut, string> = {
  BROUILLON: "#6b7280",
  ENVOYE: "#2563eb",
  SIGNE: "#16a34a",
  FACTURE: "#7c3aed",
  REFUSE: "#dc2626",
};

export default function DevisListScreen() {
  const router = useRouter();
  const vm = useDevisViewModel();

  return (
    <View style={styles.page}>
      <Text style={styles.titre}>Devis</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtres}>
        {FILTRES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, vm.filtre === f && styles.chipActive]}
            onPress={() => vm.setFiltre(f)}
          >
            <Text style={[styles.chipTxt, vm.filtre === f && styles.chipTxtActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {vm.isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {vm.liste.length === 0 && <Text style={styles.vide}>Aucun devis.</Text>}
          {vm.liste.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={styles.card}
              onPress={() => router.push(`/partie4/devis/${d.id}` as any)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.ref}>
                  {d.reference} – v{d.version}
                </Text>
                <Text style={styles.sous}>
                  {d.client} · {d.date}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.montant}>{totalDevis(d).toLocaleString("fr-FR")} €</Text>
                <Text style={[styles.badge, { backgroundColor: COULEURS[d.statut] }]}>{d.statut}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f4f6f8", paddingTop: 60 },
  titre: { fontSize: 24, fontWeight: "700", paddingHorizontal: 16, marginBottom: 12 },
  filtres: { paddingHorizontal: 16, maxHeight: 44 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: "#e5e7eb", marginRight: 8, height: 36 },
  chipActive: { backgroundColor: "#2563eb" },
  chipTxt: { fontSize: 12, fontWeight: "600", color: "#374151" },
  chipTxtActive: { color: "#fff" },
  vide: { color: "#888", textAlign: "center", marginTop: 20 },
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10, elevation: 1 },
  ref: { fontSize: 15, fontWeight: "700" },
  sous: { fontSize: 13, color: "#666", marginTop: 2 },
  montant: { fontSize: 16, fontWeight: "700" },
  badge: { color: "#fff", fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 4, overflow: "hidden" },
});
