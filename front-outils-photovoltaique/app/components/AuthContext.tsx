"use client";

import {
  createContext, useContext, useEffect, useState, ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { env } from "@/lib/env";

interface JwtPayload { user_id: number; exp: number; iat: number; }

export interface AppUser {
  id: number;
  email: string;
  username?: string;
  role: string;                  // ← important pour la redirection
  is_staff: boolean;
  is_superuser: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function pick<T = any>(...vals: T[]): T | undefined {
  for (const v of vals) if (v !== undefined && v !== null) return v;
  return undefined;
}
function toStr(v: unknown) { return typeof v === "string" ? v : ""; }
function toBool(v: unknown) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return ["true","1","yes","y"].includes(v.trim().toLowerCase());
  return !!v;
}

// app/components/AuthContext.tsx
// ...
function normalizeRole(raw: unknown): "admin" | "entreprise" | "utilisateur" {
  const s = String(raw ?? "").trim().toLowerCase();
  if (["admin", "superuser", "super", "staff"].some(k => s.includes(k))) return "admin";
  if (["entreprise", "company", "vendor"].some(k => s.includes(k))) return "entreprise";
  return "utilisateur";
}

function normalizeUser(raw: any): AppUser | null {
  const r = raw?.data ?? raw?.user ?? raw ?? {};
  if (!r || typeof r !== "object") return null;

  const u = r.user && typeof r.user === "object" ? r.user : {};
  const p = r.profile && typeof r.profile === "object" ? r.profile : {};

  const idRaw = [r.id, r.user_id, r.pk, u.id, u.user_id, p.id].find((v) => v != null);
  const id = typeof idRaw === "string" ? Number(idRaw) : idRaw;
  if (!Number.isFinite(id)) return null;

  const email =
    [r.email, u.email, p.email, r.email_address, r.mail].find((v) => typeof v === "string") || "";
  if (!email) return null;

  const username = [r.username, u.username, p.username, r.name, r.login].find((v) => !!v);
  const roleRaw = [r.role, u.role, p.role].find((v) => v != null);

  const role = normalizeRole(roleRaw); // ✅ ICI

  const is_staff = !!(r.is_staff ?? u.is_staff ?? p.is_staff);
  const is_superuser = !!(r.is_superuser ?? u.is_superuser ?? p.is_superuser);

  return { id, email, username, role, is_staff, is_superuser };
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API = env.NEXT_PUBLIC_API_BASE_URL;

  const clearAuth = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    setUser(null);
  };

  // Au chargement: si tokens présents → récupérer /users/me/
  useEffect(() => {
    if (!API) { console.error("NEXT_PUBLIC_API_BASE_URL manquant"); setLoading(false); return; }

    const init = async () => {
      const access = localStorage.getItem("accessToken");
      const refresh = localStorage.getItem("refreshToken");
      if (!access || !refresh) { setLoading(false); return; }

      try {
        // 1) /users/me/ prioritaire
        let meRes = await fetch(`${API}/users/me/`, {
          headers: { Authorization: `Bearer ${access}` },
        });

        // 2) fallback /users/<id>/ si /me/ pas dispo
        if (!meRes.ok && meRes.status === 404) {
          const { user_id } = jwtDecode<JwtPayload>(access);
          meRes = await fetch(`${API}/users/${user_id}/`, {
            headers: { Authorization: `Bearer ${access}` },
          });
        }
        if (!meRes.ok) throw new Error(String(meRes.status));

        const me = normalizeUser(await meRes.json());
        if (!me) throw new Error("PROFILE_PARSE_ERROR");

        setUser(me);
      } catch (e) {
        console.error("Init auth échouée:", e);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [API]);

  // ← N’EXCLUT PLUS les non-admin: on pose `user` et on laisse la page décider.
  const login = async (email: string, password: string) => {
    if (!API) throw new Error("API non configurée");

    // 1) login
    const tokenRes = await fetch(`${API}/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!tokenRes.ok) throw new Error("INVALID_CREDENTIALS");
    const { access, refresh } = await tokenRes.json();

    // 2) profil (me d’abord)
    let meRes = await fetch(`${API}/users/me/`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    if (!meRes.ok && meRes.status === 404) {
      const { user_id } = jwtDecode<JwtPayload>(access);
      meRes = await fetch(`${API}/users/${user_id}/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
    }
    if (!meRes.ok) throw new Error("PROFILE_ERROR");

    const me = normalizeUser(await meRes.json());
    if (!me) throw new Error("PROFILE_PARSE_ERROR");

    // 3) OK → stocker + setUser
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    setUser(me);
    // la redirection est gérée par tes pages (useEffect)
  };

  const logout = () => { clearAuth(); router.push("/"); };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: () => !!user }}
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

// à la fin de AuthContext.tsx
export function useAdminAuth() {
  const { user, loading, logout } = useAuth();
  const isAdmin = !!user && (user.role || "").toLowerCase() === "admin";
  return { admin: isAdmin ? user : null, loading, logout, isAuthenticated: isAdmin };
}
