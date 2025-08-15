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
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

interface JwtPayload {
  user_id: number;
  exp: number;
  iat: number;
}

export interface AdminUser {
  id: number;
  email: string;
  username?: string;
  is_staff: boolean;
  is_superuser: boolean;
}

interface AuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Helpers */
function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.toLowerCase().trim();
    return s === "true" || s === "1" || s === "yes";
  }
  return false;
}

function normalizeUser(raw: any): AdminUser | null {
  const r =
    raw?.data ?? (Array.isArray(raw?.results) ? raw.results[0] : raw) ?? raw;
  if (!r || typeof r !== "object") return null;

  const id = r.id ?? r.user_id ?? r.pk;
  const email =
    r.email ?? r.user?.email ?? r.profile?.email ?? r.email_address ?? r.mail;
  const username = r.username ?? r.user?.username ?? r.name ?? r.login;

  const isStaff =
    r.is_staff ??
    r.isStaff ??
    r.staff ??
    (Array.isArray(r.roles) && r.roles.includes("staff")) ??
    (typeof r.role === "string" && r.role.toLowerCase() === "staff") ??
    r.is_admin;

  const isSuperuser =
    r.is_superuser ??
    r.isSuperuser ??
    r.superuser ??
    (Array.isArray(r.roles) && r.roles.includes("admin")) ??
    (typeof r.role === "string" &&
      ["admin", "superuser", "super"].includes(r.role.toLowerCase())) ??
    r.is_admin;

  const parsed: AdminUser = {
    id: typeof id === "string" ? Number(id) : id,
    email,
    username,
    is_staff: toBool(isStaff),
    is_superuser: toBool(isSuperuser),
  };

  if (typeof parsed.id !== "number" || !Number.isFinite(parsed.id)) return null;
  if (typeof parsed.email !== "string" || parsed.email.length === 0)
    return null;

  return parsed;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const clearAuthState = () => {
    delete axios.defaults.headers.common["Authorization"];
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
    }
    setAdmin(null);
  };

  useEffect(() => {
    if (!API) {
      console.error("NEXT_PUBLIC_API_BASE_URL non défini");
      setLoading(false);
      return;
    }

    axios.defaults.baseURL = API;

    const initAuth = async () => {
      const access =
        typeof window !== "undefined"
          ? localStorage.getItem("adminAccessToken")
          : null;
      const refresh =
        typeof window !== "undefined"
          ? localStorage.getItem("adminRefreshToken")
          : null;

      if (access && refresh) {
        try {
          const { user_id } = jwtDecode<JwtPayload>(access);
          const resp = await axios.get(`/users/${user_id}/`, {
            headers: { Authorization: `Bearer ${access}` },
          });

          const userData = normalizeUser(resp.data);
          if (!userData) {
            console.debug("Réponse brute inattendue (initAuth):", resp.data);
            throw new Error("Réponse utilisateur invalide");
          }

          if (userData.is_staff || userData.is_superuser) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
            setAdmin(userData);
          } else {
            clearAuthState(); // pas de toast ici pour éviter le spam au chargement
          }
        } catch (err) {
          console.error("Token invalide ou utilisateur non autorisé:", err);
          clearAuthState();
        }
      }

      setLoading(false);
    };

    void initAuth();
  }, [API]);

  const login = async (email: string, password: string) => {
    if (!API) throw new Error("API non configurée");

    try {
      const { data } = await axios.post<{ access: string; refresh: string }>(
        "/token/",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const { user_id } = jwtDecode<JwtPayload>(data.access);

      const resp = await axios.get(`/users/${user_id}/`, {
        headers: { Authorization: `Bearer ${data.access}` },
      });

      const userData = normalizeUser(resp.data);
      if (!userData) {
        console.debug("Réponse brute inattendue (login):", resp.data);
        throw new Error("Réponse utilisateur invalide");
      }

      // ❌ cas non-admin : on nettoie, on TOASTE, et on REJETTE
      // cas NON-ADMIN
      if (!userData.is_staff && !userData.is_superuser) {
        // Nettoyage mais PAS de navigation
        delete axios.defaults.headers.common["Authorization"];
        if (typeof window !== "undefined") {
          localStorage.removeItem("adminAccessToken");
          localStorage.removeItem("adminRefreshToken");
        }
        // Rejette un code stable, la page gère l’affichage
        throw new Error("ADMIN_ONLY");
      }

      // ✅ cas admin : on persiste et on route
      localStorage.setItem("adminAccessToken", data.access);
      localStorage.setItem("adminRefreshToken", data.refresh);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;

      setAdmin(userData);
      router.push("/admin");
    } catch (err) {
      throw err; // pas de redirection ici
    }
  };

  const logout = () => {
    clearAuthState();
    router.push("/");
  };

  const isAuthenticated = (): boolean => admin !== null;

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}

// Hook pratique pour l'espace admin (redirection si non connecté)
export function useAdminAuth() {
  const { admin, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.push("/(public)/login");
    }
  }, [admin, loading, router]);

  return {
    admin,
    loading,
    logout,
    isAuthenticated: !!admin,
  };
}
