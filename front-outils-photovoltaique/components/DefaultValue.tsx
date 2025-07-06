"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Edit, CheckCircle, XCircle, Info, RefreshCw, AlertTriangle } from "lucide-react";
import { useAuth } from "./AuthContext"; // Ajustez le chemin selon votre structure

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

export default function SystemParameters() {
  const { user, logout } = useAuth(); // Ajout de logout pour déconnecter en cas de token invalide
  
  const [parameters, setParameters] = useState<Parameters>({
    n_global: 0.75,
    k_securite: 1.3,
    dod: 0.5,
    k_dimensionnement: 1.25,
    h_solaire: 5.5
  });

  const [currentId, setCurrentId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [editing, setEditing] = useState<ParameterKey | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Descriptions des paramètres pour l'aide
  const parameterInfo: Record<ParameterKey, ParameterInfo> = {
    n_global: {
      name: "Rendement Global",
      description: "Rendement global du système (0.7-0.8 typique)",
      unit: "",
      range: "0.6 - 0.9"
    },
    k_securite: {
      name: "Coefficient de Sécurité", 
      description: "Marge de sécurité pour les calculs (1.2-1.4 recommandé)",
      unit: "",
      range: "1.1 - 1.5"
    },
    dod: {
      name: "Profondeur de Décharge",
      description: "Profondeur de décharge maximale des batteries",
      unit: "%",
      range: "0.3 - 0.8"
    },
    k_dimensionnement: {
      name: "Coeff. Dimensionnement",
      description: "Coefficient de dimensionnement des panneaux",
      unit: "",
      range: "1.2 - 1.4"
    },
    h_solaire: {
      name: "Heures Solaires",
      description: "Nombre d'heures d'ensoleillement par jour",
      unit: "h",
      range: "4.0 - 8.0"
    }
  };

  // Fonction pour vérifier si le token est valide
  const isTokenValid = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Vérifier si le token a expiré
      if (payload.exp && payload.exp < currentTime) {
        console.log("Token expiré");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Token invalide:", error);
      return false;
    }
  };

  // Fonction pour décoder le token JWT et récupérer l'ID utilisateur
  const getUserIdFromToken = (): number | null => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Aucun token trouvé");
        return null;
      }
      
      if (!isTokenValid(token)) {
        console.log("Token invalide ou expiré");
        localStorage.removeItem("token");
        return null;
      }
      
      // Décoder le payload JWT (partie centrale du token)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || null;
    } catch (error) {
      console.error("Erreur lors du décodage du token:", error);
      return null;
    }
  };

  // Fonction pour gérer les erreurs d'authentification
  const handleAuthError = () => {
    console.log("Erreur d'authentification - déconnexion");
    localStorage.removeItem("token");
    if (logout) {
      logout();
    }
    setError("Session expirée. Veuillez vous reconnecter.");
  };

  // Fonction pour récupérer les paramètres depuis l'API
  const fetchParameters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      const userId = getUserIdFromToken();
      
      if (!token || !userId) {
        throw new Error("Token ou utilisateur non trouvé");
      }
      
      setCurrentUserId(userId);
      
      console.log("Fetching parameters with token:", token.substring(0, 20) + "...");
      
      const response = await fetch('http://localhost:8000/api/parametres/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status === 401) {
        console.log("Erreur 401 - Token invalide");
        handleAuthError();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Data received:", data);
      
      // Filtrer les paramètres pour l'utilisateur connecté
      const userParams = data.filter((param: any) => param.user === userId);
      
      if (userParams && userParams.length > 0) {
        const param = userParams[0]; // Prendre le premier paramètre de l'utilisateur
        setParameters({
          n_global: param.n_global,
          k_securite: param.k_securite,
          dod: param.dod,
          k_dimensionnement: param.k_dimensionnement,
          h_solaire: param.h_solaire
        });
        setCurrentId(param.id);
        console.log("Parameters loaded successfully");
      } else {
        // Aucun paramètre trouvé pour cet utilisateur, utiliser les valeurs par défaut
        console.log("Aucun paramètre trouvé pour cet utilisateur, utilisation des valeurs par défaut");
        setCurrentId(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors de la récupération des paramètres:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour sauvegarder les paramètres
  const saveParameters = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const userId = currentUserId || getUserIdFromToken();
      
      if (!token || !userId) {
        throw new Error("Token ou utilisateur non trouvé");
      }

      const method = currentId ? 'PUT' : 'POST';
      const url = currentId 
        ? `http://localhost:8000/api/parametres/${currentId}/`
        : 'http://localhost:8000/api/parametres/';

      console.log(`Saving parameters with ${method} to ${url}`);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...parameters,
          user: userId
        })
      });

      if (response.status === 401) {
        console.log("Erreur 401 lors de la sauvegarde");
        handleAuthError();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setCurrentId(data.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      console.log("Parameters saved successfully");
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors de la sauvegarde:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    if (user) {
      fetchParameters();
    }
  }, [user]);

  const handleChange = (key: ParameterKey, value: number) => {
    setParameters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleEdit = (key: ParameterKey) => {
    setEditing(key);
    setSaved(false);
  };

  const handleSave = async () => {
    await saveParameters();
    setEditing(null);
  };

  const handleCancel = () => {
    setEditing(null);
    // Recharger les paramètres originaux
    fetchParameters();
  };

  const formatValue = (key: ParameterKey, value: number) => {
    const info = parameterInfo[key];
    if (key === 'dod') {
      return `${(value * 100).toFixed(0)}%`;
    }
    if (key === 'h_solaire') {
      return `${value.toFixed(1)}h`;
    }
    return value.toString();
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  if (loading && !parameters.n_global) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Chargement des paramètres...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Vous devez être connecté pour accéder à cette page</div>
          <button 
            onClick={handleLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

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
              <div className="text-sm text-gray-500">
                ({user.email})
              </div>
              <button
                onClick={fetchParameters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-lg text-sm flex items-center space-x-1 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
            </div>
            <p className="text-gray-600 text-sm">Configuration des paramètres globaux du système photovoltaïque</p>
          </div>
          
          {/* Notifications */}
          {saved && (
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Paramètres sauvegardés</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-2 rounded-lg max-w-md">
              {error.includes("Session expirée") ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {error}
                {error.includes("Session expirée") && (
                  <button
                    onClick={handleLogin}
                    className="ml-2 underline hover:no-underline"
                  >
                    Se reconnecter
                  </button>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(Object.entries(parameters) as [ParameterKey, number][]).map(([key, value]) => {
            const info = parameterInfo[key];
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
                          onChange={(e) => handleChange(key, Number(e.target.value))}
                          className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          step="0.01"
                          min="0"
                          max="10"
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
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors"
                        >
                          {loading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          <span>Sauver</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={loading}
                          className="bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors"
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
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Résumé des Paramètres</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(Object.entries(parameters) as [ParameterKey, number][]).map(([key, value]) => {
              const info = parameterInfo[key];
              return (
                <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">
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
                <li>• Les paramètres sont chargés depuis l'API pour votre compte</li>
                <li>• Les modifications sont sauvegardées automatiquement</li>
                <li>• Consultez un expert avant de modifier ces valeurs</li>
                <li>• Utilisez le bouton "Actualiser" pour recharger les données</li>
                <li>• En cas d'erreur 401, vérifiez que vous êtes bien connecté</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Debug info - à supprimer en production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Debug Info</h4>
            <div className="text-sm text-yellow-800">
              <p>Current ID: {currentId}</p>
              <p>User ID: {currentUserId}</p>
              <p>Token exists: {!!localStorage.getItem("token")}</p>
              <p>Token valid: {localStorage.getItem("token") ? isTokenValid(localStorage.getItem("token")!) : false}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}