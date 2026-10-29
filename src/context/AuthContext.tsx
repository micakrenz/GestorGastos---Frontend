import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError, completeOnboarding as completeOnboardingRequest, getProfile, login as loginRequest, logout as clearSession, register as registerRequest, restoreSessionToken, updateProfile as updateProfileRequest, type User } from "../services/api";

type AuthContextValue = {
  user: User | null;
  isReady: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = await restoreSessionToken();
        if (token) {
          try {
            const profile = await getProfile();
            if (active) setUser(profile);
          } catch (error) {
            // Si el backend está momentáneamente fuera de línea, conservamos la sesión.
            if (error instanceof ApiError && error.status === 401) await clearSession();
          }
        }
      } catch (error) {
        console.warn("No se pudo restaurar la sesión:", error);
      } finally {
        if (active) setIsReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try { setUser(await loginRequest(email, password)); }
    finally { setIsLoading(false); }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try { setUser(await registerRequest(name, email, password)); }
    finally { setIsLoading(false); }
  };

  const updateProfile = async (name: string) => {
    setIsLoading(true);
    try { setUser(await updateProfileRequest(name)); }
    finally { setIsLoading(false); }
  };

  const completeOnboarding = async () => {
    await completeOnboardingRequest();
    setUser((current) => current ? { ...current, onboardingCompleted: true } : current);
  };

  const logout = async () => {
    await clearSession();
    setUser(null);
  };

  const value = useMemo(() => ({ user, isReady, isLoading, login, register, updateProfile, completeOnboarding, logout }), [user, isReady, isLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
}
