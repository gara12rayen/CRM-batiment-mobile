import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getClient } from "./clients.service";
import { Client } from "./types";

export default function ClientDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const [c, setC] = useState<Client | undefined>();

  useFocusEffect(
    useCallback(() => {
      getClient(id).then(setC);
    }, [id])
  );

  if (!c) return <Text style={{ margin: 60 }}>Chargement…</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.retour}>← Retour</Text>
      </TouchableOpacity>
      <Text style={styles.titre}>{c.nom}</Text>
      <Text style={styles.type}>{c.type}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.val}>{c.email}</Text>
        <Text style={styles.label}>Téléphone</Text>
        <Text style={styles.val}>{c.telephone}</Text>
        <Text style={styles.label}>Adresse</Text>
        <Text style={styles.val}>{c.adresse}</Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push(`/partie4/clients/modifier/${c.id}` as any)}
      >
        <Text style={styles.btnTxt}>Modifier</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 60, backgroundColor: "#f4f6f8" },
  retour: { fontSize: 16, color: "#2563eb", marginBottom: 12 },
  titre: { fontSize: 24, fontWeight: "700" },
  type: { color: "#666", marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  label: { fontSize: 12, fontWeight: "700", color: "#777", marginTop: 8 },
  val: { fontSize: 15, marginTop: 2 },
  btn: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 16 },
  btnTxt: { color: "#fff", fontWeight: "600" },
});