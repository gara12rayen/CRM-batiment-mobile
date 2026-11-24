import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import { ApiError } from "@/core/api/api-client";
import { nouvelleCleIdempotence } from "@/core/api/idempotency";
import type { FichierLocal } from "@/shared/media/media.service";

/**
 * Field sending queue (envoi différé): what was done without network (SAV ticket, photos,
 * report, prospect) is kept ON THE PHONE and sent again when the network comes back.
 *
 * - kept after the app is closed: a JSON file + a copy of the photos in the app documents
 * - each item has its own Idempotency-Key: sent twice = saved once by the server
 * - only a network error keeps an item waiting; an API refusal (4xx) marks it « refusé »
 *   with the message, the user reads it and removes it
 * Web: localStorage (photos are not kept after a reload).
 */

export type EnvoiType = "SAV" | "PHOTOS_CHANTIER" | "RAPPORT_CHANTIER" | "PROSPECT_TERRAIN";

export type EnvoiEnAttente = {
  id: string;
  type: EnvoiType;
  /** What the user sees in the list (« Photos — CH-2026-012 ») */
  libelle: string;
  payload: Record<string, unknown>;
  fichiers: FichierLocal[];
  cle: string;
  creeLe: string;
  tentatives: number;
  /** Message of the API when it refused the item (it will not be retried) */
  refus: string | null;
};

export type Executeur = (envoi: EnvoiEnAttente) => Promise<void>;

const executeurs = new Map<EnvoiType, Executeur>();
const abonnes = new Set<(items: EnvoiEnAttente[]) => void>();
let items: EnvoiEnAttente[] = [];
let charge = false;
let enCours = false;

const CLE_WEB = "batiment.file-envoi";
const dossier = () => new Directory(Paths.document, "envois");
const fichierFile = () => new File(Paths.document, "file-envoi.json");

/** Each feature registers how to send its items. */
export function enregistrerExecuteur(type: EnvoiType, fn: Executeur) {
  executeurs.set(type, fn);
}

export function abonner(fn: (items: EnvoiEnAttente[]) => void): () => void {
  abonnes.add(fn);
  fn(items);
  return () => abonnes.delete(fn);
}

function notifier() {
  for (const fn of abonnes) fn(items);
}

async function lire(): Promise<void> {
  if (charge) return;
  charge = true;
  try {
    if (Platform.OS === "web") {
      const brut = typeof window !== "undefined" ? window.localStorage?.getItem(CLE_WEB) : null;
      items = brut ? (JSON.parse(brut) as EnvoiEnAttente[]) : [];
    } else {
      const f = fichierFile();
      items = f.exists ? (JSON.parse(await f.text()) as EnvoiEnAttente[]) : [];
    }
  } catch {
    items = [];
  }
  notifier();
}

async function ecrire(): Promise<void> {
  try {
    const json = JSON.stringify(items);
    if (Platform.OS === "web") window.localStorage?.setItem(CLE_WEB, json);
    else {
      const f = fichierFile();
      if (!f.exists) f.create();
      f.write(json);
    }
  } catch {
    // storage full or unavailable: the items stay in memory until the app is closed
  }
  notifier();
}

/** Photos picked from the cache can be removed by the system: copy them next to the queue. */
function copierFichiers(id: string, fichiers: FichierLocal[]): FichierLocal[] {
  if (Platform.OS === "web" || !fichiers.length) return fichiers;
  const d = dossier();
  if (!d.exists) d.create({ intermediates: true });
  return fichiers.map((f, i) => {
    const dest = new File(d, `${id}-${i}-${f.nom.replace(/[^\w.-]+/g, "_")}`);
    new File(f.uri).copy(dest);
    return { ...f, uri: dest.uri };
  });
}

function supprimerFichiers(envoi: EnvoiEnAttente) {
  if (Platform.OS === "web") return;
  for (const f of envoi.fichiers) {
    try {
      const file = new File(f.uri);
      if (file.exists && f.uri.includes("/envois/")) file.delete();
    } catch {
      // already gone
    }
  }
}

/** Network error = no answer from the server (status 0). */
export const estErreurReseau = (e: unknown) => e instanceof ApiError && e.status === 0;

/**
 * Sends now; without network the item is kept and sent later.
 * Answers « envoye » or « en_attente »; an API refusal is thrown (to show on the form).
 */
export async function envoyerOuMettreEnAttente(
  type: EnvoiType,
  libelle: string,
  payload: Record<string, unknown>,
  fichiers: FichierLocal[] = [],
): Promise<"envoye" | "en_attente"> {
  await lire();
  const executeur = executeurs.get(type);
  if (!executeur) throw new Error(`Aucun envoi prévu pour ${type}`);
  const envoi: EnvoiEnAttente = {
    id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    type,
    libelle,
    payload,
    fichiers,
    cle: nouvelleCleIdempotence(),
    creeLe: new Date().toISOString(),
    tentatives: 1,
    refus: null,
  };
  try {
    await executeur(envoi);
    return "envoye";
  } catch (e) {
    if (!estErreurReseau(e)) throw e;
    items = [...items, { ...envoi, fichiers: copierFichiers(envoi.id, fichiers) }];
    await ecrire();
    return "en_attente";
  }
}

/** Sends the waiting items again, oldest first; stops at the first network error. */
export async function rejouer(): Promise<void> {
  await lire();
  if (enCours) return;
  enCours = true;
  try {
    for (const envoi of items.filter((i) => !i.refus)) {
      const executeur = executeurs.get(envoi.type);
      if (!executeur) continue;
      try {
        await executeur(envoi);
        supprimerFichiers(envoi);
        items = items.filter((i) => i.id !== envoi.id);
      } catch (e) {
        if (estErreurReseau(e)) {
          items = items.map((i) => (i.id === envoi.id ? { ...i, tentatives: i.tentatives + 1 } : i));
          break;
        }
        const message = e instanceof Error ? e.message : "Envoi refusé.";
        items = items.map((i) => (i.id === envoi.id ? { ...i, tentatives: i.tentatives + 1, refus: message } : i));
      }
      await ecrire();
    }
  } finally {
    enCours = false;
    notifier();
  }
}

export async function retirer(id: string): Promise<void> {
  await lire();
  const envoi = items.find((i) => i.id === id);
  if (envoi) supprimerFichiers(envoi);
  items = items.filter((i) => i.id !== id);
  await ecrire();
}

/** A refused item sent again after the user fixed what the server asked (or just to retry). */
export async function reessayer(id: string): Promise<void> {
  items = items.map((i) => (i.id === id ? { ...i, refus: null } : i));
  await ecrire();
  await rejouer();
}

export const demarrerLecture = lire;
