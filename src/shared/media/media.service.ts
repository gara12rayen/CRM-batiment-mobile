import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { apiClient, ApiError } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import { env } from "@/core/config/env";
import { getAccessToken } from "@/features/auth/services/authStorage";

/**
 * Everything about media in ONE file (photos, PDF, files of the API, GPS position).
 * Packages: expo-image-picker, expo-document-picker, expo-file-system, expo-location.
 * The voice recorder (expo-audio) is in useEnregistreurVocal.ts, the player in LecteurAudio.tsx.
 */

/** A local file ready to be sent in a multipart request. */
export type FichierLocal = { uri: string; nom: string; type: string; taille?: number | null };

/** Part of a FormData for React Native (uri + name + type); a Blob on the web. */
export async function partieFormData(f: FichierLocal): Promise<Blob | { uri: string; name: string; type: string }> {
  if (Platform.OS === "web") return (await fetch(f.uri)).blob();
  return { uri: f.uri, name: f.nom, type: f.type };
}

// ── Photos ────────────────────────────────────────────────────────────────

const versFichier = (a: ImagePicker.ImagePickerAsset, i: number): FichierLocal => ({
  uri: a.uri,
  nom: a.fileName ?? `photo-${Date.now()}-${i + 1}.jpg`,
  type: a.mimeType ?? "image/jpeg",
  taille: a.fileSize ?? null,
});

/** Photos from the gallery (max photos). Empty list if the user cancels. */
export async function choisirPhotos(max: number): Promise<FichierLocal[]> {
  if (max <= 0) return [];
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new ApiError("Autorisez l’accès aux photos dans les réglages du téléphone.", 0);
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: max > 1,
    selectionLimit: max,
    quality: 0.7,
  });
  if (res.canceled) return [];
  return res.assets.slice(0, max).map(versFichier);
}

/** One photo taken with the camera (null if cancelled). */
export async function prendrePhoto(): Promise<FichierLocal | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) throw new ApiError("Autorisez l’appareil photo dans les réglages du téléphone.", 0);
  const res = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.7 });
  if (res.canceled || !res.assets.length) return null;
  return versFichier(res.assets[0], 0);
}

// ── PDF ───────────────────────────────────────────────────────────────────

/** A PDF from the phone (plan…). null if cancelled. */
export async function choisirPdf(): Promise<FichierLocal | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets.length) return null;
  const a = res.assets[0];
  return { uri: a.uri, nom: a.name, type: a.mimeType ?? "application/pdf", taille: a.size ?? null };
}

// ── Files stored by the API (GET /fichiers/:id/contenu, needs the token) ──

const cache = new Map<number, string>();

/**
 * Downloads a file of the API once (with the token), then gives a local address to show the
 * photo or play the voice note. Web: an object URL.
 */
export async function telechargerFichier(id: number, nom: string): Promise<string> {
  const deja = cache.get(id);
  if (deja) return deja;
  const url = `${apiEndpoints.fichiers}/${id}/contenu`;

  if (Platform.OS === "web") {
    const { data } = await apiClient.get<Blob>(url, { responseType: "blob" });
    const local = URL.createObjectURL(data);
    cache.set(id, local);
    return local;
  }

  if (!env.apiUrl) throw new ApiError("Adresse de l’API non configurée (EXPO_PUBLIC_API_URL).", 0);
  const token = await getAccessToken();
  const propre = nom.replace(/[^\w.-]+/g, "_") || "fichier";
  const destination = new File(Paths.cache, `api-${id}-${propre}`);
  if (!destination.exists) {
    await File.downloadFileAsync(`${env.apiUrl}${url}`, destination, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => {
      throw new ApiError("Impossible de télécharger le fichier. Vérifiez votre connexion.", 0);
    });
  }
  cache.set(id, destination.uri);
  return destination.uri;
}

// ── GPS position (optional) ───────────────────────────────────────────────

/** Current position, or null if refused / unavailable (never blocks the action). */
export async function positionActuelle(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return null;
    const pos = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
    ]);
    return pos ? { latitude: pos.coords.latitude, longitude: pos.coords.longitude } : null;
  } catch {
    return null;
  }
}
