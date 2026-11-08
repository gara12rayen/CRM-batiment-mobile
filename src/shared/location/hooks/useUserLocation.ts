import { useCallback, useEffect, useState } from "react";
import { useDevicePermission } from "@/shared/permissions";
import type { LocationError, UserLocation } from "../models/location.types";
import { locationService } from "../services/locationService";

interface UseUserLocationOptions {
  /** Récupérer automatiquement la position au montage du composant */
  autoFetch?: boolean;
}

export function useUserLocation(options: UseUserLocationOptions = {}) {
  const { autoFetch = false } = options;
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<LocationError | null>(null);

  const {
    status: permissionStatus,
    isGranted,
    isBlocked,
    openSettings,
    checkStatus: checkPermissionStatus,
  } = useDevicePermission("location");

  const getLocation = useCallback(async (): Promise<UserLocation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const pos = await locationService.getCurrentLocation();
      setLocation(pos);
      return pos;
    } catch (err: any) {
      const locationError: LocationError = err?.code
        ? (err as LocationError)
        : {
            code: "UNKNOWN",
            message: err?.message || "Erreur inconnue de localisation.",
            userMessage:
              "Impossible de capturer votre position GPS actuelle. Vérifiez vos réglages.",
          };
      setError(locationError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      void getLocation();
    }
  }, [autoFetch, getLocation]);

  return {
    location,
    isLoading,
    error,
    isPermissionDenied: permissionStatus === "denied" || isBlocked,
    permissionStatus,
    isGranted,
    getLocation,
    openSettings,
    checkPermissionStatus,
  };
}
