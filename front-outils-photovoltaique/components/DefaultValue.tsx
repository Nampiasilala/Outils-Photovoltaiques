"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  AlertTriangle,
  Info,
  Save,
  Edit,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Parameters {
  n_global: number; // 0..1
  k_securite: number; // >=1
  dod: number; // 0..1 (ex: 0.50 = 50%)
  k_dimensionnement: number; // >=1
  s_max: number; // 0..1 (ex: 0.25 = 25%)
  i_sec: number; // >=1 (ex: 1.25)
}

interface ParameterInfo {
  name: string;
  description: string;
  unit?: string;
  range: string;
  step?: string;
}

type ParameterKey = keyof Parameters;

export default function DefaultValue() {
  // On ne met PAS de valeurs “en dur” : on attend la réponse serveur
  const [parameters, setParameters] = useState<Parameters | null>(null);
  const [editing, setEditing] = useState<ParameterKey | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parameterInfo: Record<ParameterKey, ParameterInfo> = {
    n_global: {
      name: "Rendement global",
      description:
        "Rendement global PV→régulateur→batterie→onduleur (typ. 0,70–0,80).",
      range: "0.60–0.90",
      step: "0.01",
    },
    k_securite: {
      name: "Coefficient de sécurité",
      description: "Marge pour pertes & aléas (typ. 1,20–1,40).",
      range: "1.10–1.50",
      step: "0.01",
    },
    dod: {
      name: "Profondeur de décharge (DoD)",
      description: "Fraction max de décharge (0,50 = 50%).",
      range: "0.30–0.80",
      step: "0.01",
    },
    k_dimensionnement: {
      name: "Coeff. dimensionnement onduleur",
      description: "Marge sur la puissance onduleur (typ. 1,20–1,40).",
      range: "1.10–1.50",
      step: "0.01",
    },
    s_max: {
      name: "Seuil de surdimensionnement (Smax)",
      description:
        "Surdimensionnement max autorisé pour PV et batteries (0,25 = 25%).",
      range: "0.00–0.50",
      step: "0.01",
    },
    i_sec: {
      name: "Marge courant régulateur (Isec)",
      description: "Facteur de sécurité sur le courant régulateur (ex. 1,25).",
      range: "1.00–1.50",
      step: "0.01",
    },
  };

  const fetchParameters = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ toujours un chemin avec slash initial
      const res = await fetchWithAuth("/parametres/effective/");
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      const obj = await res.json();
      // On fait confiance au backend pour fournir tous les champs
      setParameters({
        n_global: obj.n_global,
        k_securite: obj.k_securite,
        dod: obj.dod,
        k_dimensionnement: obj.k_dimensionnement,
        s_max: obj.s_max,
        i_sec: obj.i_sec,
      });
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "Erreur de chargement";
      setError(msg);
      toast.error("Erreur de chargement : " + msg);
    } finally {
      setLoading(false);
    }
  };

  const saveParameters = async () => {
    if (!parameters) return;
    setLoading(true);
    setError(null);
    try {
      // Mise à jour complète via PUT (on peut faire PATCH si tu préfères partiel)
      const res = await fetchWithAuth("/parametres/effective/", {
        method: "PUT",
        body: JSON.stringify(parameters),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      await fetchParameters(); // relire l’état serveur
      setSaved(true);
      toast.success("Paramètres sauvegardés avec succès.");
      setTimeout(() => setSaved(false), 2000);
      setEditing(null);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "Erreur lors de la sauvegarde";
      setError(msg);
      toast.error("Erreur lors de la sauvegarde : " + msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParameters();
  }, []);

  if (loading || !parameters) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const formatValue = (key: ParameterKey, value: number) => {
    // Affichage simple : DoD/Smax en décimal (0.50), tu peux choisir en %
    return key === "dod" || key === "s_max"
      ? value.toFixed(2) // ex: 0.50
      : value.toString();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {error && (
        <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded text-sm">
          <AlertTriangle />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.entries(parameters) as [ParameterKey, number][]).map(
          ([key, value]) => {
            const info = parameterInfo[key];
            const isEditing = editing === key;
            return (
              <div
                key={key}
                className="bg-white border rounded-lg shadow p-4 flex flex-col text-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{info.name}</h3>
                  <span
                    title={info.description}
                    className="inline-flex"
                  ></span>{" "}
                </div>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={Number.isFinite(value) ? value : 0}
                      step={info.step ?? "0.01"}
                      onChange={(e) =>
                        setParameters((p) =>
                          p ? { ...p, [key]: Number(e.target.value) } : p
                        )
                      }
                      className="border rounded px-2 py-1 w-28 text-sm"
                    />
                    {info.unit && <span className="text-sm">{info.unit}</span>}
                  </div>
                ) : (
                  <div className="text-xl">{formatValue(key, value)}</div>
                )}

                <div className="text-xs text-gray-500 mt-1">
                  Plage conseillée : {info.range}
                </div>

                <div className="mt-auto pt-3 flex space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveParameters}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        title="Enregistrer"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => {
                          fetchParameters(); // revert depuis serveur
                          setEditing(null);
                        }}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                        title="Annuler"
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
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      title="Modifier"
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
        <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded text-sm">
          <CheckCircle />
          <span>Paramètres sauvegardés !</span>
        </div>
      )}
    </div>
  );
}
