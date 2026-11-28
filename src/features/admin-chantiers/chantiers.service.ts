import { chantiersMock } from "./chantiers.mock";
import { Chantier, ChantierStatut, parseDate } from "./types";

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// Mocks en mémoire. Mn b3d: apiClient.get / patch
let store: Chantier[] = chantiersMock.map((c) => ({ ...c }));

export async function getChantiers(): Promise<Chantier[]> {
  await wait();
  return store.map((c) => ({ ...c }));
}

export async function getChantier(id: string): Promise<Chantier | undefined> {
  await wait(150);
  const c = store.find((x) => x.id === id);
  return c ? { ...c } : undefined;
}

export async function modifierChantier(
  id: string,
  statut: ChantierStatut,
  dateDebut: string,
  dateFinPrevue: string
): Promise<Chantier> {
  await wait();
  const debut = parseDate(dateDebut);
  const fin = parseDate(dateFinPrevue);
  if (!debut || !fin) throw new Error("Date invalide (format JJ/MM/AAAA).");
  if (fin.getTime() < debut.getTime()) {
    throw new Error("La date de fin doit être après la date de début.");
  }
  const c = store.find((x) => x.id === id);
  if (!c) throw new Error("Chantier introuvable");
  c.statut = statut;
  c.dateDebut = dateDebut;
  c.dateFinPrevue = dateFinPrevue;
  return { ...c };
}