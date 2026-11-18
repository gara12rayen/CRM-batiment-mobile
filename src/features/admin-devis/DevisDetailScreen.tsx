import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { changerStatut, envoyerDevis, getDevis } from "./devis.service";
import { Devis, DevisStatut, STATUTS_SUIVANTS, totalDevis } from "./types";

export default function DevisDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const [d, setD] = useState<Devis | undefined>();
  const [erreur, setErreur] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    getDevis(id).then(setD);
  }, [id]);

  if (!d) return <Text style={{ margin: 60 }}>Chargement…</Text>;

  const agir = async (fn: () => Promise<Devis>, message: string) => {
    try {
      setErreur("");
      setD(await fn());
      setInfo(message);
    } catch (e: any) {
      setInfo("");
      setErreur(e.message);
    }
  };

  const suivants = STATUTS_SUIVANTS[d.statut].filter((s) => s !== "ENVOYE");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.retour}>← Retour</Text>
      </TouchableOpacity>
      <Text style={styles.titre}>
        {d.reference} – v{d.version}
      </Text>
      <Text style={styles.sous}>
        {d.client} · {d.date} · Statut : {d.statut}
      </Text>

      <View style={styles.card}>
        {d.lignes.map((l, i) => (
          <View key={i} style={styles.ligne}>
            <Text style={{ flex: 1 }}>
              {l.designation} ({l.quantite} × {l.prixUnitaire} €)
            </Text>
            <Text style={styles.bold}>{(l.quantite * l.prixUnitaire).toLocaleString("fr-FR")} €</Text>
          </View>
        ))}
        <Text style={styles.total}>Total : {totalDevis(d).toLocaleString("fr-FR")} €</Text>
      </View>

      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
      {info ? <Text style={styles.info}>{info}</Text> : null}

      <View style={styles.actions}>
        {d.statut === "BROUILLON" && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#2563eb" }]}
            onPress={() => agir(() => envoyerDevis(d.id), "Devis envoyé au client.")}
          >
            <Text style={styles.btnTxt}>Envoyer au client</Text>
          </TouchableOpacity>
        )}
        {suivants.map((s: DevisStatut) => (
          <TouchableOpacity
            key={s}
            style={[styles.btn, { backgroundColor: s === "REFUSE" ? "#dc2626" : "#16a34a" }]}
            onPress={() => agir(() => changerStatut(d.id, s), `Statut : ${s}`)}
          >
            <Text style={styles.btnTxt}>Passer à {s}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#6b7280" }]}
          onPress={() => setInfo("Génération du PDF : bientôt disponible.")}
        >
          <Text style={styles.btnTxt}>Voir le PDF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 60, backgroundColor: "#f4f6f8" },
  retour: { fontSize: 16, color: "#2563eb", marginBottom: 12 },
  titre: { fontSize: 22, fontWeight: "700" },
  sous: { color: "#666", marginTop: 4, marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  ligne: { flexDirection: "row", paddingVertical: 6 },
  bold: { fontWeight: "700" },
  total: { textAlign: "right", fontSize: 18, fontWeight: "700", marginTop: 10 },
  erreur: { color: "#dc2626", marginTop: 10 },
  info: { color: "#16a34a", marginTop: 10 },
  actions: { marginTop: 16, gap: 8 },
  btn: { paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  btnTxt: { color: "#fff", fontWeight: "600" },
});