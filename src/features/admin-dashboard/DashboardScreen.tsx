import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useDashboardViewModel } from "./useDashboardViewModel";
import { IndicatorKey } from "./types";

export default function DashboardScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useDashboardViewModel();

  if (isLoading) return <ActivityIndicator style={{ marginTop: 80 }} />;

  if (isError || !data) {
    return (
      <TouchableOpacity onPress={refetch}>
        <Text style={styles.error}>Erreur de chargement. Réessayer</Text>
      </TouchableOpacity>
    );
  }

  const cards: { key: IndicatorKey; titre: string; valeur: string; sous?: string }[] = [
    {
      key: "ca",
      titre: "CA signé du mois",
      valeur: data.caSigneMois.toLocaleString("fr-FR") + " €",
    },
    {
      key: "conversion",
      titre: "Taux de conversion",
      valeur: Math.round(data.tauxConversion * 100) + " %",
    },
    {
      key: "factures",
      titre: "Factures impayées",
      valeur: String(data.facturesImpayees.nombre),
      sous: data.facturesImpayees.montant.toLocaleString("fr-FR") + " € à encaisser",
    },
    {
      key: "chantiers",
      titre: "Chantiers en retard",
      valeur: String(data.chantiersEnRetard),
    },
    {
      key: "commandes",
      titre: "Commandes en attente",
      valeur: String(data.commandesEnAttente),
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titre}>Tableau de bord</Text>
      {cards.map((c) => (
        <TouchableOpacity
          key={c.key}
          style={styles.card}
          onPress={() => router.push(`/partie4/dashboard/${c.key}` as any)}
        >
          <Text style={styles.cardTitre}>{c.titre}</Text>
          <Text style={styles.cardValeur}>{c.valeur}</Text>
          {c.sous ? <Text style={styles.cardSous}>{c.sous}</Text> : null}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 60, backgroundColor: "#f4f6f8" },
  titre: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitre: { fontSize: 14, color: "#555" },
  cardValeur: { fontSize: 28, fontWeight: "700", marginTop: 4 },
  cardSous: { fontSize: 13, color: "#888", marginTop: 2 },
  error: { margin: 40, fontSize: 16 },
});