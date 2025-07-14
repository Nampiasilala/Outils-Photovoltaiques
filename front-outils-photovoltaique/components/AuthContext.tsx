// app/components/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  user_id: number;
  email?: string;
  exp: number;
  iat: number;
}

interface AuthContextType {
  user: { id: number; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: number; email: string } | null>(
    null
  );
  const router = useRouter();

  // Au montage, restaurer le contexte si déjà connecté
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const id = localStorage.getItem("user_id");
    if (token && email && id) {
      setUser({ id: Number(id), email });
    }
  }, []);

  // Connexion
  const login = async (email: string, password: string) => {
    try {
      const { data } = await axios.post<LoginResponse>(
        "http://localhost:8000/login/",
        { username: email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      const token = data.access;
      const payload = jwtDecode<JwtPayload>(token);

      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      localStorage.setItem("user_id", String(payload.user_id));

      setUser({ id: payload.user_id, email });
      toast.success("Connexion réussie !");
      router.push("/calculate");
    } catch (err: any) {
      toast.error(
        `Échec de la connexion : ${err.response?.data?.detail || err.message}`
      );
    }
  };

  // Inscription
  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      await axios.post(
        "http://localhost:8000/register/",
        { username: name, email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success("Inscription réussie !");
      router.push("/login");
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message;
      toast.error(`Échec de l'inscription : ${msg}`);
    }
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("user_id");
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
