import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ApiError, getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { envoyerOuMettreEnAttente } from "@/core/offline/fileEnvoi";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { ChoixPhotos } from "@/shared/media/ChoixPhotos";
import type { FichierLocal } from "@/shared/media/media.service";
import { NoteVocaleEnregistreur, type NoteVocale } from "@/shared/media/NoteVocaleEnregistreur";
import { fullName } from "@/shared/utils/format";
import { MAX_FICHIERS_PROSPECT, type DoublonClient, type NouveauContact } from "../models/ProspectTerrain";
import type { ProspectPayload } from "../services/prospectsTerrain.service";
import "../services/prospectsTerrain.service";

const TYPES: { value: NouveauContact["typeClient"]; label: string }[] = [
  { value: "PARTICULIER", label: "Particulier" },
  { value: "PROFESSIONNEL", label: "Professionnel" },
];

/** Someone met on a job site wants works: contact, need, photos, voice note → sales team. */
export function NouveauProspectView() {
  const router = useRouter();
  const [type, setType] = useState<NouveauContact["typeClient"]>("PARTICULIER");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");
  const [besoin, setBesoin] = useState("");
  const [photos, setPhotos] = useState<FichierLocal[]>([]);
  const [note, setNote] = useState<NoteVocale | null>(null);
  const [doublons, setDoublons] = useState<DoublonClient[] | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const contactOk = nom.trim().length > 0 && (telephone.trim().length >= 6 || /\S+@\S+\.\S+/.test(email.trim()));
  const pret = contactOk && besoin.trim().length >= 3 && !envoi;

  async function envoyer(choix: { clientId?: number; creerQuandMeme?: boolean } = {}) {
    setEnvoi(true);
    setErreur(null);
    const fichiers = [...photos, ...(note ? [note.fichier] : [])];
    const payload: ProspectPayload = {
      description: besoin.trim(),
      ...(choix.clientId
        ? { clientId: choix.clientId }
        : {
            client: {
              typeClient: type,
              nom: nom.trim(),
              prenom: type === "PARTICULIER" ? prenom.trim() || undefined : undefined,
              telephone: telephone.trim() || undefined,
              email: email.trim() || undefined,
              adresse: adresse.trim() || undefined,
            },
            creerQuandMeme: choix.creerQuandMeme,
          }),
      durees: [...photos.map(() => null), ...(note ? [note.dureeSecondes] : [])],
    };
    try {
      const r = await envoyerOuMettreEnAttente("PROSPECT_TERRAIN", `Prospect — ${[prenom, nom].filter(Boolean).join(" ")}`, payload, fichiers);
      Alert.alert(r === "envoye" ? "Prospect envoyé" : "Gardé sur le téléphone", r === "envoye" ? "Les commerciaux sont prévenus. Suivez-le dans « Mes prospects »." : "Pas de réseau : le prospect partira tout seul dès le retour du réseau.");
      router.back();
    } catch (e) {
      if (e instanceof ApiError && e.code === "CLIENT_EXISTANT") {
        const d = (e.details as { doublons?: DoublonClient[] } | undefined)?.doublons ?? [];
        setDoublons(d);
      } else {
        setErreur(getErrorMessage(e, "Le prospect n’a pas pu être envoyé."));
      }
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        <View style={styles.carte}>
          <Text style={styles.titre}>Contact</Text>
          <View style={styles.rangee}>
            {TYPES.map((t) => (
              <Pressable key={t.value} accessibilityRole="button" accessibilityState={{ selected: type === t.value }} onPress={() => setType(t.value)} style={[styles.puce, type === t.value && styles.puceActive]}>
                <Text style={[styles.puceTexte, type === t.value && styles.puceTexteActif]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
          <Champ label={type === "PROFESSIONNEL" ? "Nom de l’entreprise *" : "Nom *"} value={nom} onChange={setNom} />
          {type === "PARTICULIER" ? <Champ label="Prénom" value={prenom} onChange={setPrenom} /> : null}
          <Champ label="Téléphone" value={telephone} onChange={setTelephone} clavier="phone-pad" />
          <Champ label="Email" value={email} onChange={setEmail} clavier="email-address" />
          <Champ label="Adresse des travaux" value={adresse} onChange={setAdresse} />
          <Text style={styles.aide}>Un téléphone ou un email est obligatoire pour que le commercial rappelle.</Text>
        </View>

        <View style={styles.carte}>
          <Text style={styles.titre}>Besoin *</Text>
          <TextInput value={besoin} onChangeText={setBesoin} multiline maxLength={5000} placeholder="Ex. Refaire la salle de bain du 1er étage, environ 6 m²." placeholderTextColor={colors.text.muted} style={[styles.input, styles.zone]} accessibilityLabel="Besoin" />
          <NoteVocaleEnregistreur note={note} onChange={setNote} />
        </View>

        <View style={styles.carte}>
          <Text style={styles.titre}>Photos (facultatif)</Text>
          <ChoixPhotos photos={photos} onChange={setPhotos} max={MAX_FICHIERS_PROSPECT - (note ? 1 : 0)} />
        </View>

        {doublons ? (
          <View style={[styles.carte, styles.doublon]}>
            <Text style={styles.titre}>Ce contact existe peut-être déjà</Text>
            {doublons.map((d) => (
              <View key={d.id} style={styles.ligneDoublon}>
                <View style={styles.flex}>
                  <Text style={styles.nom}>{fullName(d) || d.nom}</Text>
                  <Text style={styles.aide}>Même {d.correspondances.map((c) => (c === "TELEPHONE" ? "téléphone" : "email")).join(" et ")}</Text>
                </View>
                <Pressable accessibilityRole="button" disabled={envoi} onPress={() => void envoyer({ clientId: d.id })} style={[styles.petit, styles.primaire]}>
                  <Text style={styles.primaireTexte}>C’est lui</Text>
                </Pressable>
              </View>
            ))}
            <Pressable accessibilityRole="button" disabled={envoi} onPress={() => void envoyer({ creerQuandMeme: true })} style={[styles.bouton, styles.outline]}>
              <Text style={styles.outlineTexte}>Non, c’est une autre personne : créer</Text>
            </Pressable>
          </View>
        ) : null}

        {erreur ? <ErrorMessage message={erreur} /> : null}
        {!doublons ? (
          <Pressable accessibilityRole="button" disabled={!pret} onPress={() => void envoyer()} style={[styles.bouton, styles.primaire, !pret && styles.dim]}>
            <Text style={styles.primaireTexte}>{envoi ? "Envoi…" : "Envoyer aux commerciaux"}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Champ({ label, value, onChange, clavier }: { label: string; value: string; onChange: (v: string) => void; clavier?: "phone-pad" | "email-address" }) {
  return (
    <View style={styles.champ}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} keyboardType={clavier ?? "default"} autoCapitalize={clavier === "email-address" ? "none" : "sentences"} style={styles.input} accessibilityLabel={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT },
  contenu: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },
  carte: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.lg, gap: spacing.sm },
  doublon: { borderColor: colors.status.warning, backgroundColor: "#FFFBEB" },
  titre: { fontSize: 15, fontWeight: "700", color: colors.text.DEFAULT },
  rangee: { flexDirection: "row", gap: spacing.sm },
  puce: { flex: 1, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: colors.border.DEFAULT, alignItems: "center" },
  puceActive: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
  puceTexte: { color: colors.text.DEFAULT, fontWeight: "600" },
  puceTexteActif: { color: colors.white },
  champ: { gap: 4 },
  label: { color: colors.text.muted, fontSize: 13 },
  input: { backgroundColor: colors.background.DEFAULT, borderColor: colors.border.DEFAULT, borderWidth: 1, borderRadius: 10, padding: spacing.md, color: colors.text.DEFAULT },
  zone: { minHeight: 110, textAlignVertical: "top" },
  aide: { color: colors.text.muted, fontSize: 12 },
  ligneDoublon: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm },
  flex: { flex: 1 },
  nom: { fontWeight: "600", color: colors.text.DEFAULT },
  petit: { borderRadius: 8, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  bouton: { borderRadius: 12, minHeight: 52, alignItems: "center", justifyContent: "center", padding: spacing.sm },
  primaire: { backgroundColor: colors.brand[700] },
  primaireTexte: { color: colors.white, fontWeight: "700" },
  outline: { borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.DEFAULT },
  outlineTexte: { color: colors.brand[700], fontWeight: "600" },
  dim: { opacity: 0.5 },
});
