import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/core/api/api-client";
import { nouvelleCleIdempotence } from "@/core/api/idempotency";
import { DEVIS_REGLES, type DevisDetail } from "@/features/devis/models/Devis";
import { getDevis } from "@/features/devis/services/devis.service";
import { positionActuelle } from "@/shared/media/media.service";
import { demanderSignatureEmail, enregistrerMaSignature, getMaSignature, signerSurPlace } from "../services/signature.service";
import { fullName } from "@/shared/utils/format";

export type PadOuvert = "conseiller" | "client" | null;

/**
 * Signature on site: summary of the quote, advisor signature (from the profile, or signed now),
 * client signature + name, optional GPS position, then POST …/signer-sur-place.
 */
export function useSignatureSurPlaceViewModel(id: number) {
  const [devis, setDevis] = useState<DevisDetail | null>(null);
  const [signatureConseiller, setSignatureConseiller] = useState<string | null>(null);
  const [signatureClient, setSignatureClient] = useState<string | null>(null);
  const [nomSignataire, setNomSignataire] = useState("");
  const [pad, setPad] = useState<PadOuvert>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrementConseiller, setEnregistrementConseiller] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [envoiEmail, setEnvoiEmail] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [signe, setSigne] = useState<DevisDetail | null>(null);
  /** One key for the whole signature: a retry after a network cut cannot sign twice */
  const cle = useRef(nouvelleCleIdempotence());

  const charger = useCallback(async () => {
    setLoading(true);
    setErreur(null);
    try {
      const [d, s] = await Promise.all([getDevis(id), getMaSignature()]);
      setDevis(d);
      setSignatureConseiller(s.signatureBase64);
      setNomSignataire((n) => n || fullName(d.client));
    } catch (e) {
      setErreur(getErrorMessage(e, "Impossible de charger le devis."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const signable = !!devis && DEVIS_REGLES.signableSurPlace.includes(devis.statut);
  const nomValide = nomSignataire.trim().length > 0 && nomSignataire.trim().length <= 150;
  const pret = signable && !!signatureConseiller && !!signatureClient && nomValide && !envoi;

  /** The advisor signs (first time or again): saved in his profile right away. */
  async function validerConseiller(png: string) {
    setPad(null);
    setEnregistrementConseiller(true);
    setErreur(null);
    try {
      await enregistrerMaSignature(png);
      setSignatureConseiller(png);
    } catch (e) {
      setErreur(getErrorMessage(e, "Votre signature n’a pas pu être enregistrée."));
    } finally {
      setEnregistrementConseiller(false);
    }
  }

  function validerClient(png: string) {
    setPad(null);
    setSignatureClient(png);
  }

  async function signer() {
    if (!pret || !devis) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const gps = await positionActuelle();
      const resultat = await signerSurPlace(
        devis.id,
        { signatureClientBase64: signatureClient as string, nomSignataire: nomSignataire.trim(), ...(gps ?? {}) },
        cle.current,
      );
      setSigne(resultat);
    } catch (e) {
      setErreur(getErrorMessage(e, "La signature n’a pas pu être enregistrée."));
    } finally {
      setEnvoi(false);
    }
  }

  /** Quote ACCEPTE: the client signs later from the link received by email. */
  async function envoyerLienEmail() {
    if (!devis) return;
    setEnvoiEmail(true);
    setErreur(null);
    setMessage(null);
    try {
      const r = await demanderSignatureEmail(devis.id);
      setMessage(r.emailSent ? `Lien de signature envoyé à ${devis.client.email ?? "l’adresse du client"}.` : "Lien créé, mais l’email n’est pas parti. Réessayez plus tard.");
    } catch (e) {
      setErreur(getErrorMessage(e, "Le lien n’a pas pu être envoyé."));
    } finally {
      setEnvoiEmail(false);
    }
  }

  return {
    devis,
    loading,
    erreur,
    message,
    signable,
    signatureConseiller,
    signatureClient,
    setSignatureClient,
    nomSignataire,
    setNomSignataire,
    nomValide,
    pad,
    setPad,
    setErreur,
    enregistrementConseiller,
    validerConseiller,
    validerClient,
    pret,
    envoi,
    signer,
    signe,
    envoiEmail,
    envoyerLienEmail,
    peutLienEmail: devis?.statut === "ACCEPTE" && !!devis.client.email,
    recharger: charger,
  };
}
