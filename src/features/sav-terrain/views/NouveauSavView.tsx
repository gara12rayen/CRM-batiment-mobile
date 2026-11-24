import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { envoyerOuMettreEnAttente } from "@/core/offline/fileEnvoi";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { Client } from "@/features/clients/models/Client";
import { getClients } from "@/features/clients/services/clients.service";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { ChoixPhotos } from "@/shared/media/ChoixPhotos";
import type { FichierLocal } from "@/shared/media/media.service";
import { formatDate, fullName } from "@/shared/utils/format";
import { MAX_PHOTOS_SAV, SAV_CATEGORIES, SAV_PRIORITES, type SavCategorie, type SavChantier, type SavPriorite } from "../models/Sav";
import { listSavChantiers, type SavPayload } from "../services/sav.service";

/**
 * New SAV ticket: job site (chef: his finished job sites; bureau: client then job site),
 * category, title, description, photos. Without network: kept and sent later.
 */
export function NouveauSavView({ chantierIdInitial }: { chantierIdInitial?: number }) {
  const router = useRouter();
  const { user } = useAuth();
  const chef = user?.role === "CHEF_CHANTIER";

  const [recherche, setRecherche] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [chantiers, setChantiers] = useState<SavChantier[] | null>(null);
  const [chantier, setChantier] = useState<SavChantier | null>(null);
  const [categorie, setCategorie] = useState<SavCategorie>("DEFAUT_TRAVAUX");
  const [priorite, setPriorite] = useState<SavPriorite>("NORMALE");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<FichierLocal[]>([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const chargerChantiers = useCallback(
    async (clientId?: number) => {
      setChantiers(null);
      setErreur(null);
      try {
        const r = await listSavChantiers(clientId);
        setChantiers(r.chantiers);
        const initial = r.chantiers.find((c) => c.id === chantierIdInitial && c.savPossible);
        if (initial) setChantier(initial);
      } catch (e) {
        setErreur(getErrorMessage(e, "Impossible de charger les chantiers."));
        setChantiers([]);
      }
    },
    [chantierIdInitial],
  );

  useEffect(() => {
    if (chef) void chargerChantiers();
  }, [chef, chargerChantiers]);

  // Bureau: search the client
  useEffect(() => {
    if (chef || client || recherche.trim().length < 2) {
      setClients([]);
      return;
    }
    const t = setTimeout(() => {
      getClients({ search: recherche, limit: 10 })
        .then((r) => setClients(r.data))
        .catch(() => setClients([]));
    }, 350);
    return () => clearTimeout(t);
  }, [recherche, chef, client]);

  const pret = !!chantier && titre.trim().length >= 3 && description.trim().length >= 3 && !envoi;

  async function envoyer() {
    if (!chantier) return;
    setEnvoi(true);
    setErreur(null);
    const payload: SavPayload = { clientId: chantier.client.id, chantierId: chantier.id, titre: titre.trim(), description: description.trim(), categorie, priorite };
    try {
      const r = await envoyerOuMettreEnAttente("SAV", `SAV — ${chantier.reference}`, payload, photos);
      Alert.alert(r === "envoye" ? "Ticket SAV créé" : "Gardé sur le téléphone", r === "envoye" ? "Le bureau est prévenu." : "Pas de réseau : le ticket partira tout seul dès le retour du réseau.");
      router.back();
    } catch (e) {
      setErreur(getErrorMessage(e, "Le ticket n’a pas pu être créé."));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        {!chef ? (
          <View style={styles.carte}>
            <Text style={styles.titre}>Client</Text>
            {client ? (
              <View style={styles.entre}>
                <Text style={styles.nom}>{fullName(client) || client.nom}</Text>
                <Pressable accessibilityRole="button" onPress={() => { setClient(null); setChantier(null); setChantiers(null); }} hitSlop={8}>
                  <Text style={styles.lien}>Changer</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <TextInput value={recherche} onChangeText={setRecherche} placeholder="Nom, téléphone, ville…" placeholderTextColor={colors.text.muted} style={styles.input} accessibilityLabel="Rechercher le client" />
                {clients.map((c) => (
                  <Pressable key={c.id} accessibilityRole="button" onPress={() => { setClient(c); void chargerChantiers(c.id); }} style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
                    <Text style={styles.nom}>{fullName(c) || c.nom}</Text>
                  </Pressable>
                ))}
              </>
            )}
          </View>
        ) : null}

        {chef || client ? (
          <View style={styles.carte}>
            <Text style={styles.titre}>Chantier concerné</Text>
            {!chantiers ? <ActivityIndicator /> : null}
            {chantiers && !chantiers.length ? <Text style={styles.muted}>Aucun chantier.</Text> : null}
            {chantiers?.map((c) => {
              const actif = chantier?.id === c.id;
              return (
                <Pressable key={c.id} accessibilityRole="button" accessibilityState={{ selected: actif, disabled: !c.savPossible }} disabled={!c.savPossible} onPress={() => setChantier(c)} style={[styles.option, actif && styles.optionActive, !c.savPossible && styles.dim]}>
                  <Text style={[styles.nom, actif && styles.blanc]}>
                    {c.reference} — {fullName(c.client) || c.client.nom}
                  </Text>
                  <Text style={[styles.muted, actif && styles.blanc]}>{c.savPossible ? `SAV possible jusqu’au ${formatDate(c.savJusquau)}` : c.savMotif ?? "SAV impossible pour ce chantier"}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.carte}>
          <Text style={styles.titre}>Problème</Text>
          <View style={styles.puces}>
            {SAV_CATEGORIES.map((c) => (
              <Pressable key={c.value} accessibilityRole="button" accessibilityState={{ selected: categorie === c.value }} onPress={() => setCategorie(c.value)} style={[styles.puce, categorie === c.value && styles.puceActive]}>
                <Text style={[styles.puceTexte, categorie === c.value && styles.blanc]}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Titre *</Text>
          <TextInput value={titre} onChangeText={setTitre} maxLength={200} placeholder="Ex. Fuite sous le lavabo" placeholderTextColor={colors.text.muted} style={styles.input} accessibilityLabel="Titre" />
          <Text style={styles.label}>Description *</Text>
          <TextInput value={description} onChangeText={setDescription} multiline maxLength={5000} style={[styles.input, styles.zone]} accessibilityLabel="Description" />
          <Text style={styles.label}>Priorité</Text>
          <View style={styles.puces}>
            {SAV_PRIORITES.map((p) => (
              <Pressable key={p.value} accessibilityRole="button" accessibilityState={{ selected: priorite === p.value }} onPress={() => setPriorite(p.value)} style={[styles.puce, priorite === p.value && styles.puceActive]}>
                <Text style={[styles.puceTexte, priorite === p.value && styles.blanc]}>{p.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.carte}>
          <Text style={styles.titre}>Photos (facultatif)</Text>
          <ChoixPhotos photos={photos} onChange={setPhotos} max={MAX_PHOTOS_SAV} />
        </View>

        {erreur ? <ErrorMessage message={erreur} /> : null}
        <Pressable accessibilityRole="button" disabled={!pret} onPress={() => void envoyer()} style={[styles.bouton, !pret && styles.dim]}>
          <Text style={styles.boutonTexte}>{envoi ? "Envoi…" : "Créer le ticket SAV"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT },
  contenu: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },
  carte: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.lg, gap: spacing.sm },
  titre: { fontSize: 15, fontWeight: "700", color: colors.text.DEFAULT },
  entre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  nom: { fontWeight: "600", color: colors.text.DEFAULT },
  muted: { color: colors.text.muted, fontSize: 12 },
  lien: { color: colors.brand[700], fontWeight: "700" },
  label: { color: colors.text.muted, fontSize: 13 },
  input: { backgroundColor: colors.background.DEFAULT, borderColor: colors.border.DEFAULT, borderWidth: 1, borderRadius: 10, padding: spacing.md, color: colors.text.DEFAULT },
  zone: { minHeight: 110, textAlignVertical: "top" },
  option: { padding: spacing.md, borderRadius: 10, borderWidth: 1, borderColor: colors.border.DEFAULT, gap: 2 },
  optionActive: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
  pressed: { opacity: 0.7 },
  blanc: { color: colors.white },
  puces: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  puce: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border.DEFAULT },
  puceActive: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
  puceTexte: { color: colors.text.DEFAULT, fontWeight: "600", fontSize: 13 },
  bouton: { backgroundColor: colors.brand[700], borderRadius: 12, minHeight: 52, alignItems: "center", justifyContent: "center" },
  boutonTexte: { color: colors.white, fontWeight: "700", fontSize: 15 },
  dim: { opacity: 0.5 },
});
