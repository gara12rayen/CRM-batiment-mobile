import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SessionUser } from "@/features/auth/models/auth.types";
import { getSessionUser } from "@/features/auth/services/authStorage";
import { subscribeToSessionChange } from "@/features/auth/services/sessionEvents";
import type { AccessProfile, Permission } from "./access.types";
import { hasPermission, resolveAccess } from "./accessEngine";

type AccessContextValue = {
  ready: boolean;
  user: SessionUser | null;
  profile: AccessProfile;
  has: (permission: Permission) => boolean;
  refresh: () => Promise<void>;
};

const AccessContext = createContext<AccessContextValue | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const nextUser = await getSessionUser();
    setUser(nextUser);
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
    return subscribeToSessionChange(() => {
      void refresh();
    });
  }, [refresh]);

  const profile = useMemo(() => resolveAccess(user), [user]);

  const value = useMemo<AccessContextValue>(
    () => ({
      ready,
      user,
      profile,
      has: (permission) => hasPermission(profile.permissions, permission),
      refresh,
    }),
    [profile, ready, refresh, user],
  );

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess(): AccessContextValue {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error("useAccess doit être utilisé dans AccessProvider.");
  }
  return context;
}
