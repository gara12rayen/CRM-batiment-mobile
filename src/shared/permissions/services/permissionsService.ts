import { Platform } from "react-native";
import * as Linking from "expo-linking";
import type { PermissionStatus, PermissionType } from "../models/permission.types";

/**
 * Service centralisant la gestion des autorisations système de l'appareil.
 * Supporte :
 *  - L'ouverture universelle des paramètres système (iOS et Android)
 *  - Un mode d'essai / simulation permettant de tester tous les cas (accord, refus, blocage)
 *  - L'API Web standard (navigateur) pour tester immédiatement avec expo start --web
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

    // Gestion native Web si exécuté dans un navigateur
    if (Platform.OS === "web" && typeof window !== "undefined") {
      try {
        switch (type) {
          case "notifications": {
            if (typeof Notification !== "undefined") {
              if (Notification.permission === "granted") return "granted";
              if (Notification.permission === "denied") return "denied";
              return "undetermined";
            }
            break;
          }
          case "location": {
            if (navigator?.permissions?.query) {
              const res = await navigator.permissions.query({
                name: "geolocation" as PermissionName,
              });
              if (res.state === "granted") return "granted";
              if (res.state === "denied") return "denied";
              return "undetermined";
            }
            break;
          }
          case "camera": {
            if (navigator?.permissions?.query) {
              try {
                const res = await navigator.permissions.query({
                  name: "camera" as any,
                });
                if (res.state === "granted") return "granted";
                if (res.state === "denied") return "denied";
                return "undetermined";
              } catch {
                // Non supporté par tous les navigateurs pour camera
              }
            }
            break;
          }
          case "microphone": {
            if (navigator?.permissions?.query) {
              try {
                const res = await navigator.permissions.query({
                  name: "microphone" as any,
                });
                if (res.state === "granted") return "granted";
                if (res.state === "denied") return "denied";
                return "undetermined";
              } catch {
                // Non supporté par tous les navigateurs pour micro
              }
            }
            break;
          }
        }
      } catch {
        // Fallback gracieux vers l'état simulé
      }
    }

    return this.mockStatuses[type];
  }

  /**
   * Déclenche la demande d'autorisation auprès du système.
   */
  async requestPermission(type: PermissionType): Promise<PermissionStatus> {
    if (this.isMockMode) {
      if (this.mockStatuses[type] === "blocked") {
        return "blocked";
      }
      this.mockStatuses[type] = "granted";
      return "granted";
    }

    // Gestion Web standard si exécuté dans un navigateur
    if (Platform.OS === "web" && typeof window !== "undefined") {
      try {
        switch (type) {
          case "notifications": {
            if (typeof Notification !== "undefined") {
              const res = await Notification.requestPermission();
              const status: PermissionStatus =
                res === "granted"
                  ? "granted"
                  : res === "denied"
                    ? "denied"
                    : "undetermined";
              this.mockStatuses[type] = status;
              return status;
            }
            break;
          }
          case "location": {
            if (navigator?.geolocation) {
              const status: PermissionStatus = await new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                  () => resolve("granted"),
                  (err) => {
                    if (err.code === err.PERMISSION_DENIED) {
                      resolve("denied");
                    } else {
                      resolve("undetermined");
                    }
                  },
                  { timeout: 8000 },
                );
              });
              this.mockStatuses[type] = status;
              return status;
            }
            break;
          }
          case "camera": {
            if (navigator?.mediaDevices?.getUserMedia) {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({
                  video: true,
                });
                stream.getTracks().forEach((track) => track.stop());
                this.mockStatuses[type] = "granted";
                return "granted";
              } catch (err: any) {
                const isDenied =
                  err.name === "NotAllowedError" ||
                  err.name === "PermissionDeniedError";
                const status: PermissionStatus = isDenied
                  ? "denied"
                  : "undetermined";
                this.mockStatuses[type] = status;
                return status;
              }
            }
            break;
          }
          case "microphone": {
            if (navigator?.mediaDevices?.getUserMedia) {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({
                  audio: true,
                });
                stream.getTracks().forEach((track) => track.stop());
                this.mockStatuses[type] = "granted";
                return "granted";
              } catch (err: any) {
                const isDenied =
                  err.name === "NotAllowedError" ||
                  err.name === "PermissionDeniedError";
                const status: PermissionStatus = isDenied
                  ? "denied"
                  : "undetermined";
                this.mockStatuses[type] = status;
                return status;
              }
            }
            break;
          }
        }
      } catch {
        // Fallback
      }
    }

    // Prototype / Environnement mobile : transition vers granted sauf si explicitement bloqué
    if (this.mockStatuses[type] === "blocked") {
      return "blocked";
    }
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

      if (typeof window !== "undefined") {
        window.alert(
          "Sur le navigateur web, veuillez autoriser l'accès depuis les paramètres du site (icône cadenas à gauche de la barre d'adresse).",
        );
      }
      return true;
    } catch (error) {
      console.warn("Impossible d'ouvrir les réglages :", error);
      return false;
    }
  }
}

export const permissionsService = new PermissionsService();
