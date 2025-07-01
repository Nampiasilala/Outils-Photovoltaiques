"use client";

import { useState } from "react";
import { Settings, Save, Edit, CheckCircle, XCircle, Info } from "lucide-react";

export default function SystemParameters() {
  const [parameters, setParameters] = useState({
    n_global: 0.75,
    K_securite: 1.3,
    DoD: 0.5,
    K_dimensionnement: 1.25,
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Descriptions des paramètres pour l'aide
  const parameterInfo = {
    n_global: {
      name: "Rendement Global",
      description: "Rendement global du système (0.7-0.8 typique)",
      unit: "",
      range: "0.6 - 0.9"
    },
    K_securite: {
      name: "Coefficient de Sécurité", 
      description: "Marge de sécurité pour les calculs (1.2-1.4 recommandé)",
      unit: "",
      range: "1.1 - 1.5"
    },
    DoD: {
      name: "Profondeur de Décharge",
      description: "Profondeur de décharge maximale des batteries",
      unit: "%",
      range: "0.3 - 0.8"
    },
    K_dimensionnement: {
      name: "Coeff. Dimensionnement",
      description: "Coefficient de dimensionnement des panneaux",
      unit: "",
      range: "1.2 - 1.4"
    }
  };

  const handleChange = (key: keyof typeof parameters, value: number) => {
    setParameters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleEdit = (key: string) => {
    setEditing(key);
    setSaved(false);
  };

  const handleSave = () => {
    // Logique d'enregistrement ici si besoin (API)
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setEditing(null);
  };

  const formatValue = (key: string, value: number) => {
    const info = parameterInfo[key as keyof typeof parameterInfo];
    if (key === 'DoD') {
      return `${(value * 100).toFixed(0)}%`;
    }
    return value.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header Dashboard */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Paramètres Système</h1>
            </div>
            <p className="text-gray-600 text-sm">Configuration des paramètres globaux du système photovoltaïque</p>
          </div>
          
          {/* Notification de sauvegarde */}
          {saved && (
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Paramètres sauvegardés</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(parameters).map(([key, value]) => {
            const info = parameterInfo[key as keyof typeof parameterInfo];
            const isEditing = editing === key;
            
            return (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{info.name}</h3>
                      <div className="group relative">
                        <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                        <div className="absolute left-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <p className="mb-1">{info.description}</p>
                          <p className="text-gray-300">Plage: {info.range}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                    <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      Plage recommandée: {info.range}
                    </div>
                  </div>
                </div>

                {/* Valeur et contrôles */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => handleChange(key as keyof typeof parameters, Number(e.target.value))}
                          className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          step="0.01"
                          min="0"
                          max="2"
                        />
                        {info.unit && <span className="text-sm text-gray-500">{info.unit}</span>}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-teal-600">
                        {formatValue(key, value)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Sauver</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Annuler</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(key)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Modifier</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Résumé des paramètres */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6 ">
          <h3 className="font-semibold text-gray-900 mb-4">Résumé des Paramètres</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
            {Object.entries(parameters).map(([key, value]) => {
              const info = parameterInfo[key as keyof typeof parameterInfo];
              return (
                <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-teal-600">
                    {formatValue(key, value)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {info.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes importantes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Notes importantes</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Les paramètres par défaut conviennent à la plupart des installations</li>
                <li>• Consultez un expert avant de modifier ces valeurs</li>
                <li>• Les modifications sont sauvegardées automatiquement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}