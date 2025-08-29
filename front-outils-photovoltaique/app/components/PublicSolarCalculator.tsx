"use client";

import { useState, useEffect } from "react";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import {
  formatPrice,
  formatEnergyLocale,
  formatNumber,
  formatPower,
  formatCapacity,
  formatVoltage,
} from "@/utils/formatters";
import type { CalculationInput, CalculationResult } from "@/types/api";
import { Icons } from "../../src/assets/icons";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";
import { useLoading, Spinner } from "@/LoadingProvider";
import { env } from "@/lib/env";

/* ============================ Types étendus (locaux) ============================ */
// ✅ étend le type côté front pour exploiter le payload enrichi du backend
type CalcResultExtended = CalculationResult & {
  equipements_recommandes?: {
    panneau?: any;
    batterie?: any;
    regulateur?: any;
    onduleur?: any;
    cable?: any;
  };
  // topologie
  nb_batt_serie?: number;
  nb_batt_parallele?: number;
  topologie_batterie?: string;
  nb_pv_serie?: number;
  nb_pv_parallele?: number;
  topologie_pv?: string;
  // câble global
  longueur_cable_global_m?: number;
  prix_cable_global?: number;
  // id utile
  dimensionnement_id?: number;
};

/* ========================== Info Button + Modal ========================== */

function InfoButton({
  title,
  html,
  children,
}: {
  title: string;
  html?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ml-2 inline-flex items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 w-6 h-6"
        aria-label={`Informations : ${title}`}
        title="Informations"
      >
        <Icons.Info className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border border-slate-200">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-slate-100"
                  aria-label="Fermer"
                >
                  <Icons.X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <div className="px-5 py-4 text-sm text-slate-700 space-y-2">
                {html ? (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                ) : (
                  children
                )}
              </div>
              <div className="px-5 py-3 border-t flex justify-end">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded bg-slate-900 text-white text-sm hover:bg-black"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================ API (publique) ============================ */

const publicAPI = {
  calculate: async (data: CalculationInput): Promise<CalculationResult> => {
    const API_BASE = env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${API_BASE}/dimensionnements/calculate/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }
    return (await response.json()) as CalculationResult;
  },
};

// aide dynamique depuis la base
type HelpMapItem = {
  title: string;
  body_html: string;
};
type HelpMap = Record<string, HelpMapItem>;

async function fetchHelpFromDB(keys: string[]): Promise<HelpMap> {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001/api";
  const params = encodeURIComponent(keys.join(","));
  const url = `${API_BASE}/contenus/public/help-by-key/?keys=${params}`;

  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const out: HelpMap = {};
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        if (item?.key) {
          out[item.key] = {
            title: item.title || "",
            body_html: item.body_html || item.bodyHtml || item.body || "",
          };
        }
      });
    } else if (data && typeof data === "object") {
      Object.entries<any>(data).forEach(([k, v]) => {
        out[k] = {
          title: v?.title || "",
          body_html: v?.body_html || v?.bodyHtml || v?.body || "",
        };
      });
    }
    return out;
  } catch {
    return {};
  }
}

/* ===================== Helper: auto-suggestion tension ===================== */
// Choisit une tension batterie en fonction de P_max.
// Ajuste les seuils si besoin (800W / 2000W).
const suggestBatteryVoltage = (pmax: number): 12 | 24 | 48 => {
  if (!Number.isFinite(pmax) || pmax <= 0) return 24; // neutre par défaut
  if (pmax <= 800) return 12;
  if (pmax <= 2000) return 24;
  return 48;
};

/* ============================ Composant main ============================ */

interface FormData {
  E_jour: number;
  P_max: number;
  N_autonomie: number;
  H_solaire: number;
  V_batterie: number;
  localisation: string;
  H_vers_toit: number;
  priorite_selection: "cout" | "quantite";
}

