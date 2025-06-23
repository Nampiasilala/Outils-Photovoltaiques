"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  user: { email: string; avatar: string } | null;
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string; avatar: string } | null>(null);

  const login = (email: string, password: string) => {
    // Simulation de connexion (remplacer par appel API plus tard)
    setUser({ email, avatar: "https://via.placeholder.com/32" });
  };

  const register = (name: string, email: string, password: string) => {
    // Simulation d’inscription
    setUser({ email, avatar: "https://via.placeholder.com/32" });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}