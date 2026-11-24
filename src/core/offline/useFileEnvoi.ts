import { useEffect, useState } from "react";
import { abonner, reessayer, rejouer, retirer, type EnvoiEnAttente } from "./fileEnvoi";

/** Waiting items of the field queue, live. */
export function useFileEnvoi() {
  const [items, setItems] = useState<EnvoiEnAttente[]>([]);
  useEffect(() => abonner(setItems), []);
  return {
    items,
    enAttente: items.filter((i) => !i.refus).length,
    refuses: items.filter((i) => i.refus).length,
    rejouer,
    retirer,
    reessayer,
  };
}
