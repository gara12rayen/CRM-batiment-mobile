import { useState } from "react";
import { Alert, Linking } from "react-native";
import { getErrorMessage } from "@/core/api/api-client";
import { actionsDisponibles, type DevisDetail } from "../models/Devis";
import { envoyerDevis, lienWhatsappDevis, refuserDevis, remettreDevis } from "../services/devis.service";
import { ouvrirPdfDevis } from "../services/devisPdf.service";

export type ActionDevis = "pdf" | "envoyer" | "remettre" | "whatsapp" | "refuser";

/**
 * Actions on a quote from the detail screen: PDF, send by email, WhatsApp, handed to the client,
 * refused by the client. One action at a time (buttons disabled while it runs); every answer of
 * the API is the updated quote, given back to the screen with onUpdate.
 */
export function useDevisActionsViewModel(devis: DevisDetail | null, onUpdate: (d: DevisDetail) => void) {
  const [enCours, setEnCours] = useState<ActionDevis | null>(null);
  const [refusOuvert, setRefusOuvert] = useState(false);

  const dispo = devis ? actionsDisponibles(devis) : null;

  async function lancer(action: ActionDevis, fn: () => Promise<void>): Promise<boolean> {
    if (enCours) return false;
    setEnCours(action);
    try {
      await fn();
      return true;
    } catch (e) {
      Alert.alert("Action impossible", getErrorMessage(e));
      return false;
    } finally {
      setEnCours(null);
    }
  }

  const ouvrirPdf = () => {
    if (!devis) return;
    void lancer("pdf", () => ouvrirPdfDevis(devis.id, devis.reference));
  };

  const envoyer = () => {
    if (!devis || !dispo?.envoyer) return;
    if (dispo.blocageEnvoi) {
      Alert.alert("Envoi impossible", dispo.blocageEnvoi);
      return;
    }
    Alert.alert("Envoyer le devis ?", `Le client recevra le PDF et un lien pour répondre à l’adresse ${devis.client.email}.`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Envoyer",
        onPress: () =>
          void lancer("envoyer", async () => {
            const res = await envoyerDevis(devis.id);
            onUpdate(res.devis);
            Alert.alert(
              "Devis envoyé",
              res.emailSent
                ? "Le client a reçu le devis par email."
                : "Le devis est marqué « Envoyé », mais l’email n’est pas parti (serveur mail non configuré). Utilisez WhatsApp ou renvoyez le lien depuis le site web.",
            );
          }),
      },
    ]);
  };

  const remettre = () => {
    if (!devis || !dispo?.remettre) return;
    if (dispo.blocageRemise) {
      Alert.alert("Action impossible", dispo.blocageRemise);
      return;
    }
    Alert.alert("Devis remis au client ?", "Le devis passe à « Envoyé » sans email (remis en main propre).", [
      { text: "Annuler", style: "cancel" },
      { text: "Confirmer", onPress: () => void lancer("remettre", async () => onUpdate(await remettreDevis(devis.id))) },
    ]);
  };

  const partagerWhatsapp = () => {
    if (!devis || !dispo?.whatsapp) return;
    if (dispo.blocageWhatsapp) {
      Alert.alert("WhatsApp impossible", dispo.blocageWhatsapp);
      return;
    }
    void lancer("whatsapp", async () => {
      const { lienWhatsapp } = await lienWhatsappDevis(devis.id);
      // wa.me opens the WhatsApp app if installed, the WhatsApp web page otherwise
      await Linking.openURL(lienWhatsapp);
    });
  };

  const confirmerRefus = async (motif: string) => {
    if (!devis || !motif.trim()) return;
    const ok = await lancer("refuser", async () => onUpdate(await refuserDevis(devis.id, motif)));
    if (ok) setRefusOuvert(false);
  };

  return {
    dispo,
    enCours,
    ouvrirPdf,
    envoyer,
    remettre,
    partagerWhatsapp,
    refusOuvert,
    ouvrirRefus: () => dispo?.refuser && setRefusOuvert(true),
    fermerRefus: () => !enCours && setRefusOuvert(false),
    confirmerRefus,
  };
}
