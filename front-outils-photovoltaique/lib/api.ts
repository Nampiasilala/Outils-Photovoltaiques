// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';

export async function apiCall(endpoint: string, options: RequestInit = {}) {
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
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    // Si c'est une requête DELETE qui réussit, elle peut ne pas avoir de contenu
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur API pour ${endpoint}:`, error);
    throw error;
  }
}

// Fonctions spécifiques pour votre API
export const dimensionnementAPI = {
  // Calculer un dimensionnement
  calculate: async (data: any) => {
    return apiCall('/dimensionnements/calculate/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Récupérer tous les dimensionnements
  getAll: async () => {
    return apiCall('/dimensionnements/');
  },

  // Supprimer un dimensionnement
  delete: async (id: number) => {
    return apiCall(`/dimensionnements/${id}/`, {
      method: 'DELETE',
    });
  },

  // Récupérer un dimensionnement par ID
  getById: async (id: number) => {
    return apiCall(`/dimensionnements/${id}/`);
  },
};