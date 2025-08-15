// lib/api.ts
import type { CalculationInput, CalculationResult, ApiError } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';

export async function apiCall<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const errorText = await response.text();
    const error: ApiError = {
    name: 'ApiError',
    message: `Erreur ${response.status}: ${errorText}`,
    status: response.status,
    details: errorText,
    };
      throw error;
    }

    // Si c'est une requête DELETE qui réussit, elle peut ne pas avoir de contenu
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as T;
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`Erreur API pour ${endpoint}:`, error);
    throw error;
  }
}

// Fonctions spécifiques pour votre API
export const dimensionnementAPI = {
  // Calculer un dimensionnement
  calculate: async (data: CalculationInput): Promise<CalculationResult> => {
    return apiCall<CalculationResult>('/dimensionnements/calculate/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Récupérer tous les dimensionnements
  getAll: async (): Promise<CalculationResult[]> => {
    return apiCall<CalculationResult[]>('/dimensionnements/');
  },

  // Supprimer un dimensionnement
  delete: async (id: number): Promise<void> => {
    return apiCall<void>(`/dimensionnements/${id}/`, {
      method: 'DELETE',
    });
  },

  // Récupérer un dimensionnement par ID
  getById: async (id: number): Promise<CalculationResult> => {
    return apiCall<CalculationResult>(`/dimensionnements/${id}/`);
  },
};

// API publique (sans authentification) - pour votre composant
export const publicAPI = {
  calculate: async (data: CalculationInput): Promise<CalculationResult> => {
    const response = await fetch(`${API_BASE_URL}/dimensionnements/calculate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
        const error: ApiError = {
        name: 'ApiError',
        message: `Erreur ${response.status}: ${errorText}`,
        status: response.status,
        details: errorText,
        };
      throw error;
    }

    return await response.json() as CalculationResult;
  },
};