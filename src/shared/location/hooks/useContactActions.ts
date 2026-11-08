import { useCallback, useState } from "react";
import type { ContactCallOptions, ItineraryOptions } from "../models/location.types";
import { contactService } from "../services/contactService";

export function useContactActions() {
  const [isCalling, setIsCalling] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const call = useCallback(async (options: ContactCallOptions): Promise<boolean> => {
    setIsCalling(true);
    try {
      return await contactService.callNumber(options);
    } finally {
      setIsCalling(false);
    }
  }, []);

  const openItinerary = useCallback(
    async (options: ItineraryOptions): Promise<boolean> => {
      setIsNavigating(true);
      try {
        return await contactService.openItinerary(options);
      } finally {
        setIsNavigating(false);
      }
    },
    [],
  );

  return {
    call,
    openItinerary,
    isCalling,
    isNavigating,
  };
}