const formatPriceWithCurrency = (n?: number | null, currency?: string) => {
  if (typeof n !== "number") return "—";
  if (currency === "MGA") return formatPrice(n);
  const formatted = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} ${currency || "Ar"}`;
};

const EquipCard = ({
  title,
  c,
  extra,
  icon: Icon,
}: {
  title: string;
  c: any | null | undefined;
  extra?: React.ReactNode;
  icon: any;
}) => (
  <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-5 h-5 text-gray-600" />
      <h4 className="font-semibold text-gray-700">{title}</h4>
    </div>
    {c ? (
      <ul className="mt-2 text-sm space-y-2">
        <li className="flex justify-between">
          <span>Modèle :</span>
          <strong>{c.modele}</strong>
        </li>
        {c.reference && (
          <li className="flex justify-between">
            <span>Référence :</span>
            <strong className="text-xs font-mono">{c.reference}</strong>
          </li>
        )}
        {c.puissance_W && (
          <li className="flex justify-between">
            <span>Puissance :</span>
            <strong>{formatPower(c.puissance_W)}</strong>
          </li>
        )}
        {c.capacite_Ah && (
          <li className="flex justify-between">
            <span>Capacité :</span>
            <strong>{formatCapacity(c.capacite_Ah)}</strong>
          </li>
        )}
        {c.tension_nominale_V && (
          <li className="flex justify-between">
            <span>Tension :</span>
            <strong>{formatVoltage(c.tension_nominale_V)}</strong>
          </li>
        )}
        <li className="flex justify-between border-t pt-2 mt-2">
          <span>Prix unitaire :</span>
          <strong className="text-green-600">
            {formatPriceWithCurrency(c.prix_unitaire, c.devise)}
          </strong>
        </li>
        {extra}
      </ul>
    ) : (
      <p className="mt-2 text-sm text-gray-500">Aucune recommandation.</p>
    )}
  </div>
);

export default function PublicSolarCalculator() {
  const { generatePDF, isGenerating } = usePDFGenerator();
  const { wrap } = useLoading();

  const [formData, setFormData] = useState<FormData>({
    E_jour: 0,
    P_max: 0,
    N_autonomie: 1,
    H_solaire: 4.5,
    V_batterie: 24,
    localisation: "",
    H_vers_toit: 10,
    priorite_selection: "cout",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Aide dynamique
  const [help, setHelp] = useState<HelpMap>({});
  useEffect(() => {
    const keys = [
      "e_jour",
      "p_max",
      "n_autonomie",
      "v_batterie",
      "localisation",
      "h_solaire",
      "h_vers_toit",
      "priorite_selection",
    ];
    fetchHelpFromDB(keys).then(setHelp);
  }, []);

  // Géocodage & Irradiation
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingIrradiation, setLoadingIrradiation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [debouncedLocalisation] = useDebounce(formData.localisation, 500);
  const [manualBattery, setManualBattery] = useState(false);

  useEffect(() => {
    if (!manualBattery) {
      const suggested = suggestBatteryVoltage(formData.P_max);
      setFormData((prev) =>
        prev.V_batterie === suggested
          ? prev
          : { ...prev, V_batterie: suggested }
      );
    }
  }, [formData.P_max, manualBattery]);

  useEffect(() => {
    if (debouncedLocalisation && !selectedLocation) {
      setLoadingIrradiation(true);
      const fetchLocations = async () => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${debouncedLocalisation}&format=json&limit=5`
          );
          const data = await res.json();
          setSuggestions(data);
        } catch (error) {
          console.error(
            "Erreur lors de la recherche de la localisation",
            error
          );
        } finally {
          setLoadingIrradiation(false);
        }
      };
      fetchLocations();
    } else {
      setSuggestions([]);
    }
  }, [debouncedLocalisation, selectedLocation]);

  const fetchIrradiation = async (lat: number, lon: number) => {
    setLoadingIrradiation(true);
    try {
      const startYear = new Date().getFullYear() - 1;
      const endYear = new Date().getFullYear();
      const api_url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&start=${startYear}&end=${endYear}&format=json`;
      const res = await fetch(api_url);
      const data = await res.json();

      const annualData = data.properties.parameter.ALLSKY_SFC_SW_DWN;
      const values = Object.values(annualData)
        .map((val) => val as number)
        .filter((val) => val !== -999);
      const avgIrradiation =
        values.reduce((sum, current) => sum + current, 0) / values.length;

      updateField("H_solaire", parseFloat(avgIrradiation.toFixed(2)));
    } catch (error) {
      console.error("Erreur lors de la récupération de l'irradiation", error);
      toast.error(
        "Impossible de récupérer l'irradiation pour cette localisation."
      );
      updateField("H_solaire", 0);
    } finally {
      setLoadingIrradiation(false);
    }
  };

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectLocation = (location: any) => {
    updateField("localisation", location.display_name);
    setSelectedLocation(location);
    setSuggestions([]);
    fetchIrradiation(parseFloat(location.lat), parseFloat(location.lon));
  };

  const validate = () => {
    const errs: string[] = [];
    if (formData.E_jour <= 0)
      errs.push("La consommation journalière doit être > 0.");
    if (formData.P_max <= 0) errs.push("La puissance max doit être > 0.");
    if (formData.N_autonomie <= 0)
      errs.push("Le nombre de jours d'autonomie doit être > 0.");
    if (formData.H_solaire <= 0) errs.push("L'irradiation doit être > 0.");
    if (![12, 24, 48].includes(formData.V_batterie))
      errs.push("La tension doit être 12 V, 24 V ou 48 V.");
    if (!formData.localisation.trim())
      errs.push("La localisation est requise.");
    if (formData.H_vers_toit <= 0)
      errs.push("La hauteur vers le toit doit être > 0.");

    setErrors(errs);
    return errs.length === 0;
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    const pdfData = {
      result,
      inputData: {
        E_jour: formData.E_jour,
        P_max: formData.P_max,
        N_autonomie: formData.N_autonomie,
        H_solaire: formData.H_solaire,
        V_batterie: formData.V_batterie,
        localisation: formData.localisation,
        H_vers_toit: formData.H_vers_toit,
        priorite_selection: formData.priorite_selection,
      },
    };
    await generatePDF(pdfData);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsCalculating(true);
    try {
      const payload = {
        E_jour: formData.E_jour,
        P_max: formData.P_max,
        N_autonomie: formData.N_autonomie,
        H_solaire: formData.H_solaire,
        V_batterie: formData.V_batterie,
        localisation: formData.localisation,
        H_vers_toit: formData.H_vers_toit,
        priorite_selection: formData.priorite_selection,
      };

      const data: CalculationResult = await wrap(
        () => publicAPI.calculate(payload),
        "Calcul en cours…"
      );
      setResult(data);
      setErrors([]);
      toast.success("Calcul effectué avec succès !");
    } catch (err: any) {
      console.error("Erreur lors du calcul:", err);
      if (err?.message?.includes("400")) {
        toast.error("Données invalides. Vérifiez vos saisies.");
        setErrors(["Veuillez vérifier les données saisies"]);
      } else if (err?.message?.includes("429")) {
        toast.error(
          "Trop de requêtes. Veuillez patienter avant de relancer le calcul."
        );
        setErrors(["Limite de calculs atteinte. Veuillez patienter."]);
      } else {
        setResult(null);
        setErrors([err?.message || "Erreur inattendue"]);
        toast.error(err?.message || "Erreur lors du calcul");
      }
    } finally {
      setIsCalculating(false);
    }
  };

  const R = (result || {}) as CalcResultExtended; // ✅ accès simple aux champs étendus

  return (
    <div className="space-y-8">
      {/* Formulaire */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Consommation */}
            <section className="bg-gray-50 p-6 rounded-xl">
              <h3 className="flex items-center gap-2 font-semibold mb-4 text-gray-800">
                <Icons.Zap className="text-yellow-500" /> Consommation
              </h3>

              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Consommation journalière (Wh)
                </label>
                <InfoButton
                  title={help.e_jour?.title || "Consommation journalière (Wh)"}
                  html={help.e_jour?.body_html}
                >
                  <p>
                    Somme de l’énergie consommée sur 24&nbsp;h (puissance ×
                    durée).
                  </p>
                </InfoButton>
              </div>
              <input
                type="number"
                className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.E_jour}
                onChange={(e) => updateField("E_jour", +e.target.value)}
                placeholder="Ex: 1520"
              />

              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Puissance max (W)
                </label>
                <InfoButton
                  title={help.p_max?.title || "Puissance max (W)"}
                  html={help.p_max?.body_html}
                >
                  <p>Pic de puissance utilisé simultanément.</p>
                </InfoButton>
              </div>
              <input
                type="number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.P_max}
                onChange={(e) => updateField("P_max", +e.target.value)}
                placeholder="Ex: 400"
              />
            </section>

            {/* Configuration */}
            <section className="bg-gray-50 p-6 rounded-xl">
              <h3 className="flex items-center gap-2 font-semibold mb-4 text-gray-800">
                <Icons.Settings className="text-purple-500" /> Configuration
              </h3>

              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Jours d'autonomie
                </label>
                <InfoButton
                  title={help.n_autonomie?.title || "Jours d’autonomie"}
                  html={help.n_autonomie?.body_html}
                >
                  <p>Jours sans soleil couverts par les batteries.</p>
                </InfoButton>
              </div>
              <input
                type="number"
                className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.N_autonomie}
                onChange={(e) => updateField("N_autonomie", +e.target.value)}
                min={1}
              />

              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tension batterie
                </label>
                <InfoButton
                  title={help.v_batterie?.title || "Tension batterie"}
                  html={help.v_batterie?.body_html}
                >
                  <p>12&nbsp;V, 24&nbsp;V ou 48&nbsp;V selon la puissance.</p>
                </InfoButton>
              </div>
              <div className="grid grid-cols-3 gap-2 w-full">
                {[12, 24, 48].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setManualBattery(true); // 👉 l’utilisateur force le choix
                      updateField("V_batterie", v);
                    }}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                      formData.V_batterie === v
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {v}V
                  </button>
                ))}
              </div>

              {/* (optionnel) Indication de mode + lien retour auto */}
              <div className="mt-1 text-xs text-slate-600">
                Mode : <b>{manualBattery ? "manuel" : "auto"}</b>
                {!manualBattery && formData.P_max > 0 && (
                  <>
                    {" "}
                    — suggestion&nbsp;: {suggestBatteryVoltage(formData.P_max)}V
                  </>
                )}
              </div>
              {manualBattery && (
                <button
                  type="button"
                  onClick={() => setManualBattery(false)}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
                  title="Revenir à la sélection automatique basée sur la puissance maximale"
                >
                  Revenir au choix automatique (basé sur P_max)
                </button>
              )}

              {/* Stratégie de sélection */}
              <div className="flex items-center justify-between mb-2 mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Stratégie de sélection des équipements
                </label>
                <InfoButton
                  title={
                    help.priorite_selection?.title || "Stratégie de sélection"
                  }
                  html={help.priorite_selection?.body_html}
                >
                  <ul className="list-disc pl-5">
                    <li>
                      <b>Coût minimal</b> : minimise le coût total.
                    </li>
                    <li>
                      <b>Nombre minimal</b> : minimise le nombre d’unités.
                    </li>
                    <li>
                      Dans tous les cas, on respecte d’abord le{" "}
                      <b>surdimensionnement max</b>.
                    </li>
                  </ul>
                </InfoButton>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  type="button"
                  onClick={() => updateField("priorite_selection", "cout")}
                  className={`w-full px-3 py-2 rounded-lg font-medium transition-all ${
                    formData.priorite_selection === "cout"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  Coût minimal
                </button>
                <button
                  type="button"
                  onClick={() => updateField("priorite_selection", "quantite")}
                  className={`w-full px-3 py-2 rounded-lg font-medium transition-all ${
                    formData.priorite_selection === "quantite"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  Nombre minimal
                </button>
              </div>
            </section>

            {/* Environnement */}
            <section className="bg-gray-50 p-6 rounded-xl">
              <h3 className="flex items-center gap-2 font-semibold mb-4 text-gray-800">
                <Icons.Globe className="text-green-500" /> Environnement
              </h3>

              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Localisation
                </label>
                <InfoButton
                  title={help.localisation?.title || "Localisation"}
                  html={help.localisation?.body_html}
                >
                  <p>Ville/lieu utilisé pour estimer l’irradiation.</p>
                </InfoButton>
              </div>
              <div className="relative mb-4">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.localisation}
                    onChange={(e) => {
                      updateField("localisation", e.target.value);
                      setSelectedLocation(null);
                    }}
                    placeholder="Ex: Antananarivo"
                  />
                  <Icons.Search
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
                {loadingIrradiation && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-3 text-center text-gray-500 flex items-center justify-center gap-2">
                    <Spinner className="w-4 h-4" />
                    Chargement...
                  </div>
                )}
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.map((loc, i) => (
                      <li
                        key={i}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                        onClick={() => handleSelectLocation(loc)}
                      >
                        <div className="font-medium text-sm">
                          {loc.display_name}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Irradiation (kWh/m²/j)
                </label>
                <InfoButton
                  title={help.h_solaire?.title || "Irradiation (kWh/m²/j)"}
                  html={help.h_solaire?.body_html}
                >
                  <p>Énergie solaire moyenne reçue par m² et par jour.</p>
                </InfoButton>
              </div>
              <input
                type="number"
                step="0.1"
                className={`w-full mb-6 p-3 border border-gray-300 rounded-lg transition-all ${
                  selectedLocation
                    ? "bg-gray-100 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
                value={formData.H_solaire}
                onChange={(e) => updateField("H_solaire", +e.target.value)}
                disabled={!!selectedLocation}
                placeholder="Ex: 4.5"
              />
              {selectedLocation && (
                <p className="text-xs text-green-600 -mt-4 mb-4 p-2 bg-green-50 rounded border border-green-200">
                  ✓ Irradiation calculée automatiquement.
                </p>
              )}

              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Hauteur vers le toit (m)
                </label>
                <InfoButton
                  title={help.h_vers_toit?.title || "Hauteur vers le toit (m)"}
                  html={help.h_vers_toit?.body_html}
                >
                  <p>
                    Sert à estimer la longueur de câble globale :{" "}
                    <b>H × 2 × 1,2</b> (aller/retour + 20% de mou).
                  </p>
                </InfoButton>
              </div>
              <input
                type="number"
                step="0.1"
                className="w-full mb-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.H_vers_toit}
                onChange={(e) => updateField("H_vers_toit", +e.target.value)}
                placeholder="Ex: 10"
              />
              <p className="text-xs text-slate-500 mb-6">
                Longueur câble estimée:{" "}
                <b>{(formData.H_vers_toit || 0) * 2 * 1.2} m</b>
              </p>

              <button
                onClick={handleSubmit}
                disabled={isCalculating}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalculating ? (
                  <>
                    <Spinner className="w-5 h-5 text-white" />
                    Calcul en cours...
                  </>
                ) : (
                  <>
                    <Icons.Calculator className="w-5 h-5" /> Calculer
                  </>
                )}
              </button>
            </section>
          </div>
        </div>
      </div>

      {/* Erreurs */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl shadow-sm">
          <h4 className="flex items-center gap-2 text-red-800 mb-3 font-semibold">
            <Icons.AlertCircle className="w-5 h-5" /> Erreurs de validation
          </h4>
          <ul className="list-disc pl-5 text-red-700 space-y-1">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Résultats */}
      {result && (
        <>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                <Icons.Calculator className="text-blue-600" /> Résultats du
                Dimensionnement
              </h3>
              <button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Spinner className="w-4 h-4 text-white" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Icons.Download className="w-4 h-4" />
                    Télécharger PDF
                  </>
                )}
              </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg text-center">
                <Icons.PanelTop className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Puissance totale
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {formatPower(result.puissance_totale)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg text-center">
                <Icons.BatteryCharging className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Capacité batterie
                </p>
                {/* ✅ correction : capacité en Ah */}
                <p className="text-lg font-bold text-gray-800">
                  {formatCapacity(result.capacite_batterie)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg text-center">
                <Icons.ClipboardCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Bilan énergétique annuel
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {formatEnergyLocale(result.bilan_energetique_annuel)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg text-center">
                <Icons.DollarSign className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Coût total estimé
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {formatPrice(result.cout_total)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg text-center">
                <Icons.Sun className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Nombre de panneaux
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {formatNumber(result.nombre_panneaux)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg text-center">
                <Icons.BatteryCharging className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Nombre de batteries
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {formatNumber(result.nombre_batteries)}
                </p>
              </div>
            </div>

            {/* ✅ Topologies (cartes harmonisées) */}
            {(result?.topologie_pv ||
              result?.topologie_batterie ||
              result?.nb_pv_serie != null ||
              result?.nb_pv_parallele != null ||
              result?.nb_batt_serie != null ||
              result?.nb_batt_parallele != null) && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Topologie PV */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icons.Sun className="w-6 h-6 text-blue-600" />
                      <h4 className="text-base font-semibold text-gray-800">
                        Topologie PV
                      </h4>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="opacity-80">Configuration</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                        {result.topologie_pv ??
                          `${result.nb_pv_serie ?? "—"}S${
                            result.nb_pv_parallele ?? "—"
                          }P`}
                      </span>
                    </div>

                    {result.nb_pv_serie != null &&
                      result.nb_pv_parallele != null && (
                        <div className="flex items-center justify-between mt-2">
                          <span className="opacity-80">Série × Parallèle</span>
                          <span className="font-semibold">
                            {result.nb_pv_serie} × {result.nb_pv_parallele}
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                {/* Topologie Batteries */}
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icons.BatteryCharging className="w-6 h-6 text-emerald-600" />
                      <h4 className="text-base font-semibold text-gray-800">
                        Topologie Batteries
                      </h4>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="opacity-80">Configuration</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                        {result.topologie_batterie ??
                          `${result.nb_batt_serie ?? "—"}S${
                            result.nb_batt_parallele ?? "—"
                          }P`}
                      </span>
                    </div>

                    {result.nb_batt_serie != null &&
                      result.nb_batt_parallele != null && (
                        <div className="flex items-center justify-between mt-2">
                          <span className="opacity-80">Série × Parallèle</span>
                          <span className="font-semibold">
                            {result.nb_batt_serie} × {result.nb_batt_parallele}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Équipements recommandés */}
          {R?.equipements_recommandes && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="flex items-center gap-2 text-xl font-semibold mb-6 text-gray-800">
                <Icons.Zap className="text-indigo-600" /> Équipements
                recommandés
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <EquipCard
                  title="Panneau solaire"
                  icon={Icons.Sun}
                  c={R.equipements_recommandes.panneau}
                  extra={
                    <li className="flex justify-between border-t pt-2 mt-2">
                      <span>Quantité :</span>
                      <strong className="text-blue-600">
                        {formatNumber(result?.nombre_panneaux)}
                      </strong>
                    </li>
                  }
                />

                <EquipCard
                  title="Batterie"
                  icon={Icons.BatteryCharging}
                  c={R.equipements_recommandes.batterie}
                  extra={
                    <li className="flex justify-between border-t pt-2 mt-2">
                      <span>Quantité :</span>
                      <strong className="text-green-600">
                        {formatNumber(result?.nombre_batteries)}
                      </strong>
                    </li>
                  }
                />

                <EquipCard
                  title="Régulateur"
                  icon={Icons.Settings}
                  c={R.equipements_recommandes.regulateur}
                  extra={
                    <li className="flex justify-between border-t pt-2 mt-2">
                      <span>Quantité :</span>
                      <strong className="text-purple-600">1</strong>
                    </li>
                  }
                />

                <EquipCard
                  title="Onduleur"
                  icon={Icons.Zap}
                  c={R.equipements_recommandes.onduleur}
                  extra={
                    <li className="flex justify-between border-t pt-2 mt-2">
                      <span>Quantité :</span>
                      <strong className="text-orange-600">1</strong>
                    </li>
                  }
                />

                <EquipCard
                  title="Câble"
                  icon={Icons.Cable}
                  c={R.equipements_recommandes.cable}
                  extra={
                    <>
                      {/* ✅ longueur globale */}
                      {typeof R.longueur_cable_global_m === "number" && (
                        <li className="flex justify-between">
                          <span>Longueur globale :</span>
                          <strong>
                            {formatNumber(R.longueur_cable_global_m)} m
                          </strong>
                        </li>
                      )}
                      {/* ✅ prix total câble */}
                      {typeof R.prix_cable_global === "number" && (
                        <li className="flex justify-between">
                          <span>Prix total câble :</span>
                          <strong className="text-gray-900">
                            {formatPrice(R.prix_cable_global)}
                          </strong>
                        </li>
                      )}
                    </>
                  }
                />
              </div>
            </div>
          )}

          {/* Bouton de téléchargement final */}
          <div className="flex justify-center">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {isGenerating ? (
                <>
                  <Spinner className="w-5 h-5 text-white" />
                  Génération du rapport PDF...
                </>
              ) : (
                <>
                  <Icons.Download className="w-5 h-5" />
                  Télécharger le rapport complet PDF
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
