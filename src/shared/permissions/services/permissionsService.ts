import { Platform } from "react-native";
import * as Linking from "expo-linking";
import type { PermissionStatus, PermissionType } from "../models/permission.types";

/**
 * Service centralisant la gestion des autorisations système de l'appareil.
 * Supporte :
 *  - L'ouverture universelle des paramètres système (iOS et Android)
 *  - Un mode d'essai / simulation permettant de tester tous les cas (accord, refus, blocage)
 *  - Une architecture extensible pour brancher les modules natifs Expo
 */
class PermissionsService {
  private isMockMode: boolean = false;
  private mockStatuses: Record<PermissionType, PermissionStatus> = {
    camera: "undetermined",
    microphone: "undetermined",
    location: "undetermined",
    notifications: "undetermined",
  };

  /**
   * Active ou désactive le mode simulation (utile en test ou simulateur).
   */
  setMockMode(enabled: boolean): void {
    this.isMockMode = enabled;
  }

  getIsMockMode(): boolean {
    return this.isMockMode;
  }

  /**
   * Définit manuellement un statut simulé pour un type de permission donné.
   */
  setMockStatus(type: PermissionType, status: PermissionStatus): void {
    this.mockStatuses[type] = status;
  }

  /**
   * Réinitialise toutes les permissions simulées à 'undetermined'.
   */
  resetMockStatuses(): void {
    this.mockStatuses = {
      camera: "undetermined",
      microphone: "undetermined",
      location: "undetermined",
      notifications: "undetermined",
    };
  }

  /**
   * Vérifie l'état actuel d'une permission sans la solliciter.
   */
  async checkPermission(type: PermissionType): Promise<PermissionStatus> {
    if (this.isMockMode) {
      return this.mockStatuses[type];
    }

    try {
      // Détection native dynamique si les modules Expo sont disponibles
      switch (type) {
        case "camera": {
          // Si expo-camera est disponible
          const CameraModule = await this.safeImport("expo-camera");
          if (CameraModule?.Camera?.getCameraPermissionsAsync) {
            const res = await CameraModule.Camera.getCameraPermissionsAsync();
            return this.mapExpoPermission(res);
          }
          break;
        }
        case "location": {
          const LocationModule = await this.safeImport("expo-location");
          if (LocationModule?.getForegroundPermissionsAsync) {
            const res = await LocationModule.getForegroundPermissionsAsync();
            return this.mapExpoPermission(res);
          }
          break;
        }
        case "notifications": {
          const NotifModule = await this.safeImport("expo-notifications");
          if (NotifModule?.getPermissionsAsync) {
            const res = await NotifModule.getPermissionsAsync();
            return this.mapExpoPermission(res);
          }
          break;
        }
        case "microphone": {
          const AudioModule = await this.safeImport("expo-av");
          if (AudioModule?.Audio?.getPermissionsAsync) {
            const res = await AudioModule.Audio.getPermissionsAsync();
            return this.mapExpoPermission(res);
          }
          break;
        }
      }
    } catch {
      // Si un module natif n'est pas encore lié ou en environnement web/mock
    }

    return this.mockStatuses[type];
  }

  /**
   * Déclenche la demande système réelle auprès de l'OS.
   */
  async requestPermission(type: PermissionType): Promise<PermissionStatus> {
    if (this.isMockMode) {
      // En mode mock, une demande passe par défaut à 'granted' sauf si configuré autrement
      if (this.mockStatuses[type] === "blocked") {
        return "blocked";
      }
      this.mockStatuses[type] = "granted";
      return "granted";
    }

    try {
      switch (type) {
        case "camera": {
          const CameraModule = await this.safeImport("expo-camera");
          if (CameraModule?.Camera?.requestCameraPermissionsAsync) {
            const res = await CameraModule.Camera.requestCameraPermissionsAsync();
            const status = this.mapExpoPermission(res);
            this.mockStatuses[type] = status;
            return status;
          }
          break;
        }
        case "location": {
          const LocationModule = await this.safeImport("expo-location");
          if (LocationModule?.requestForegroundPermissionsAsync) {
            const res = await LocationModule.requestForegroundPermissionsAsync();
            const status = this.mapExpoPermission(res);
            this.mockStatuses[type] = status;
            return status;
          }
          break;
        }
        case "notifications": {
          const NotifModule = await this.safeImport("expo-notifications");
          if (NotifModule?.requestPermissionsAsync) {
            const res = await NotifModule.requestPermissionsAsync();
            const status = this.mapExpoPermission(res);
            this.mockStatuses[type] = status;
            return status;
          }
          break;
        }
        case "microphone": {
          const AudioModule = await this.safeImport("expo-av");
          if (AudioModule?.Audio?.requestPermissionsAsync) {
            const res = await AudioModule.Audio.requestPermissionsAsync();
            const status = this.mapExpoPermission(res);
            this.mockStatuses[type] = status;
            return status;
          }
          break;
        }
      }
    } catch {
      // Fallback gracieux
    }

    // Si les modules natifs ne sont pas encore installés dans le projet
    this.mockStatuses[type] = "granted";
    return "granted";
  }

  /**
   * Ouvre l'écran des réglages de l'application sur le téléphone de l'utilisateur.
   * Fonctionne de manière universelle sur iOS et Android.
   */
  async openSettings(): Promise<boolean> {
    try {
      if (Platform.OS !== "web") {
        await Linking.openSettings();
        return true;
      }
      return false;
    } catch (error) {
      console.warn("Impossible d'ouvrir les réglages :", error);
      return false;
    }
  }

  /**
   * Mappe la réponse standard d'Expo vers notre PermissionStatus unifié.
   */
  private mapExpoPermission(response: {
    granted?: boolean;
    canAskAgain?: boolean;
    status?: string;
  }): PermissionStatus {
    if (response?.granted) {
      return "granted";
    }
    if (response?.canAskAgain === false) {
      return "blocked";
    }
    if (response?.status === "denied") {
      return "denied";
    }
    return "undetermined";
  }

  /**
   * Import dynamique sécurisé pour éviter tout crash si un module Expo optionnel n'est pas installé.
   */
  private async safeImport(moduleName: string): Promise<any> {
    try {
      return await import(moduleName);
    } catch {
      return null;
    }
  }
}

export const permissionsService = new PermissionsService();
