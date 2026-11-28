import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  attribuerInstallateur, cloturer, getInstallateurs, getInstallation, relancer,
} from "./installations.service";
import { Installateur, Installation, labelEtape, livraisonEnRetard } from "./types";

export default function InstallationDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const [i, setI] = useState<Installation | undefined>();
  const [installateurs, setInstallateurs] = useState<Installateur[]>([]);
  const [erreur, setErreur] = useState("");
  const [info, setInfo] = useState("");

  useFocusEffect(
    useCallback(() => {
      getInstallation(id).then(setI);
      getInstallateurs().then(setInstallateurs);
    }, [id])
  );

  if (!i) return <Text style={{ margin: 60 }}>Chargement…</Text>;

  const agir = async (fn: () => Promise<Installation>, message: string) => {
    try {
      setErreur("");
      setI(await fn());
      setInfo(message);
    } catch (e: any) {
      setInfo("");
      setErreur(e.message);
    }
  };

  const retard = livraisonEnRetard(i);
  const cloture = i.etape === "CLOTURE";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.retour}>← Retour</Text>
      </TouchableOpacity>
      <Text style={styles.titre}>{i.chantier}</Text>
      <Text style={styles.sous}>{i.client} · Étape : {labelEtape(i.etape)}</Text>

      {retard && (
        <View style={styles.alerte}>
          <Text style={styles.alerteTxt}>
            ⚠ Livraison prévue le {i.dateLivraisonPrevue} : elle retarde l'installation.
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.h}>Installateur</Text>
        {installateurs.map((x) => {
          const actif = i.installateurId === x.id;
          return (
            <TouchableOpacity
              key={x.id}
              disabled={cloture}
              style={[styles.inst, actif && styles.instActif]}
              onPress={() =>
                agir(() => attribuerInstallateur(i.id, x.id), `Installateur attribué : ${x.nom}`)
              }
            >
              <Text style={[styles.instNom, actif && { color: "#fff" }]}>{x.nom}</Text>
              <Text style={[styles.instNote, actif && { color: "#fff" }]}>★ {x.note.toFixed(1)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.h}>Dates</Text>
        <Text>Livraison prévue : {i.dateLivraisonPrevue}</Text>
        <Text>Installation prévue : {i.dateInstallationPrevue}</Text>
        <Text style={{ marginTop: 6 }}>PV signé : {i.pvSigne ? "✅ Oui" : "⬜ Non"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.h}>Chronologie</Text>
        {i.chronologie.map((e) => (
          <Text key={e.id} style={styles.evt}>
            {e.date} · {e.texte}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.h}>Problèmes signalés</Text>
        {i.problemes.length === 0 && <Text style={{ color: "#888" }}>Aucun problème.</Text>}
        {i.problemes.map((p, k) => (
          <Text key={k} style={styles.evt}>• {p}</Text>
        ))}
      </View>

      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
      {info ? <Text style={styles.info}>{info}</Text> : null}

      {!cloture && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#d97706" }]}
            onPress={() => agir(() => relancer(i.id), "Relance envoyée.")}
          >
            <Text style={styles.btnTxt}>Relancer l'installateur</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: i.pvSigne ? "#16a34a" : "#9ca3af" }]}
            onPress={() => agir(() => cloturer(i.id), "Installation clôturée.")}
          >
            <Text style={styles.btnTxt}>Clôturer</Text>
          </TouchableOpacity>
          {!i.pvSigne && <Text style={styles.aide}>La clôture est possible seulement après le PV signé.</Text>}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 60, backgroundColor: "#f4f6f8" },
  retour: { fontSize: 16, color: "#2563eb", marginBottom: 12 },
  titre: { fontSize: 22, fontWeight: "700" },
  sous: { color: "#666", marginTop: 4, marginBottom: 10 },
  alerte: { backgroundColor: "#fee2e2", padding: 12, borderRadius: 8, marginBottom: 10 },
  alerteTxt: { color: "#b91c1c", fontWeight: "600" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12 },
  h: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  inst: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderRadius: 8, backgroundColor: "#f3f4f6", marginBottom: 6 },
  instActif: { backgroundColor: "#2563eb" },
  instNom: { fontWeight: "600" },
  instNote: { color: "#b45309", fontWeight: "700" },
  evt: { fontSize: 14, marginBottom: 4 },
  erreur: { color: "#dc2626", marginBottom: 8 },
  info: { color: "#16a34a", marginBottom: 8 },
  actions: { gap: 8 },
  btn: { paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  btnTxt: { color: "#fff", fontWeight: "600" },
  aide: { color: "#888", fontSize: 12, textAlign: "center" },
});