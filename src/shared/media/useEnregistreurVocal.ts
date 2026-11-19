import { useEffect, useRef, useState } from "react";
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from "expo-audio";
import type { FichierLocal } from "./media.service";

/** Longest recording accepted (the API transcribes short notes). */
export const DUREE_MAX_SECONDES = 180;

/**
 * Voice recording (expo-audio). M4A on both iPhone and Android: accepted by POST …/ia/transcrire.
 * start() asks for the microphone permission; stop() gives the recorded file.
 */
export function useEnregistreurVocal() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [enCours, setEnCours] = useState(false);
  const [secondes, setSecondes] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const minuteur = useRef<ReturnType<typeof setInterval> | null>(null);

  const arreterMinuteur = () => {
    if (minuteur.current) clearInterval(minuteur.current);
    minuteur.current = null;
  };

  useEffect(() => arreterMinuteur, []);

  async function demarrer(): Promise<boolean> {
    setErreur(null);
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setErreur("Autorisez le micro dans les réglages du téléphone.");
      return false;
    }
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setSecondes(0);
    setEnCours(true);
    minuteur.current = setInterval(() => setSecondes((s) => s + 1), 1000);
    return true;
  }

  async function arreter(): Promise<FichierLocal | null> {
    arreterMinuteur();
    setEnCours(false);
    await recorder.stop();
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    const uri = recorder.uri;
    if (!uri) {
      setErreur("Aucun enregistrement. Réessayez.");
      return null;
    }
    return { uri, nom: `note-${Date.now()}.m4a`, type: "audio/mp4" };
  }

  return { enCours, secondes, erreur, demarrer, arreter };
}
