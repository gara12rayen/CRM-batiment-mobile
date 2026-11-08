/**
 * Types et interfaces pour le module Localisation et Contact.
 * Socle Outils Communs - Binôme 1B
 */

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface UserLocation extends GeoCoordinates {
  timestamp: number;
  /** Adresse textuelle optionnelle (si reverse-geocodée) */
  formattedAddress?: string;
  /** Indique si les coordonnées proviennent d'une simulation (mode d'essai) */
  isSimulated?: boolean;
}

export type LocationErrorCode =
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "SERVICES_DISABLED"
  | "UNKNOWN";

export interface LocationError {
  code: LocationErrorCode;
  message: string;
  userMessage: string;
}

export interface ItineraryDestination {
  /** Adresse physique ou nom du lieu (ex: "12 rue de la Paix, 75001 Paris") */
  address?: string;
  /** Coordonnées géographiques directes */
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  /** Libellé affiché sur la carte / GPS */
  label?: string;
}

export interface ItineraryOptions extends ItineraryDestination {
  /** Mode de déplacement ('driving' par défaut) */
  transportMode?: "driving" | "walking" | "transit";
}

export interface ContactCallOptions {
  /** Numéro de téléphone cible */
  phoneNumber: string;
  /** Nom du contact ou de l'entreprise (ex: "M. Martin (Client)") */
  contactName?: string;
  /** Demander confirmation à l'utilisateur avant de composer */
  promptConfirmation?: boolean;
}

export type ActionButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "iconOnly";

export type ActionButtonSize = "sm" | "md" | "lg";
