import React, { useCallback } from "react";
import {
  ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useChantiersViewModel } from "./useChantiersViewModel";
import { ChantierStatut, STATUTS, avancement, enRetard } from "./types";

export const COULEURS: Record<ChantierStatut, string> = {
  PLANIFIE: "#6b7280",
  EN_COURS: "#2563eb",
  SUSPENDU: "#d97706",
  TERMINE: "#16a34a",
};

export default function ChantiersListScreen() {
  const router = useRouter();
  const vm = useChantiersViewModel();

  useFocusEffect(
    useCallback(() => {
      vm.reload();
    }, [])
  );

  const filtres: (ChantierStatut | "TOUS")[] = ["TOUS", ...STATUTS];

  return (
    <View style={styles.page}>
      <Text style={styles.titre}>Chantiers</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtres}>
        {filtres.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, vm.filtre === f && styles.chipActive]}
            onPress={() => vm.setFiltre(f)}
          >
            <Text style={[styles.chipTxt, vm.filtre === f && { color: "#fff" }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {vm.isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {vm.liste.length === 0 && <Text style={styles.vide}>Aucun chantier.</Text>}
          {vm.liste.map((c) => {
            const pct = avancement(c);
            const retard = enRetard(c);
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.card, retard && styles.cardRetard]}
                onPress={() => router.push(`/partie4/chantiers/${c.id}` as any)}
              >
                <View style={styles.ligne}>
                  <Text style={styles.nom}>{c.nom}</Text>
                  <Text style={[styles.badge, { backgroundColor: COULEURS[c.statut] }]}>{c.statut}</Text>
                </View>
                <Text style={styles.sous}>
                  {c.client} · fin prévue {c.dateFinPrevue}
                  {retard ? " · EN RETARD" : ""}
                </Text>
                <View style={styles.barre}>
                  <View style={[styles.barreRempli, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.pct}>{pct} %</Text>
              </TouchableOpacity>
            );
          })}
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
  vide: { color: "#888", textAlign: "center", marginTop: 20 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10, elevation: 1 },
  cardRetard: { borderLeftWidth: 4, borderLeftColor: "#dc2626" },
  ligne: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  nom: { fontSize: 15, fontWeight: "700", flex: 1 },
  badge: { color: "#fff", fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: "hidden" },
  sous: { fontSize: 13, color: "#666", marginTop: 4 },
  barre: { height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, marginTop: 10, overflow: "hidden" },
  barreRempli: { height: 8, backgroundColor: "#16a34a" },
  pct: { fontSize: 12, color: "#555", marginTop: 4 },
});