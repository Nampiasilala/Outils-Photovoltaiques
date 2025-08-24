// app/lib/api.ts
import type { CalculationInput, CalculationResult, ApiError } from "@/types/api";

// Vérifie bien le chemin de env.ts (voir Remarque #1)
import { env } from "@/lib/env";
// import { env } from "@/lib/env"; // <-- utilise ceci si tu as déplacé env.ts à la racine /lib

// Si fetchWithAdminAuth ajoute le header Authorization quand requiresAuth=true
import { fetchWithAdminAuth } from "@/lib/fetchWithAdminAuth";

/* Helpers */

const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

const withJsonHeaders = (init: RequestInit = {}): RequestInit => {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  // Ajoute Content-Type si on envoie un body string
  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return { ...init, headers };
};

const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL;

/* Requête générique */

export async function apiCall<T = any>(
  endpoint: string,              // ex: "/dimensionnements/"
  options: RequestInit = {},
  requiresAuth = true
): Promise<T> {
  const url = joinUrl(API_BASE_URL, endpoint);
  const init = withJsonHeaders(options);

  // Si besoin d’auth → utilise le helper, sinon fetch normal
  const res = requiresAuth
    ? await fetchWithAdminAuth(url, init)
    : await fetch(url, init);

  if (!res.ok) {
    // Essaie de remonter un message JSON lisible si dispo
    let msg = res.statusText || `HTTP ${res.status}`;
    try {
      const data = await res.clone().json();
      msg = (data?.detail as string) || (data?.message as string) || JSON.stringify(data);
    } catch { /* ignore */ }

    const error: ApiError = {
      name: "ApiError",
      message: `Erreur ${res.status}: ${msg}`,
      status: res.status,
      details: await res.text().catch(() => undefined),
    };
    throw error;
  }

  // No Content / réponses vides
  const noContent =
    res.status === 204 ||
    res.status === 304 ||
    res.headers.get("content-length") === "0";
  if (noContent) return null as T;

  return (await res.json()) as T;
}

/* Endpoints protégés */

export const dimensionnementAPI = {
  getAll: (): Promise<CalculationResult[]> =>
    apiCall<CalculationResult[]>("/dimensionnements/"),

  getById: (id: number): Promise<CalculationResult> =>
    apiCall<CalculationResult>(`/dimensionnements/${id}/`),

  delete: (id: number): Promise<void> =>
    apiCall<void>(`/dimensionnements/${id}/`, { method: "DELETE" }),

  calculate: (data: CalculationInput): Promise<CalculationResult> =>
    apiCall<CalculationResult>("/dimensionnements/calculate/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/* Endpoint public (si tu le gardes ouvert) */

export const publicAPI = {
  calculate: async (data: CalculationInput): Promise<CalculationResult> => {
    // Ici pas d’auth → requiresAuth=false, on réutilise apiCall pour rester DRY
    return apiCall<CalculationResult>(
      "/dimensionnements/calculate/",
      { method: "POST", body: JSON.stringify(data) },
      /* requiresAuth */ false
    );
  },
};
