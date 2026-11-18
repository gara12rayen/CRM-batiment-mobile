import { useCallback, useEffect, useState } from "react";
import { getDashboard } from "./dashboard.service";
import { Dashboard } from "./types";

export function useDashboardViewModel() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      setData(await getDashboard());
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, isError, refetch: load };
}