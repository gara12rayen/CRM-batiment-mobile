import { installateursMock, installationsMock } from "./installations.mock";
import { Installateur, Installation } from "./types";

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const aujourdhui = () => new Date().toLocaleDateString("fr-FR");

// Mocks en mémoire. Mn b3d: apiClient.get / post
let store: Installation[] = installationsMock.map((i) => ({
  ...i,
  chronologie: [...i.chronologie],
}));

export async function getInstallations(): Promise<Installation[]> {
  await wait();
  return store.map((i) => ({ ...i }));
}

export async function getInstallation(id: string): Promise<Installation | undefined> {
  await wait(150);
  const i = store.find((x) => x.id === id);
  return i ? { ...i, chronologie: [...i.chronologie] } : undefined;
}

export async function getInstallateurs(): Promise<Installateur[]> {
  await wait(100);
  return installateursMock.map((i) => ({ ...i }));
}

export async function attribuerInstallateur(id: string, installateurId: string): Promise<Installation> {
  await wait();
  const i = store.find((x) => x.id === id);
  const inst = installateursMock.find((x) => x.id === installateurId);
  if (!i || !inst) throw new Error("Introuvable");
  i.installateurId = installateurId;
  i.chronologie = [
    ...i.chronologie,
    { id: "e" + Date.now(), date: aujourdhui(), texte: `Installateur attribué : ${inst.nom}` },
  ];
  return { ...i };
}

export async function relancer(id: string): Promise<Installation> {
  await wait();
  const i = store.find((x) => x.id === id);
  if (!i) throw new Error("Introuvable");
  if (!i.installateurId) throw new Error("Aucun installateur attribué à relancer.");
  i.chronologie = [
    ...i.chronologie,
    { id: "e" + Date.now(), date: aujourdhui(), texte: "Relance envoyée à l'installateur" },
  ];
  return { ...i };
}

export async function cloturer(id: string): Promise<Installation> {
  await wait();
  const i = store.find((x) => x.id === id);
  if (!i) throw new Error("Introuvable");
  // Règle CDC: clôture possible seulement après le PV signé
  if (!i.pvSigne || i.etape !== "TERMINE_PV") {
    throw new Error("Clôture impossible : le PV signé est requis.");
  }
  i.etape = "CLOTURE";
  i.chronologie = [
    ...i.chronologie,
    { id: "e" + Date.now(), date: aujourdhui(), texte: "Installation clôturée" },
  ];
  return { ...i };
}