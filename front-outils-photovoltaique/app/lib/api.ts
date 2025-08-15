// app/lib/api.ts
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { CalculationInput, CalculationResult, ApiError } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api";

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth = true
): Promise<T> {
  // endpoint est relatif, ex: "/dimensionnements/"
  const res = await fetchWithAuth(endpoint, options, requiresAuth);

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    const error: ApiError = {
      name: "ApiError",
      message: `Erreur ${res.status}: ${errorText || res.statusText}`,
      status: res.status,
      details: errorText,
    };
    throw error;
  }

  const noContent = res.status === 204 || res.headers.get("content-length") === "0";
  if (noContent) return null as T;

  return (await res.json()) as T;
}

// ---------- API protégée ----------
export const dimensionnementAPI = {
  getAll: async (): Promise<CalculationResult[]> =>
    apiCall<CalculationResult[]>("/dimensionnements/"),
  getById: async (id: number): Promise<CalculationResult> =>
    apiCall<CalculationResult>(`/dimensionnements/${id}/`),
  delete: async (id: number): Promise<void> =>
    apiCall<void>(`/dimensionnements/${id}/`, { method: "DELETE" }),
  calculate: async (data: CalculationInput): Promise<CalculationResult> =>
    apiCall<CalculationResult>("/dimensionnements/calculate/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ---------- API publique (si tu la conserves ouverte) ----------
export const publicAPI = {
  calculate: async (data: CalculationInput): Promise<CalculationResult> => {
    const response = await fetch(`${API_BASE_URL}/dimensionnements/calculate/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      const error: ApiError = {
        name: "ApiError",
        message: `Erreur ${response.status}: ${errorText || response.statusText}`,
        status: response.status,
        details: errorText,
      };
      throw error;
    }
    return (await response.json()) as CalculationResult;
  },
};
