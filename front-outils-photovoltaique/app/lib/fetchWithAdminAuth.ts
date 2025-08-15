// app/lib/fetchWithAdminAuth.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

/** Rafraîchit le token admin et retourne le nouvel access token. */
async function refreshAdmin(): Promise<string> {
  const refresh = localStorage.getItem("adminRefreshToken");
  if (!refresh) throw new Error("Pas de refresh token");

  const res = await fetch(`${API_BASE}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) throw new Error("Refresh échoué");

  const { access } = await res.json();
  localStorage.setItem("adminAccessToken", access);
  return access;
}

/**
 * fetchWithAdminAuth:
 *  - Préfixe automatiquement l’URL relative avec API_BASE
 *  - Ajoute Authorization: Bearer <adminAccessToken> si requiresAuth=true
 *  - Si 401 → tente refreshAdmin() puis réessaie une fois
 *  - Si encore 401 / refresh ko → purge et redirige /admin/login
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

  let access = requiresAuth ? localStorage.getItem("adminAccessToken") : null;

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
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      window.location.href = "/admin/login";
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
      window.location.href = "/admin/login";
      throw new Error("Non autorisé");
    }
  }

  return res;
}

/** Pratique: header d’auth admin à utiliser pour tes requêtes JSON. */
export function adminAuthHeader(): Record<string, string> {
  const t = localStorage.getItem("adminAccessToken");
  return t
    ? { Authorization: `Bearer ${t}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}
