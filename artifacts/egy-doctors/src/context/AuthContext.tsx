import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, signIn as apiSignIn, signUp as apiSignUp, type AuthUser, type SignUpData, type AuthResponse } from "@/lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (phone: string, password: string) => Promise<AuthResponse>;
  signUp: (data: SignUpData) => Promise<AuthResponse>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("egy_token");
    if (storedToken) {
      setToken(storedToken);
      getMe()
        .then((u) => {
          setUser(u);
          setIsLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("egy_token");
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (phone: string, password: string) => {
    const result = await apiSignIn(phone, password);
    localStorage.setItem("egy_token", result.token);
    setToken(result.token);
    setUser(result.user);
    return result;
  }, []);

  const signUp = useCallback(async (data: SignUpData) => {
    const result = await apiSignUp(data);
    localStorage.setItem("egy_token", result.token);
    setToken(result.token);
    setUser(result.user);
    return result;
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem("egy_token");
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await getMe();
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
