import { useCallback, useEffect, useState } from "react";
import type {
  PermissionRequestOptions,
  PermissionStatus,
  PermissionType,
} from "../models/permission.types";
import { permissionsService } from "../services/permissionsService";

export function useDevicePermission(
  type: PermissionType,
  options?: PermissionRequestOptions,
) {
  const [status, setStatus] = useState<PermissionStatus>("undetermined");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRationaleVisible, setIsRationaleVisible] = useState<boolean>(false);
  const [currentContextReason, setCurrentContextReason] = useState<
    string | undefined
  >(options?.contextReason);

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const current = await permissionsService.checkPermission(type);
      setStatus(current);
      return current;
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    let isMounted = true;
    permissionsService.checkPermission(type).then((current) => {
      if (isMounted) {
        setStatus(current);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [type]);

  /**
   * Demande progressive :
   * 1. Si déjà accordé -> renvoie true directement.
   * 2. Si jamais demandé (undetermined) -> affiche d'abord la modale explicative contextualisée.
   * 3. Si déjà bloqué -> ouvre l'écran de refus / réglages.
   */
  const requestWithRationale = useCallback(
    async (contextReason?: string): Promise<boolean> => {
      if (contextReason) {
        setCurrentContextReason(contextReason);
      }

      const current = await permissionsService.checkPermission(type);
      if (current === "granted") {
        setStatus("granted");
        return true;
      }

      if (current === "blocked") {
        setStatus("blocked");
        return false;
      }

      // Afficher l'explication progressive avant la boîte de dialogue système
      setIsRationaleVisible(true);
      return false;
    },
    [type],
  );

  /**
   * Déclenche la demande système après confirmation dans la modale explicative.
   */
  const confirmRationale = useCallback(async (): Promise<PermissionStatus> => {
    setIsRationaleVisible(false);
    setIsLoading(true);
    try {
      const result = await permissionsService.requestPermission(type);
      setStatus(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  const dismissRationale = useCallback(() => {
    setIsRationaleVisible(false);
  }, []);

  const openSettings = useCallback(async () => {
    return permissionsService.openSettings();
  }, []);

  return {
    type,
    status,
    isGranted: status === "granted",
    isDenied: status === "denied",
    isBlocked: status === "blocked",
    isLoading,
    isRationaleVisible,
    contextReason: currentContextReason,
    checkStatus,
    requestWithRationale,
    confirmRationale,
    dismissRationale,
    openSettings,
  };
}
