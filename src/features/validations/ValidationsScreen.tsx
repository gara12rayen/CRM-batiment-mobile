import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useValidationsViewModel } from "./useValidationsViewModel";
import { ValidationTab } from "./types";

const TABS: { key: ValidationTab; label: string }[] = [
  { key: "signatures", label: "Signatures" },
  { key: "commandes", label: "Commandes" },
  { key: "factures", label: "Factures" },
];

export default function ValidationsScreen() {
  const vm = useValidationsViewModel();
  const [refusId, setRefusId] = useState<string | null>(null);
  const [motif, setMotif] = useState("");
  const [erreur, setErreur] = useState("");

  const envoyerRefus = async (id: string) => {
    if (!motif.trim()) {
      setErreur("Le motif du refus est obligatoire.");
      return;
    }
    await vm.refuser(id, motif);
    setRefusId(null);
    setMotif("");
    setErreur("");
  };

  const compteur = (k: ValidationTab) =>
    k === "signatures" ? vm.signatures.length : k === "commandes" ? vm.commandes.length : vm.factures.length;

  return (
    <View style={styles.page}>
      <Text style={styles.titre}>Validations</Text>

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, vm.tab === t.key && styles.tabActive]}
            onPress={() => vm.setTab(t.key)}
          >
            <Text style={[styles.tabTxt, vm.tab === t.key && styles.tabTxtActive]}>
              {t.label} ({compteur(t.key)})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {vm.isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {vm.tab === "signatures" &&
            (vm.signatures.length === 0 ? (
              <Text style={styles.vide}>Aucune signature à vérifier.</Text>
            ) : (
              vm.signatures.map((s) => (
                <View key={s.id} style={styles.card}>
                  <Text style={styles.ref}>
                    {s.reference} – v{s.version}
                  </Text>
                  <Text style={styles.sous}>
                    {s.client} · {s.montant.toLocaleString("fr-FR")} €
                  </Text>
                  <Text style={styles.alerte}>⚠ {s.motifAlerte}</Text>

                  <View style={styles.compare}>
                    <View style={styles.col}>
                      <Text style={styles.colTitre}>Scan signé</Text>
                      <Image source={{ uri: s.scanUrl }} style={styles.scan} resizeMode="contain" />
                    </View>
                    <View style={styles.col}>
                      <Text style={styles.colTitre}>Devis</Text>
                      {s.lignesDevis.map((l, i) => (
                        <Text key={i} style={styles.ligne}>
                          • {l.designation}
                        </Text>
                      ))}
                    </View>
                  </View>

                  {refusId === s.id ? (
                    <View>
                      <TextInput
                        style={styles.input}
                        placeholder="Motif du refus (obligatoire)"
                        value={motif}
                        onChangeText={setMotif}
                        multiline
                      />
                      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
                      <View style={styles.actions}>
                        <TouchableOpacity
                          style={[styles.btn, styles.btnRefus]}
                          onPress={() => envoyerRefus(s.id)}
                        >
                          <Text style={styles.btnTxt}>Envoyer le refus</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.btn, styles.btnGris]}
                          onPress={() => {
                            setRefusId(null);
                            setMotif("");
                            setErreur("");
                          }}
                        >
                          <Text style={styles.btnTxt}>Annuler</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.btn, styles.btnOk]}
                        onPress={() => vm.confirmer(s.id)}
                      >
                        <Text style={styles.btnTxt}>Confirmer</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btn, styles.btnRefus]}
                        onPress={() => setRefusId(s.id)}
                      >
                        <Text style={styles.btnTxt}>Refuser</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            ))}

          {vm.tab === "commandes" &&
            (vm.commandes.length === 0 ? (
              <Text style={styles.vide}>Aucune commande à valider.</Text>
            ) : (
              vm.commandes.map((c) => (
                <View key={c.id} style={styles.card}>
                  <Text style={styles.ref}>
                    {c.reference} · {c.fournisseur}
                  </Text>
                  <Text style={styles.sous}>
                    {c.chantier} · {c.montant.toLocaleString("fr-FR")} €
                  </Text>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.btn, styles.btnOk]}
                      onPress={() => vm.valider(c.id)}
                    >
                      <Text style={styles.btnTxt}>Valider</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ))}

          {vm.tab === "factures" &&
            (vm.factures.length === 0 ? (
              <Text style={styles.vide}>Aucune facture en attente.</Text>
            ) : (
              vm.factures.map((f) => (
                <View key={f.id} style={styles.card}>
                  <Text style={styles.ref}>{f.reference}</Text>
                  <Text style={styles.sous}>
                    {f.client} · {f.montant.toLocaleString("fr-FR")} € · échéance {f.echeance}
                  </Text>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.btn, styles.btnOk]}
                      onPress={() => vm.marquerPayee(f.id)}
                    >
                      <Text style={styles.btnTxt}>Marquer payée</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f4f6f8", paddingTop: 60 },
  titre: { fontSize: 24, fontWeight: "700", paddingHorizontal: 16, marginBottom: 12 },
  tabs: { flexDirection: "row", paddingHorizontal: 16, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: "#e5e7eb", alignItems: "center" },
  tabActive: { backgroundColor: "#2563eb" },
  tabTxt: { fontSize: 12, color: "#374151", fontWeight: "600" },
  tabTxtActive: { color: "#fff" },
  vide: { color: "#888", marginTop: 20, textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
  ref: { fontSize: 16, fontWeight: "700" },
  sous: { fontSize: 13, color: "#666", marginTop: 2 },
  alerte: { color: "#b45309", marginTop: 6, fontSize: 13 },
  compare: { flexDirection: "row", gap: 12, marginTop: 12 },
  col: { flex: 1 },
  colTitre: { fontSize: 12, fontWeight: "700", color: "#555", marginBottom: 6 },
  scan: { width: "100%", height: 180, backgroundColor: "#eee", borderRadius: 6 },
  ligne: { fontSize: 13, marginBottom: 4 },
  actions: { flexDirection: "row", gap: 8, marginTop: 14 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  btnOk: { backgroundColor: "#16a34a" },
  btnRefus: { backgroundColor: "#dc2626" },
  btnGris: { backgroundColor: "#6b7280" },
  btnTxt: { color: "#fff", fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 10, marginTop: 12, minHeight: 60 },
  erreur: { color: "#dc2626", marginTop: 6, fontSize: 13 },
});