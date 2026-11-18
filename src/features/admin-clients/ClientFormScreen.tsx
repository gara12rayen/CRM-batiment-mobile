import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { creerClient, getClient, modifierClient } from "./clients.service";
import { CLIENT_VIDE, ClientForm, validerClient } from "./types";

export default function ClientFormScreen({ id }: { id?: string }) {
  const router = useRouter();
  const [f, setF] = useState<ClientForm>(CLIENT_VIDE);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    if (id) {
      getClient(id).then((c) => {
        if (c) {
          const { id: _i, ...reste } = c;
          setF(reste);
        }
      });
    }
  }, [id]);

  const maj = (k: keyof ClientForm, v: string) => setF((p) => ({ ...p, [k]: v } as ClientForm));

  const enregistrer = async () => {
    const err = validerClient(f);
    if (err) return setErreur(err);
    try {
      if (id) await modifierClient(id, f);
      else await creerClient(f);
      router.back();
    } catch (e: any) {
      setErreur(e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.retour}>← Retour</Text>
      </TouchableOpacity>
      <Text style={styles.titre}>{id ? "Modifier le client" : "Nouveau client"}</Text>

      <Text style={styles.label}>Nom</Text>
      <TextInput style={styles.input} value={f.nom} onChangeText={(v) => maj("nom", v)} />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={f.email} onChangeText={(v) => maj("email", v)} autoCapitalize="none" keyboardType="email-address" />
      <Text style={styles.label}>Téléphone</Text>
      <TextInput style={styles.input} value={f.telephone} onChangeText={(v) => maj("telephone", v)} keyboardType="phone-pad" />
      <Text style={styles.label}>Adresse</Text>
      <TextInput style={styles.input} value={f.adresse} onChangeText={(v) => maj("adresse", v)} />

      <Text style={styles.label}>Type</Text>
      <View style={styles.types}>
        {(["PARTICULIER", "ENTREPRISE"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, f.type === t && styles.chipActive]}
            onPress={() => maj("type", t)}
          >
            <Text style={[styles.chipTxt, f.type === t && { color: "#fff" }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}

      <TouchableOpacity style={styles.btn} onPress={enregistrer}>
        <Text style={styles.btnTxt}>Enregistrer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 60, backgroundColor: "#f4f6f8" },
  retour: { fontSize: 16, color: "#2563eb", marginBottom: 12 },
  titre: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "600", color: "#555", marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 10 },
  types: { flexDirection: "row", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: "#e5e7eb" },
  chipActive: { backgroundColor: "#2563eb" },
  chipTxt: { fontSize: 12, fontWeight: "600", color: "#374151" },
  erreur: { color: "#dc2626", marginTop: 12 },
  btn: { backgroundColor: "#16a34a", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 20 },
  btnTxt: { color: "#fff", fontWeight: "600" },
});
