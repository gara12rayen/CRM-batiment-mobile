import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { detailMock, detailTitres } from "./detail.mock";
import { IndicatorKey } from "./types";

export default function DetailScreen({ indicator }: { indicator: IndicatorKey }) {
  const router = useRouter();
  const items = detailMock[indicator] ?? [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.retour}>← Retour</Text>
      </TouchableOpacity>
      <Text style={styles.titre}>{detailTitres[indicator] ?? "Détail"}</Text>

      {items.length === 0 ? (
        <Text style={styles.vide}>Aucun élément.</Text>
      ) : (
        items.map((it) => (
          <View key={it.id} style={[styles.card, it.enRetard && styles.cardRetard]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitre}>{it.titre}</Text>
              <Text style={styles.cardSous}>{it.sousTitre}</Text>
            </View>
            {it.valeur ? <Text style={styles.valeur}>{it.valeur}</Text> : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 60, backgroundColor: "#f4f6f8" },
  retour: { fontSize: 16, color: "#2563eb", marginBottom: 12 },
  titre: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  vide: { color: "#888", marginTop: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
  },
  cardRetard: { borderLeftWidth: 4, borderLeftColor: "#dc2626" },
  cardTitre: { fontSize: 15, fontWeight: "600" },
  cardSous: { fontSize: 13, color: "#777", marginTop: 2 },
  valeur: { fontSize: 16, fontWeight: "700" },
});