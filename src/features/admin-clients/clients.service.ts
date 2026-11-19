import { clientsMock } from "./clients.mock";
import { Client, ClientForm, validerClient } from "./types";

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// Mocks en mémoire. Mn b3d: apiClient.get / post / patch
let store: Client[] = clientsMock.map((c) => ({ ...c }));

export async function getClients(): Promise<Client[]> {
  await wait();
  return store.map((c) => ({ ...c }));
}

export async function getClient(id: string): Promise<Client | undefined> {
  await wait(150);
  const c = store.find((x) => x.id === id);
  return c ? { ...c } : undefined;
}

export async function creerClient(f: ClientForm): Promise<Client> {
  await wait();
  const err = validerClient(f);
  if (err) throw new Error(err);
  // pas de doublon (règle partie 1)
  if (store.some((c) => c.email.toLowerCase() === f.email.toLowerCase())) {
    throw new Error("Un client avec cet email existe déjà.");
  }
  const c: Client = { ...f, id: "c" + Date.now() };
  store = [c, ...store];
  return { ...c };
}

export async function modifierClient(id: string, f: ClientForm): Promise<Client> {
  await wait();
  const err = validerClient(f);
  if (err) throw new Error(err);
  if (store.some((c) => c.id !== id && c.email.toLowerCase() === f.email.toLowerCase())) {
    throw new Error("Un client avec cet email existe déjà.");
  }
  store = store.map((c) => (c.id === id ? { ...f, id } : c));
  return { ...f, id };
}