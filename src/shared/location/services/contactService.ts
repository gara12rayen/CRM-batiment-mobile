import { Alert, Linking, Platform } from "react-native";
import type { ContactCallOptions, ItineraryOptions } from "../models/location.types";

class ContactService {
  /**
   * Nettoie et normalise une chaîne de numéro de téléphone.
   * Conserve le '+' pour les indicatifs internationaux et supprime les espaces/tirets.
   */
  sanitizePhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return "";
    const hasPlus = phoneNumber.trim().startsWith("+");
    const digitsOnly = phoneNumber.replace(/[^0-9]/g, "");
    return hasPlus ? `+${digitsOnly}` : digitsOnly;
  }

  /**
   * Déclenche un appel téléphonique vers le numéro indiqué.
   * Sur mobile : ouvre le composeur / lance l'appel.
   * Sur web / tablette : affiche le numéro et informe l'utilisateur.
   */
  async callNumber(options: ContactCallOptions): Promise<boolean> {
    const rawNumber = options.phoneNumber;
    const cleanNumber = this.sanitizePhoneNumber(rawNumber);

    if (!cleanNumber) {
      Alert.alert("Numéro invalide", "Le numéro de téléphone fourni est vide ou invalide.");
      return false;
    }

    const displayName = options.contactName
      ? `${options.contactName} (${rawNumber})`
      : rawNumber;

    const executeCall = async () => {
      const telUrl = `tel:${cleanNumber}`;
      try {
        const canOpen = await Linking.canOpenURL(telUrl);
        if (canOpen || Platform.OS === "android") {
          await Linking.openURL(telUrl);
          return true;
        } else {
          Alert.alert(
            "Appel impossible",
            `Cet appareil ne supporte pas les appels téléphoniques directs.\nNuméro : ${rawNumber}`,
          );
          return false;
        }
      } catch (error) {
        console.warn("Échec de l'appel téléphonique :", error);
        Alert.alert(
          "Numéro de contact",
          `Impossible de lancer l'appel automatiquement.\nVous pouvez composer le : ${rawNumber}`,
        );
        return false;
      }
    };

    if (options.promptConfirmation !== false) {
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          "Passer un appel",
          `Voulez-vous appeler ${displayName} ?`,
          [
            {
              text: "Annuler",
              style: "cancel",
              onPress: () => resolve(false),
            },
            {
              text: "Appeler",
              style: "default",
              onPress: async () => {
                const res = await executeCall();
                resolve(res);
              },
            },
          ],
          { cancelable: true },
        );
      });
    }

    return executeCall();
  }

  /**
   * Ouvre l'application de navigation GPS native (Google Maps / Apple Maps).
   * Si l'application native n'est pas installée, bascule automatiquement sur Google Maps Web.
   */
  async openItinerary(options: ItineraryOptions): Promise<boolean> {
    const { address, coordinates, label } = options;

    if (!address && !coordinates) {
      Alert.alert(
        "Destination manquante",
        "Aucune adresse ni coordonnées GPS n'ont été fournies pour calculer l'itinéraire.",
      );
      return false;
    }

    const query = coordinates
      ? `${coordinates.latitude},${coordinates.longitude}`
      : encodeURIComponent(address ?? "");

    const destinationLabel = label ? encodeURIComponent(label) : "";

    // URLs spécifiques par plateforme
    const googleMapsWebUrl = coordinates
      ? `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${query}`;

    let primaryUrl = googleMapsWebUrl;

    if (Platform.OS === "ios") {
      // Apple Maps sur iOS
      primaryUrl = coordinates
        ? `maps:0,0?q=${destinationLabel || "Destination"}@${coordinates.latitude},${coordinates.longitude}`
        : `http://maps.apple.com/?daddr=${query}`;
    } else if (Platform.OS === "android") {
      // Google Maps / Navigation native sur Android
      primaryUrl = coordinates
        ? `geo:${coordinates.latitude},${coordinates.longitude}?q=${coordinates.latitude},${coordinates.longitude}(${destinationLabel || "Chantier"})`
        : `google.navigation:q=${query}`;
    }

    try {
      const canOpenPrimary = await Linking.canOpenURL(primaryUrl);
      if (canOpenPrimary) {
        await Linking.openURL(primaryUrl);
        return true;
      }

      // Fallback universel Google Maps Web
      await Linking.openURL(googleMapsWebUrl);
      return true;
    } catch (error) {
      console.warn("Échec de l'ouverture de l'itinéraire :", error);
      try {
        await Linking.openURL(googleMapsWebUrl);
        return true;
      } catch (fallbackError) {
        Alert.alert(
          "Navigation indisponible",
          "Impossible d'ouvrir l'application de navigation ou le navigateur.",
        );
        return false;
      }
    }
  }
}

export const contactService = new ContactService();
