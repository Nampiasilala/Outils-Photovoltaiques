// app/components/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

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

/* -------------------- Helpers -------------------- */

function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "y";
  }
  return !!v;
}

function pick<T = any>(...vals: T[]): T | undefined {
  for (const v of vals) if (v !== undefined && v !== null) return v;
  return undefined;
}

function extractAdminFlagsDeep(raw: any) {
  const out = { is_staff: false, is_superuser: false, is_adminRole: false };

  const visit = (node: any) => {
    if (!node) return;
    if (Array.isArray(node)) {
      for (const it of node) visit(it);
      return;
    }
    if (typeof node !== "object") return;

    if ("is_staff" in node) out.is_staff ||= toBool(node.is_staff);
    if ("isStaff" in node) out.is_staff ||= toBool(node.isStaff);
    if ("staff" in node) out.is_staff ||= toBool(node.staff);
    if ("is_superuser" in node) out.is_superuser ||= toBool(node.is_superuser);
    if ("isSuperuser" in node) out.is_superuser ||= toBool(node.isSuperuser);
    if ("superuser" in node) out.is_superuser ||= toBool(node.superuser);

    if ("is_admin" in node) {
      const v = node.is_admin;
      out.is_staff ||= toBool(v);
      out.is_superuser ||= toBool(v);
    }
    if ("isAdmin" in node) {
      const v = node.isAdmin;
      out.is_staff ||= toBool(v);
      out.is_superuser ||= toBool(v);
    }

    const roles = pick<any>(node.roles, node.role, node.groups);
    if (typeof roles === "string") {
      const s = roles.toLowerCase();
      if (s.includes("admin") || s.includes("super")) out.is_adminRole = true;
      if (s.includes("staff") || s.includes("moderator") || s.includes("mod"))
        out.is_staff = true;
    } else if (Array.isArray(roles)) {
      for (const r of roles) {
        const name = typeof r === "string" ? r : (r?.name ?? r?.role ?? "");
        if (typeof name === "string") {
          const s = name.toLowerCase();
          if (["admin", "superuser", "super"].some((k) => s.includes(k)))
            out.is_adminRole = true;
          if (["staff", "moderator", "mod"].some((k) => s.includes(k)))
            out.is_staff = true;
        }
      }
    }

    for (const k of Object.keys(node)) visit(node[k]);
  };

  visit(raw);
  return out;
}

function normalizeUser(raw: any): AdminUser | null {
  const r = raw?.data ?? (Array.isArray(raw?.results) ? raw.results[0] : raw) ?? raw;
  if (!r || typeof r !== "object") return null;

  const u = r.user && typeof r.user === "object" ? r.user : {};
  const p = r.profile && typeof r.profile === "object" ? r.profile : {};

  const idRaw = pick(r.id, r.user_id, r.pk, u.id, u.user_id, p.id);
  const email = pick(r.email, u.email, p.email, r.email_address, r.mail);
  const username = pick(r.username, u.username, p.username, r.name, r.login);

  const is_staff_top = pick(
    r.is_staff, r.isStaff, r.staff,
    u.is_staff, u.isStaff, u.staff,
    p.is_staff, p.isStaff, p.staff,
    r.is_admin, u.is_admin
  );
  const is_superuser_top = pick(
    r.is_superuser, r.isSuperuser, r.superuser,
    u.is_superuser, u.isSuperuser, u.superuser,
    r.is_admin, u.is_admin
  );
  const deep = extractAdminFlagsDeep(r);

  const id = typeof idRaw === "string" ? Number(idRaw) : idRaw;
  if (typeof id !== "number" || !Number.isFinite(id)) return null;

  const emailStr = typeof email === "string" ? email : "";
  if (emailStr.length === 0) return null;

  const is_staff = toBool(is_staff_top) || deep.is_staff;
  const is_superuser = toBool(is_superuser_top) || deep.is_superuser || deep.is_adminRole;

  return { id, email: emailStr, username, is_staff, is_superuser };
}

/* -------------------- Provider -------------------- */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const clearAuthState = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    setAdmin(null);
  };

  useEffect(() => {
    if (!API) {
      console.error("NEXT_PUBLIC_API_BASE_URL non défini");
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      const access =
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const refresh =
        typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

      if (access && refresh) {
        try {
          const { user_id } = jwtDecode<JwtPayload>(access);
          const res = await fetch(`${API}/users/${user_id}/`, {
            headers: { Authorization: `Bearer ${access}` },
          });

          if (!res.ok) throw new Error(String(res.status));
          const data = await res.json();

          const userData = normalizeUser(data);
          if (userData && (userData.is_superuser || userData.is_staff)) {
            setAdmin(userData);
          } else {
            clearAuthState();
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

    // 1) Récupérer les tokens
    const tokenRes = await fetch(`${API}/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!tokenRes.ok) throw new Error("INVALID_CREDENTIALS");
    const { access, refresh } = await tokenRes.json();

    // 2) Charger le profil avec l’access reçu
    const { user_id } = jwtDecode<JwtPayload>(access);
    const meRes = await fetch(`${API}/users/${user_id}/`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    if (!meRes.ok) throw new Error("PROFILE_ERROR");
    const me = normalizeUser(await meRes.json());
    if (!me) throw new Error("PROFILE_PARSE_ERROR");

    // 3) Vérifier admin
    if (!me.is_staff && !me.is_superuser) {
      // Ne pas stocker les tokens si non-admin
      throw new Error("ADMIN_ONLY");
    }

    // 4) OK → stocker tokens (clés unifiées) et setAdmin
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    setAdmin(me);

    // 5) Route
    router.push("/admin");
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

/** Hook pratique pour l’espace admin */
export function useAdminAuth() {
  const { admin, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) router.push("/admin/login");
  }, [admin, loading, router]);

  return {
    admin,
    loading,
    logout,
    isAuthenticated: !!admin,
  };
}
