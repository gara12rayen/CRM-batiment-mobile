import { Platform } from "react-native";
import { permissionsService } from "@/shared/permissions";
import type {
  GeoCoordinates,
  LocationError,
  LocationErrorCode,
  UserLocation,
} from "../models/location.types";

/**
 * Coordonnées par défaut utilisées pour le mode d'essai / simulation.
 * (Exemple : Chantier BTP central à Paris).
 */
const DEFAULT_MOCK_LOCATION: UserLocation = {
  latitude: 48.856614,
  longitude: 2.3522219,
  accuracy: 10,
  altitude: 35,
  heading: 0,
  speed: 0,
  timestamp: Date.now(),
  formattedAddress: "Chantier Démo, 10 Rue de la Paix, 75002 Paris",
  isSimulated: true,
};

class LocationService {
  private isMockMode: boolean = false;
  private customMockLocation: UserLocation = DEFAULT_MOCK_LOCATION;

  /**
   * Active ou désactive le mode simulation GPS.
   */
  setMockMode(enabled: boolean): void {
    this.isMockMode = enabled;
  }

  getIsMockMode(): boolean {
    return this.isMockMode;
  }

  /**
   * Permet de définir une position de test personnalisée.
   */
  setCustomMockLocation(location: Partial<UserLocation>): void {
    this.customMockLocation = {
      ...DEFAULT_MOCK_LOCATION,
      ...location,
      timestamp: Date.now(),
      isSimulated: true,
    };
  }

  /**
   * Récupère la position géographique actuelle de l'appareil.
   * Gère la vérification des permissions, les erreurs de timeout et le mode simulation.
   */
  async getCurrentLocation(): Promise<UserLocation> {
    // 1. Mode simulation actif
    if (this.isMockMode) {
      return {
        ...this.customMockLocation,
        timestamp: Date.now(),
      };
    }

    // 2. Vérification / Demande de la permission de localisation
    const permissionStatus = await permissionsService.checkPermission("location");

    if (permissionStatus === "denied" || permissionStatus === "blocked") {
      throw this.createLocationError(
        "PERMISSION_DENIED",
        "Permission de localisation refusée.",
        "L'accès à la localisation a été refusé. Veuillez l'activer dans les réglages pour enregistrer votre position.",
      );
    }

    if (permissionStatus === "undetermined") {
      const requested = await permissionsService.requestPermission("location");
      if (requested !== "granted") {
        throw this.createLocationError(
          "PERMISSION_DENIED",
          "Permission de localisation non accordée.",
          "L'accès à la localisation est requis pour certifier la position du chantier.",
        );
      }
    }

    // 3. Récupération sur plateforme Web / Navigateur
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.geolocation) {
      return new Promise<UserLocation>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              heading: position.coords.heading,
              speed: position.coords.speed,
              timestamp: position.timestamp,
              isSimulated: false,
            });
          },
          (error) => {
            let code: LocationErrorCode = "UNKNOWN";
            let userMessage = "Impossible d'obtenir votre position GPS.";

            if (error.code === error.PERMISSION_DENIED) {
              code = "PERMISSION_DENIED";
              userMessage = "Accès GPS refusé par le navigateur.";
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              code = "POSITION_UNAVAILABLE";
              userMessage = "Signal GPS indisponible ou trop faible.";
            } else if (error.code === error.TIMEOUT) {
              code = "TIMEOUT";
              userMessage = "Délai d'attente dépassé pour la capture GPS.";
            }

            reject(this.createLocationError(code, error.message, userMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 10000,
          },
        );
      });
    }

    // 4. Fallback prototype mobile (Version d'essai conforme au CDC)
    // Renvoie une position de démonstration si le module natif n'est pas lié
    return {
      ...this.customMockLocation,
      timestamp: Date.now(),
    };
  }

  /**
   * Formate des coordonnées GPS en chaîne lisible (ex: "48.8566° N, 2.3522° E").
   */
  formatCoordinates(coords: GeoCoordinates): string {
    const latDir = coords.latitude >= 0 ? "N" : "S";
    const lngDir = coords.longitude >= 0 ? "E" : "O";
    const lat = Math.abs(coords.latitude).toFixed(5);
    const lng = Math.abs(coords.longitude).toFixed(5);
    return `${lat}° ${latDir}, ${lng}° ${lngDir}`;
  }

  private createLocationError(
    code: LocationErrorCode,
    message: string,
    userMessage: string,
  ): LocationError {
    return {
      code,
      message,
      userMessage,
    };
  }
}

export const locationService = new LocationService();
