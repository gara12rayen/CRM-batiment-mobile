import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { SignaturePad } from "@/shared/components/SignaturePad";
import { enregistrerMaSignature, getMaSignature } from "../services/signature.service";

/** Profile → « Ma signature » : shown on the quotes signed on site. Can be signed again at any time. */
export function MaSignatureView() {
  const [signature, setSignature] = useState<string | null>(null);
  const [miseAJour, setMiseAJour] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pad, setPad] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setLoading(true);
    setErreur(null);
    try {
      const s = await getMaSignature();
      setSignature(s.signatureBase64);
      setMiseAJour(s.signatureUpdatedAt);
    } catch (e) {
      setErreur(getErrorMessage(e, "Impossible de charger votre signature."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  async function valider(png: string) {
    setPad(false);
    setEnregistrement(true);
    setErreur(null);
    setMessage(null);
    try {
      const r = await enregistrerMaSignature(png);
      setSignature(png);
      setMiseAJour(r.signatureUpdatedAt);
      setMessage("Signature enregistrée.");
    } catch (e) {
      setErreur(getErrorMessage(e, "La signature n’a pas pu être enregistrée."));
    } finally {
      setEnregistrement(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator size="large" color={colors.brand[700]} />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.page} contentContainerStyle={styles.contenu}>
        <View style={styles.carte}>
          <Text style={styles.titre}>Ma signature</Text>
          <Text style={styles.muted}>Elle est ajoutée aux devis que vos clients signent sur votre téléphone.</Text>
          {signature ? (
            <>
              <Image source={{ uri: signature }} style={styles.apercu} resizeMode="contain" accessibilityLabel="Votre signature" />
              {miseAJour ? <Text style={styles.muted}>Mise à jour le {new Date(miseAJour).toLocaleDateString("fr-FR")}</Text> : null}
            </>
          ) : (
            <Text style={styles.vide}>Aucune signature enregistrée.</Text>
          )}
          <Pressable accessibilityRole="button" disabled={enregistrement} onPress={() => setPad(true)} style={[styles.bouton, enregistrement && styles.dim]}>
            <Text style={styles.boutonTexte}>{enregistrement ? "Enregistrement…" : signature ? "Signer à nouveau" : "Signer"}</Text>
          </Pressable>
        </View>
        {erreur ? <ErrorMessage message={erreur} /> : null}
        {message ? <Text style={styles.info}>{message}</Text> : null}
      </ScrollView>
      <SignaturePad visible={pad} titre="Votre signature" onFermer={() => setPad(false)} onValider={(png) => void valider(png)} onErreur={setErreur} />
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background.DEFAULT },
  contenu: { padding: spacing.lg, gap: spacing.md },
  centre: { flex: 1, alignItems: "center", justifyContent: "center" },
  carte: { backgroundColor: colors.surface.DEFAULT, borderRadius: 14, borderWidth: 1, borderColor: colors.border.DEFAULT, padding: spacing.lg, gap: spacing.md },
  titre: { fontSize: 18, fontWeight: "700", color: colors.text.DEFAULT },
  muted: { color: colors.text.muted, fontSize: 13 },
  vide: { color: colors.text.muted, fontStyle: "italic" },
  apercu: { height: 140, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: 10 },
  bouton: { backgroundColor: colors.brand[700], borderRadius: 10, padding: spacing.md, alignItems: "center" },
  boutonTexte: { color: colors.white, fontWeight: "700" },
  dim: { opacity: 0.5 },
  info: { color: colors.status.success, fontWeight: "600" },
});
