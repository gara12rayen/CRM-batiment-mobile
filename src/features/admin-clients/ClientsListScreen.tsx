import React, { useCallback } from "react";
import {
  ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useClientsViewModel } from "./useClientsViewModel";

export default function ClientsListScreen() {
  const router = useRouter();
  const vm = useClientsViewModel();

  // recharge la liste quand on revient d'une création/modification
  useFocusEffect(
    useCallback(() => {
      vm.reload();
    }, [])
  );

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.titre}>Clients</Text>
        <TouchableOpacity style={styles.btnAdd} onPress={() => router.push("/partie4/clients/nouveau" as any)}>
          <Text style={styles.btnTxt}>+ Nouveau</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Rechercher (nom, email, téléphone)"
        value={vm.recherche}
        onChangeText={vm.setRecherche}
      />

      {vm.isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {vm.liste.length === 0 && <Text style={styles.vide}>Aucun client.</Text>}
          {vm.liste.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.card}
              onPress={() => router.push(`/partie4/clients/${c.id}` as any)}
            >
              <Text style={styles.nom}>{c.nom}</Text>
              <Text style={styles.sous}>{c.email} · {c.telephone}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f4f6f8", paddingTop: 60 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16 },
  titre: { fontSize: 24, fontWeight: "700" },
  btnAdd: { backgroundColor: "#2563eb", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  btnTxt: { color: "#fff", fontWeight: "600" },
  input: { backgroundColor: "#fff", margin: 16, marginBottom: 0, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#d1d5db" },
  vide: { color: "#888", textAlign: "center", marginTop: 20 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10, elevation: 1 },
  nom: { fontSize: 16, fontWeight: "700" },
  sous: { fontSize: 13, color: "#666", marginTop: 2 },
});