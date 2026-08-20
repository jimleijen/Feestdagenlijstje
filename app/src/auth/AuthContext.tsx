import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, apiErrorMessage, getStoredToken, setStoredToken } from "../api/client";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredToken().then(async (stored) => {
      setToken(stored);
      if (stored) {
        try {
          const { data } = await api.get<User>("/auth/me");
          setUser(data);
        } catch {
          await setStoredToken(null);
          setToken(null);
        }
      }
      setLoading(false);
    });
  }, []);

  async function handleAuthResponse(data: { token: string; user: User }) {
    await setStoredToken(data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    await handleAuthResponse(data);
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post("/auth/register", { name, email, password });
    await handleAuthResponse(data);
  }

  async function logout() {
    await setStoredToken(null);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { apiErrorMessage };
