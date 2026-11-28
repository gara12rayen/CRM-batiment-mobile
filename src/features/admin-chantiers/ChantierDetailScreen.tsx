import React, { useCallback, useState } from "react";
import {
  Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getChantier, modifierChantier } from "./chantiers.service";
import { Chantier, ChantierStatut, STATUTS, avancement, enRetard } from "./types";

export default function ChantierDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const [c, setC] = useState<Chantier | undefined>();
  const [statut, setStatut] = useState<ChantierStatut>("PLANIFIE");
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [erreur, setErreur] = useState("");
  const [info, setInfo] = useState("");

  const charger = (x?: Chantier) => {
    if (!x) return;
    setC(x);
    setStatut(x.statut);
    setDebut(x.dateDebut);
    setFin(x.dateFinPrevue);
  };

  useFocusEffect(
    useCallback(() => {
      getChantier(id).then(charger);
    }, [id])
  );

  if (!c) return <Text style={{ margin: 60 }}>Chargement…</Text>;

  const enregistrer = async () => {
    try {
      setErreur("");
      charger(await modifierChantier(c.id, statut, debut, fin));
      setInfo("Modifications enregistrées.");
    } catch (e: any) {
      setInfo("");
      setErreur(e.message);
    }
  };

  const pct = avancement(c);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.retour}>← Retour</Text>
      </TouchableOpacity>
      <Text style={styles.titre}>{c.nom}</Text>
      <Text style={styles.sous}>{c.client} · {c.adresse}</Text>
      {enRetard(c) && <Text style={styles.retard}>⚠ Chantier en retard</Text>}

      <View style={styles.card}>
        <Text style={styles.h}>Avancement : {pct} %</Text>
        <View style={styles.barre}>
          <View style={[styles.barreRempli, { width: `${pct}%` }]} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.h}>Tâches</Text>
        {c.taches.length === 0 && <Text style={styles.vide}>Aucune tâche.</Text>}
        {c.taches.map((t) => (
          <Text key={t.id} style={styles.item}>
            {t.faite ? "✅" : "⬜"} {t.titre}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.h}>Photos</Text>
        {c.photos.length === 0 && <Text style={styles.vide}>Aucune photo.</Text>}
        <ScrollView horizontal>
          {c.photos.map((p, i) => (
            <Image key={i} source={{ uri: p }} style={styles.photo} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.card}>
        <Text style={styles.h}>Rapports</Text>
        {c.rapports.length === 0 && <Text style={styles.vide}>Aucun rapport.</Text>}
        {c.rapports.map((r) => (
          <View key={r.id} style={{ marginBottom: 8 }}>
            <Text style={styles.rapportMeta}>{r.date} · {r.auteur}</Text>
            <Text>{r.texte}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.h}>Modifier statut et dates</Text>
        <View style={styles.chips}>
          {STATUTS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, statut === s && styles.chipActive]}
              onPress={() => setStatut(s)}
            >
              <Text style={[styles.chipTxt, statut === s && { color: "#fff" }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Date de début (JJ/MM/AAAA)</Text>
        <TextInput style={styles.input} value={debut} onChangeText={setDebut} />
        <Text style={styles.label}>Date de fin prévue (JJ/MM/AAAA)</Text>
        <TextInput style={styles.input} value={fin} onChangeText={setFin} />
        {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}
        <TouchableOpacity style={styles.btn} onPress={enregistrer}>
          <Text style={styles.btnTxt}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 60, backgroundColor: "#f4f6f8" },
  retour: { fontSize: 16, color: "#2563eb", marginBottom: 12 },
  titre: { fontSize: 22, fontWeight: "700" },
  sous: { color: "#666", marginTop: 4, marginBottom: 8 },
  retard: { color: "#dc2626", fontWeight: "700", marginBottom: 8 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12 },
  h: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  vide: { color: "#888" },
  item: { fontSize: 14, marginBottom: 4 },
  barre: { height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden" },
  barreRempli: { height: 8, backgroundColor: "#16a34a" },
  photo: { width: 140, height: 100, borderRadius: 8, marginRight: 8, backgroundColor: "#eee" },
  rapportMeta: { fontSize: 12, color: "#777" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: "#e5e7eb" },
  chipActive: { backgroundColor: "#2563eb" },
  chipTxt: { fontSize: 12, fontWeight: "600", color: "#374151" },
  label: { fontSize: 13, fontWeight: "600", color: "#555", marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 10 },
  erreur: { color: "#dc2626", marginTop: 10 },
  info: { color: "#16a34a", marginTop: 10 },
  btn: { backgroundColor: "#16a34a", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 14 },
  btnTxt: { color: "#fff", fontWeight: "600" },
});