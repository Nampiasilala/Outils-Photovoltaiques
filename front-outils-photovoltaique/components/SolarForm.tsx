"use client";

import { useState } from "react";
import { Sun, Battery, Zap, Calendar, Globe, AlertCircle, Calculator, Settings } from "lucide-react";

export default function SolarFormExpert() {
  const [formData, setFormData] = useState({
    E_jour: 0, // Consommation journalière (Wh)
    P_max: 0, // Puissance maximale simultanée (W)
    N_autonomie: 1, // Jours d'autonomie souhaités
    H_solaire: 4.5, // Irradiation solaire moyenne (kWh/m²/jour)
    V_batterie: 24, // Tension du parc batterie (V)
  });

  const [errors, setErrors] = useState<string[]>([]);

  const updateField = (field: keyof typeof formData, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (formData.E_jour <= 0)
      newErrors.push("La consommation journalière doit être supérieure à 0.");
    if (formData.P_max <= 0)
      newErrors.push("La puissance maximale doit être supérieure à 0.");
    if (formData.N_autonomie <= 0)
      newErrors.push("Les jours d'autonomie doivent être supérieurs à 0.");
    if (formData.H_solaire <= 0)
      newErrors.push("L'irradiation solaire doit être supérieure à 0.");
    if (![12, 24, 48].includes(formData.V_batterie))
      newErrors.push("La tension du parc batterie doit être 12V, 24V ou 48V.");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erreur lors du calcul.");
      const result = await response.json();
      console.log("Résultat du calcul :", result);
      // TODO : Afficher les résultats ici
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : "Une erreur est survenue.",
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header Dashboard */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Calculateur Solaire</h1>
        </div>
        <p className="text-gray-600 text-sm">Dimensionnement de votre installation photovoltaïque</p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Section Consommation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Consommation</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Consommation journalière
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.E_jour || ''}
                    onChange={(e) => updateField("E_jour", Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="3000"
                    min="1"
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-500">Wh</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Puissance maximale
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.P_max || ''}
                    onChange={(e) => updateField("P_max", Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1000"
                    min="1"
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-500">W</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Système */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Configuration</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Jours d'autonomie
                </label>
                <input
                  type="number"
                  value={formData.N_autonomie || ''}
                  onChange={(e) => updateField("N_autonomie", Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tension batterie
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[12, 24, 48].map((voltage) => (
                    <button
                      key={voltage}
                      type="button"
                      onClick={() => updateField("V_batterie", voltage)}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        formData.V_batterie === voltage
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {voltage}V
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section Environnement */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Environnement</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Irradiation solaire
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.H_solaire || ''}
                    onChange={(e) => updateField("H_solaire", Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="4.5"
                    min="0.1"
                    step="0.1"
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-500">kWh/m²</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Moyenne par jour</p>
              </div>

              <div className="pt-2">
                <button 
                  type="button" 
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Calculer</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gestion des erreurs */}
        {errors.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <h4 className="text-red-800 font-medium text-sm">Erreurs de validation</h4>
            </div>
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-red-700 text-xs flex items-start">
                  <span className="w-1 h-1 bg-red-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stats rapides */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{formData.E_jour}</div>
            <div className="text-xs text-gray-500">Wh/jour</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{formData.P_max}</div>
            <div className="text-xs text-gray-500">W max</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{formData.N_autonomie}</div>
            <div className="text-xs text-gray-500">jour(s)</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">{formData.H_solaire}</div>
            <div className="text-xs text-gray-500">kWh/m²</div>
          </div>
        </div>
      </div>
    </div>
  );
}