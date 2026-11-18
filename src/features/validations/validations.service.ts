import { commandesMock, facturesMock, signaturesMock } from "./validations.mock";
import {
  CommandeAValider,
  FactureAMarquerPayee,
  SignatureAVerifier,
} from "./types";

const wait = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// Daba: mocks. Mn b3d: apiClient.get / post
export async function getSignatures(): Promise<SignatureAVerifier[]> {
  await wait();
  return [...signaturesMock];
}

export async function getCommandes(): Promise<CommandeAValider[]> {
  await wait();
  return [...commandesMock];
}

export async function getFactures(): Promise<FactureAMarquerPayee[]> {
  await wait();
  return [...facturesMock];
}

export async function confirmerSignature(id: string): Promise<void> {
  await wait(200); // mn b3d: POST /devis/:id/signature/confirmer
}

export async function refuserSignature(id: string, motif: string): Promise<void> {
  if (!motif.trim()) throw new Error("Motif obligatoire");
  await wait(200); // mn b3d: POST /devis/:id/signature/refuser
}

export async function validerCommande(id: string): Promise<void> {
  await wait(200);
}

export async function marquerFacturePayee(id: string): Promise<void> {
  await wait(200);
}
