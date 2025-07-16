'use client';

import { useState, useEffect } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  Info,
  Save,
  Edit,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface Parameters {
  n_global: number;
  k_securite: number;
  dod: number;
  k_dimensionnement: number;
  h_solaire: number;
}

interface ParameterInfo {
  name: string;
  description: string;
  unit: string;
  range: string;
}

type ParameterKey = keyof Parameters;

export default function DefaultValue() {
  const { user, logout } = useAuth();
  const [parameters, setParameters] = useState<Parameters>({
    n_global:         0.75,
    k_securite:       1.3,
    dod:              0.5,
    k_dimensionnement:1.25,
    h_solaire:        5.5,
  });
  const [paramId, setParamId] = useState<number | null>(null);
  const [editing, setEditing] = useState<ParameterKey | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parameterInfo: Record<ParameterKey, ParameterInfo> = {
    n_global: {
      name: 'Rendement Global',
      description: 'Rendement global du système (0.7–0.8 typique)',
      unit: '',
      range: '0.6–0.9',
    },
    k_securite: {
      name: 'Coefficient de Sécurité',
      description: 'Marge de sécurité pour les calculs (1.2–1.4 recommandé)',
      unit: '',
      range: '1.1–1.5',
    },
    dod: {
      name: 'Profondeur de Décharge',
      description: 'Profondeur de décharge maximale des batteries',
      unit: '%',
      range: '0.3–0.8',
    },
    k_dimensionnement: {
      name: 'Coeff. Dimensionnement',
      description: 'Coefficient de dimensionnement des panneaux',
      unit: '',
      range: '1.2–1.4',
    },
    h_solaire: {
      name: 'Heures Solaires',
      description: "Nombre d'heures d'ensoleillement par jour",
      unit: 'h',
      range: '4.0–8.0',
    },
  };

  // 🔄 Chargement des params
  const fetchParameters = async () => {
    setLoading(true);
    setError(null);

    if (!user) {
      logout();
      return;
    }

    try {
      const res = await fetchWithAuth('/parametres/');
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        throw new Error(`Erreur HTTP ${res.status}`);
      }
      const allParams: Array<Parameters & { id: number; user: number }> = await res.json();
      const mine = allParams.find(p => p.user === user.id);
      if (mine) {
        setParameters({
          n_global:          mine.n_global,
          k_securite:        mine.k_securite,
          dod:               mine.dod,
          k_dimensionnement: mine.k_dimensionnement,
          h_solaire:         mine.h_solaire,
        });
        setParamId(mine.id);
      } else {
        setParamId(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // 💾 Sauvegarde POST/PUT
  const saveParameters = async () => {
    if (!user) {
      logout();
      return;
    }

    setLoading(true);
    setError(null);

    const payload = { ...parameters, user: user.id };
    const url     = paramId ? `/parametres/${paramId}/` : '/parametres/';
    const method  = paramId ? 'PUT' : 'POST';

    try {
      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      const savedData = await res.json();
      setParamId(savedData.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erreur sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParameters();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null; // logout() redirige déjà
  }

  const formatValue = (key: ParameterKey, value: number) => {
    if (key === 'dod')       return `${(value * 100).toFixed(0)}%`;
    if (key === 'h_solaire') return `${value.toFixed(1)}h`;
    return value.toString();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {error && (
        <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded">
          <AlertTriangle />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(Object.entries(parameters) as [ParameterKey, number][]).map(
          ([key, value]) => {
            const info     = parameterInfo[key];
            const isEditing = editing === key;
            return (
              <div
                key={key}
                className="bg-white border rounded-lg shadow p-4 flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{info.name}</h3>
                  <Info className="cursor-pointer" />
                </div>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={value}
                      step="0.01"
                      onChange={e =>
                        setParameters(p => ({
                          ...p,
                          [key]: Number(e.target.value),
                        }))
                      }
                      className="border rounded px-2 py-1 w-24"
                    />
                    {info.unit && <span>{info.unit}</span>}
                  </div>
                ) : (
                  <div className="text-2xl">{formatValue(key, value)}</div>
                )}
                <div className="mt-auto pt-2 flex space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          saveParameters();
                          setEditing(null);
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => {
                          fetchParameters();
                          setEditing(null);
                        }}
                        className="bg-gray-500 text-white px-3 py-1 rounded"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditing(key);
                        setSaved(false);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>

      {saved && (
        <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded">
          <CheckCircle />
          <span>Paramètres sauvegardés !</span>
        </div>
      )}
    </div>
  );
}
