"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/components/AuthContext";
import { fetchWithAdminAuth } from "@/lib/fetchWithAdminAuth";
import { Icons } from "../../../src/assets/icons";  
import { toast } from "react-toastify";
import { useLoading, Spinner } from "@/LoadingProvider"; // loader centralisé

type Parameters = {
  n_global: number;
  k_securite: number;
  dod: number;
  k_dimensionnement: number;
  s_max: number;
  i_sec: number;
};
type ParameterKey = keyof Parameters;

const parameterInfo: Record<
  ParameterKey,
  {
    name: string;
    description: string;
    unit?: string;
    range: string;
    step?: string;
  }
> = {
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
    description: "Surdimensionnement max autorisé PV/batteries (0,25 = 25%).",
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

export default function AdminParametersPage() {
  const { admin, loading } = useAdminAuth();
  const { wrap, isBusy } = useLoading(); // ⬅️ on s’aligne sur l’overlay global

  const [parameters, setParameters] = useState<Parameters | null>(null);
  const [editing, setEditing] = useState<ParameterKey | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GET public (AllowAny)
  const fetchParameters = async (withOverlay = true) => {
    setError(null);
    const doFetch = async () => {
      const res = await fetchWithAdminAuth(
        "/parametres/effective/",
        {},
        /*requiresAuth*/ false
      );
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      const obj = await res.json();
      setParameters({
        n_global: obj.n_global,
        k_securite: obj.k_securite,
        dod: obj.dod,
        k_dimensionnement: obj.k_dimensionnement,
        s_max: obj.s_max,
        i_sec: obj.i_sec,
      });
    };

    try {
      if (withOverlay) {
        await wrap(doFetch, "Chargement des paramètres…");
      } else {
        await doFetch();
      }
    } catch (err: any) {
      const msg = err?.message || "Erreur de chargement";
      setError(msg);
      toast.error("Erreur de chargement : " + msg);
    }
  };

  // PUT protégé → adminAccessToken requis
  const saveParameters = async () => {
    if (!parameters) return;
    setError(null);

    try {
      await wrap(async () => {
        const res = await fetchWithAdminAuth(
          "/parametres/effective/",
          { method: "PUT", body: JSON.stringify(parameters) },
          /*requiresAuth*/ true
        );
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status}: ${txt}`);
        }
      }, "Enregistrement…");

      // Re-sync SANS overlay pour éviter wrap imbriqué (= 2 overlays)
      await fetchParameters(false);

      setSaved(true);
      toast.success("Paramètres sauvegardés avec succès.");
      setTimeout(() => setSaved(false), 1800);
      setEditing(null);
    } catch (err: any) {
      const msg = err?.message || "Erreur lors de la sauvegarde";
      setError(msg);
      toast.error("Erreur lors de la sauvegarde : " + msg);
    }
  };

  useEffect(() => {
    if (!loading && admin) {
      void fetchParameters(true);
    }
  }, [loading, admin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Guard de chargement : on n’affiche le spinner local que si l’overlay n’est pas déjà visible
  if (loading || (!parameters && !error)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          {!isBusy && <Spinner size={28} />} {/* ⬅️ évite le double spinner */}
          <span className="text-sm">Chargement…</span>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  if (!parameters) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded text-sm">
          <Icons.AlertTriangle />
          <span>{error || "Impossible de charger les paramètres."}</span>
        </div>
      </div>
    );
  }

  const formatValue = (key: ParameterKey, value: number) =>
    key === "dod" || key === "s_max" ? value.toFixed(2) : String(value);

  return (
    <div className="max-w-7xl mx-auto p-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900">
          <Icons.Settings className="w-7 h-7 text-blue-600" />
          Gestion des paramètres
        </h1>
      </div>

      {error && (
        <div className="mb-4 flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded text-sm">
          <Icons.AlertTriangle />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 rounded-xl">
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
                        disabled={isBusy}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 flex items-center gap-2"
                        title="Enregistrer"
                      >
                        {isBusy ? <Spinner size={14} /> : <Icons.Save size={16} />}
                        <span>Enregistrer</span>
                      </button>
                      <button
                        onClick={() => {
                          void fetchParameters(true);
                          setEditing(null);
                        }}
                        disabled={isBusy}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                        title="Annuler"
                      >
                        <Icons.XCircle size={16} />
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
                      <Icons.Edit size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>

      {saved && (
        <div className="mt-4 flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded text-sm">
          <Icons.CheckCircle />
          <span>Paramètres sauvegardés !</span>
        </div>
      )}
    </div>
  );
}
