import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { apiClient, ApiError } from "@/core/api/api-client";
import { apiEndpoints } from "@/core/api/api-endpoints";
import { env } from "@/core/config/env";
import { getAccessToken } from "@/features/auth/services/authStorage";

/**
 * PDF of a quote (GET /devis/:id/pdf — sale prices only, with the verification QR code).
 * The route needs the JWT, so the file is downloaded with the token, then:
 *  - phone: opened in the system viewer / share sheet (save, mail, WhatsApp…);
 *  - web (npm run web): opened in a new browser tab.
 * Everything about files is in this one file (expo-file-system + expo-sharing).
 */
export async function ouvrirPdfDevis(id: number, reference: string): Promise<void> {
  if (Platform.OS === "web") {
    const { data } = await apiClient.get<Blob>(`${apiEndpoints.devis}/${id}/pdf`, { responseType: "blob" });
    const url = URL.createObjectURL(data);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }

  if (!env.apiUrl) throw new ApiError("Adresse de l’API non configurée (EXPO_PUBLIC_API_URL).", 0);
  const token = await getAccessToken();
  const nom = `${reference.replace(/[^\w.-]+/g, "_") || `devis-${id}`}.pdf`;

  const destination = new File(Paths.cache, nom);
  if (destination.exists) destination.delete(); // always the latest version of the quote

  const fichier = await File.downloadFileAsync(`${env.apiUrl}${apiEndpoints.devis}/${id}/pdf`, destination, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).catch(() => {
    throw new ApiError("Impossible de télécharger le PDF. Vérifiez votre connexion.", 0);
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new ApiError("Ce téléphone ne permet pas d’ouvrir le PDF.", 0);
  }
  await Sharing.shareAsync(fichier.uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: `Devis ${reference}` });
}
