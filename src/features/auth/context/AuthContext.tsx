
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { apiClient, ApiError } from "@/core/api/api-client";

import {
  isUserRole,
  type SessionUser,
} from "@/features/auth/models/auth.types";

import {
  clearSession,
  getAccessToken,
  getSessionUser,
  saveSession,
} from "@/features/auth/services/authStorage";

type AuthContextType = {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = await getAccessToken();

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await apiClient.get<
        SessionUser | { user: SessionUser }
      >("/auth/me");

      const profile =
        "user" in response.data ? response.data.user : response.data;

      // Vérifier l'identifiant et le rôle réellement reçu du backend.
      if (!profile?.id || !isUserRole(profile.role)) {
        await clearSession();
        setUser(null);
        return;
      }

      // Mettre à jour le profil et la session persistée.
      setUser(profile);

      await saveSession({
        accessToken: token,
        user: profile,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // Session expirée ou invalide.
        await clearSession();
        setUser(null);
        return;
      }

      // En cas de problème réseau, conserver le profil déjà enregistré.
      const cachedUser = await getSessionUser();

      if (cachedUser && isUserRole(cachedUser.role)) {
        setUser(cachedUser);
      } else {
        await clearSession();
        setUser(null);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        await refreshUser();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        refreshUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider.");
  }

  return context;
}
