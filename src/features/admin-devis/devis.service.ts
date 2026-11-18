import { devisMock } from "./devis.mock";
import { Devis, DevisStatut, STATUTS_SUIVANTS } from "./types";

const wait = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// Copie en mémoire (mocks). Mn b3d: apiClient.get / patch / post
let devisStore: Devis[] = devisMock.map((d) => ({ ...d }));

export async function getDevisList(): Promise<Devis[]> {
  await wait();
  return devisStore.map((d) => ({ ...d }));
}

export async function getDevis(id: string): Promise<Devis | undefined> {
  await wait(150);
  const d = devisStore.find((x) => x.id === id);
  return d ? { ...d } : undefined;
}

export async function changerStatut(id: string, statut: DevisStatut): Promise<Devis> {
  await wait(200);
  const d = devisStore.find((x) => x.id === id);
  if (!d) throw new Error("Devis introuvable");
  if (!STATUTS_SUIVANTS[d.statut].includes(statut)) {
    throw new Error("Changement de statut non autorisé");
  }
  if (statut === "ENVOYE" && d.lignes.length === 0) {
    throw new Error("Devis sans lignes");
  }
  d.statut = statut;
  return { ...d };
}

export async function envoyerDevis(id: string): Promise<Devis> {
  // mn b3d: POST /devis/:id/envoyer (email ou WhatsApp)
  return changerStatut(id, "ENVOYE");
}