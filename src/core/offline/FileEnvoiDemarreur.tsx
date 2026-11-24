import { useEffect } from "react";
import { AppState } from "react-native";
import { demarrerLecture, rejouer } from "./fileEnvoi";
import "@/features/terrain/executeursEnvoi";

const INTERVALLE_MS = 45_000;

/**
 * Sends the waiting items: at start, when the app comes back to the front, and every 45 s.
 * Placed once in the tab layout (only signed-in users have something to send).
 */
export function FileEnvoiDemarreur() {
  useEffect(() => {
    void demarrerLecture().then(rejouer);
    const sub = AppState.addEventListener("change", (etat) => {
      if (etat === "active") void rejouer();
    });
    const t = setInterval(() => void rejouer(), INTERVALLE_MS);
    return () => {
      sub.remove();
      clearInterval(t);
    };
  }, []);
  return null;
}
