// app/lib/fetchWithAdminAuth.ts
import { env } from "@/lib/env";
const API_BASE = env.NEXT_PUBLIC_API_BASE_URL;

/** Helpers: lis n'importe quelle paire de clés (nouvelles ou anciennes) */
function getAccessToken(): string | null {
  return (
    localStorage.getItem("adminAccessToken") ||
    localStorage.getItem("accessToken") ||
    null
  );
}
function getRefreshToken(): string | null {
  return (
    localStorage.getItem("adminRefreshToken") ||
    localStorage.getItem("refreshToken") ||
    null
  );
}
/** Écris sous les deux jeux de clés pour rester compatible partout */
function setAccessToken(value: string) {
  localStorage.setItem("adminAccessToken", value);
  localStorage.setItem("accessToken", value);
}
function setRefreshToken(value: string) {
  localStorage.setItem("adminRefreshToken", value);
  localStorage.setItem("refreshToken", value);
}

/** Rafraîchit le token et réplique sur les 2 noms de clés */
async function refreshAdmin(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("Pas de refresh token");

  const res = await fetch(`${API_BASE}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) throw new Error("Refresh échoué");

  const { access } = await res.json();
  setAccessToken(access);
  return access;
}

/**
 * fetchWithAdminAuth:
 *  - Préfixe URL relative avec API_BASE
 *  - Ajoute Authorization: Bearer <token> si requiresAuth
 *  - 401 => tente refresh() puis réessaie une fois
 *  - Échec => purge les 2 paires de clés + redirige /admin/login
 */
export async function fetchWithAdminAuth(
  input: RequestInfo,
  init: RequestInit = {},
  requiresAuth = true
): Promise<Response> {
  const url =
    typeof input === "string" && !/^https?:\/\//i.test(input)
      ? `${API_BASE}${input}`
      : input;

  let access = requiresAuth ? getAccessToken() : null;

  const headers = {
    "Content-Type": "application/json",
    ...(init.headers as object),
    ...(requiresAuth && access ? { Authorization: `Bearer ${access}` } : {}),
  };

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401 && requiresAuth) {
    try {
      access = await refreshAdmin();
    } catch {
      // purge toutes les variantes
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/admin-login";
      throw new Error("Session expirée");
    }

    const retryHeaders = {
      "Content-Type": "application/json",
      ...(init.headers as object),
      Authorization: `Bearer ${access}`,
    };
    res = await fetch(url, { ...init, headers: retryHeaders });

    if (res.status === 401) {
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/admin-login";
      throw new Error("Non autorisé");
    }
  }

  return res;
}

/** Header pratique (réplique sur les 2 clés) */
export function adminAuthHeader(): Record<string, string> {
  const t = getAccessToken();
  return t
    ? { Authorization: `Bearer ${t}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}
