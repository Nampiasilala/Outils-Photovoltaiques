// app/components/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Interface pour le contexte
interface AuthContextType {
  user: { email: string } | null;
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
}

// Interface de la réponse JWT attendue
interface LoginResponse {
  access: string;
  refresh: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const router = useRouter();

  // Charger l'utilisateur depuis le localStorage (persistance)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (token && email) {
      setUser({ email });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post<LoginResponse>(
        "http://localhost:8000/login/",
        { username: email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const token = response.data.access;

      // Stocker token et email
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);

      setUser({ email });

      toast.success("Connexion réussie !");
      router.push("/calculate");
    } catch (error: any) {
      toast.error(`Échec de la connexion : ${error.response?.data?.detail || error.message}`);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await axios.post(
        "http://localhost:8000/register/",
        { username: name, email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success("Inscription réussie !");
      router.push("/login");
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message;
      console.error("Erreur d'inscription :", error.response?.data || error);
      toast.error(`Échec de l'inscription : ${errorMessage}`);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
    toast.info("Vous êtes déconnecté.");
    router.push("/login");
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
