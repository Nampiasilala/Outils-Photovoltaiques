"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { dimensionnementAPI } from "@/lib/api"; // ✅ Import de l'utilitaire API
import { toast } from "react-toastify";
// ✅ Import des formatters centralisés
import { 
  formatPrice, 
  formatEnergyLocale, 
  formatNumber, 
  formatPower,
  formatters 
} from '@/utils/formatters';
import {
  History as HistoryIcon,
  Calculator,
  Loader2,
  Info,
  Sun,
  Zap,
  BatteryCharging,
  DollarSign,
  ClipboardCheck,
  PanelTop,
  AlertCircle,
  Trash2,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronRight,
  Settings,
  Eye,
  EyeOff,
  Cable,
} from "lucide-react";
import DeleteAlert from "@/components/DeleteAlert";

// ✅ Interface corrigée selon le backend
interface EquipmentDetail {
  id: number;
  reference: string;
  modele: string;
  marque: string;
  nom_commercial: string;
  puissance_W?: number | null;        // ✅ Corrigé
  capacite_Ah?: number | null;        // ✅ Corrigé
  tension_nominale_V?: number | null; // ✅ Corrigé
  prix_unitaire: number;
  devise: string;
  categorie: string;
}

// ✅ Interface ResultData corrigée
interface ResultData {
  id: number;
  date_calcul: string;
  puissance_totale: number;
  capacite_batterie: number;
  nombre_panneaux: number;
  nombre_batteries: number;
  bilan_energetique_annuel: number;
  cout_total: number;
  entree: number;
  parametre: number;
  equipements_recommandes: {
    panneau: EquipmentDetail | null;
    batterie: EquipmentDetail | null;
    regulateur: EquipmentDetail | null;
    onduleur: EquipmentDetail | null;
    cable: EquipmentDetail | null;
  };
  entree_details: {
    e_jour: number;
    p_max: number;
    n_autonomie: number;
    v_batterie: number;
    localisation: string;
  };
}

export default function History() {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const router = useRouter();
  const [history, setHistory] = useState<ResultData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [showInputs, setShowInputs] = useState<Set<number>>(new Set());
  const [showEquipments, setShowEquipments] = useState<Set<number>>(new Set());

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      setError(null);
      
      // ✅ Utilisation de l'utilitaire API
      const data: ResultData[] = await dimensionnementAPI.getAll();

      const parsed = data.map((item) => ({
        ...item,
        _timestamp: item.date_calcul
          ? new Date(item.date_calcul).getTime() || 0
          : 0,
      }));

      const sortedData = parsed.sort((a, b) => b._timestamp - a._timestamp);
      setHistory(sortedData);
    } catch (err: any) {
      console.error("Échec du chargement de l'historique :", err);
      setError(
        err.message || "Impossible de charger l'historique des calculs."
      );
      toast.error(
        err.message || "Erreur lors du chargement de l'historique."
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      // ✅ Utilisation de l'utilitaire API
      await dimensionnementAPI.delete(id);

      setHistory((prev) => prev.filter((calc) => calc.id !== id));
      toast.success("Calcul supprimé avec succès !");
    } catch (err: any) {
      console.error("Échec de la suppression :", err);
      toast.error(err.message || "Erreur lors de la suppression du calcul.");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpanded = (id: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleInputs = (id: number) => {
    setShowInputs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleEquipments = (id: number) => {
    setShowEquipments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set(history.map((calc) => calc.id));
    setExpandedItems(allIds);
    setShowInputs(allIds);
    setShowEquipments(allIds);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
    setShowInputs(new Set());
    setShowEquipments(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="pt-2 pb-2">
        <div className="mx-auto max-w-7xl px-2">
          <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 text-white">
              <div className="flex flex-col px-4 sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-base font-bold flex items-center gap-3">
                  <HistoryIcon className="w-6 h-6" />
                  Historique des calculs
                </h2>

                {history.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={expandAll}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 backdrop-blur-sm text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Tout développer
                    </button>
                    <button
                      onClick={collapseAll}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 backdrop-blur-sm text-sm"
                    >
                      <EyeOff className="w-4 h-4" />
                      Tout réduire
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-16 text-gray-500">
                  <div className="text-center">
                    <Loader2 className="animate-spin w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <p className="font-medium">Chargement de l'historique...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-red-800 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Erreur de chargement</h3>
                    <p>{error}</p>
                  </div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Info className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Aucun calcul enregistré
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Effectuez votre premier calcul pour commencer à voir
                    l'historique ici.
                  </p>
                  <button
                    onClick={() => router.push("/calculate")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
                  >
                    <Calculator className="w-5 h-5" />
                    Nouveau calcul
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((calc) => (
                    <div
                      key={calc.id}
                      className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {/* Header de l'accordéon */}
                      <div
                        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => toggleExpanded(calc.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                              {expandedItems.has(calc.id) ? (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                              )}
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                  Calcul du{" "}
                                  {new Date(
                                    calc.date_calcul
                                  ).toLocaleDateString("fr-FR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  {calc.entree_details.localisation} •{" "}
                                  {formatPrice(calc.cout_total)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Indicateurs rapides */}
                            <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Sun className="w-4 h-4 text-orange-500" />
                                <span>{calc.nombre_panneaux} panneaux</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BatteryCharging className="w-4 h-4 text-green-500" />
                                <span>{calc.nombre_batteries} batteries</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-yellow-600" />
                                <span>{formatPrice(calc.cout_total)}</span>
                              </div>
                            </div>

                            <div onClick={(e) => e.stopPropagation()}>
                              <DeleteAlert
                                label={`Supprimer le calcul du ${new Date(
                                  calc.date_calcul
                                ).toLocaleDateString("fr-FR")} ?`}
                                onConfirm={() => handleDelete(calc.id)}
                                isLoading={deletingId === calc.id}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contenu développable */}
                      {expandedItems.has(calc.id) && (
                        <div className="px-6 pb-6 border-t border-gray-100">
                          {/* Résultats principaux */}
                          <div className="mb-6 pt-4">
                            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                              <ClipboardCheck className="w-5 h-5 text-blue-500" />
                              Résultats du dimensionnement
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                                <PanelTop className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-600">
                                  Puissance totale
                                </p>
                                <p className="text-lg font-bold text-gray-800">
                                  {formatPower(calc.puissance_totale)}
                                </p>
                              </div>
                              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
                                <BatteryCharging className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-600">
                                  Capacité batterie
                                </p>
                                <p className="text-lg font-bold text-gray-800">
                                  {formatEnergyLocale(calc.capacite_batterie)}
                                </p>
                              </div>
                              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg text-center">
                                <Sun className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-600">
                                  Panneaux
                                </p>
                                <p className="text-lg font-bold text-gray-800">
                                  {formatNumber(calc.nombre_panneaux)}
                                </p>
                              </div>
                              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
                                <BatteryCharging className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-600">
                                  Batteries
                                </p>
                                <p className="text-lg font-bold text-gray-800">
                                  {formatNumber(calc.nombre_batteries)}
                                </p>
                              </div>
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
                                <ClipboardCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-600">
                                  Bilan annuel
                                </p>
                                <p className="text-lg font-bold text-gray-800">
                                  {formatEnergyLocale(calc.bilan_energetique_annuel)}
                                </p>
                              </div>
                              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg text-center">
                                <DollarSign className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-600">
                                  Coût total
                                </p>
                                <p className="text-lg font-bold text-gray-800">
                                  {formatPrice(calc.cout_total)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Accordéon pour les données d'entrée */}
                          {calc.entree_details && (
                            <div className="mb-6">
                              <button
                                onClick={() => toggleInputs(calc.id)}
                                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                              >
                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                  <Info className="w-5 h-5 text-blue-500" />
                                  Données d'entrée
                                </h4>
                                {showInputs.has(calc.id) ? (
                                  <ChevronDown className="w-5 h-5 text-gray-500" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-gray-500" />
                                )}
                              </button>

                              {showInputs.has(calc.id) && (
                                <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                      <div className="p-2 bg-yellow-100 rounded-full">
                                        <Zap className="w-5 h-5 text-yellow-600" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Énergie journalière
                                        </p>
                                        <p className="text-lg font-semibold text-gray-800">
                                          {formatEnergyLocale(calc.entree_details.e_jour)}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                      <div className="p-2 bg-red-100 rounded-full">
                                        <Zap className="w-5 h-5 text-red-600" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Puissance max
                                        </p>
                                        <p className="text-lg font-semibold text-gray-800">
                                          {formatPower(calc.entree_details.p_max)}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                      <div className="p-2 bg-purple-100 rounded-full">
                                        <Calendar className="w-5 h-5 text-purple-600" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Autonomie
                                        </p>
                                        <p className="text-lg font-semibold text-gray-800">
                                          {formatNumber(calc.entree_details.n_autonomie)} jours
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                      <div className="p-2 bg-green-100 rounded-full">
                                        <BatteryCharging className="w-5 h-5 text-green-600" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Tension batterie
                                        </p>
                                        <p className="text-lg font-semibold text-gray-800">
                                          {formatters.voltage(calc.entree_details.v_batterie)}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100 md:col-span-2 lg:col-span-1">
                                      <div className="p-2 bg-blue-100 rounded-full">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Localisation
                                        </p>
                                        <p className="text-lg font-semibold text-gray-800">
                                          {calc.entree_details.localisation}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Accordéon pour les équipements */}
                          {calc.equipements_recommandes && (
                            <div>
                              <button
                                onClick={() => toggleEquipments(calc.id)}
                                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                              >
                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                  <Settings className="w-5 h-5 text-purple-500" />
                                  Équipements recommandés
                                </h4>
                                {showEquipments.has(calc.id) ? (
                                  <ChevronDown className="w-5 h-5 text-gray-500" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-gray-500" />
                                )}
                              </button>

                              {showEquipments.has(calc.id) && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {calc.equipements_recommandes.panneau && (
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                      <div className="flex items-center gap-2 mb-3">
                                        <Sun className="w-5 h-5 text-blue-600" />
                                        <p className="font-semibold text-blue-700">
                                          Panneau solaire
                                        </p>
                                      </div>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          <span className="font-medium">
                                            Modèle:
                                          </span>{" "}
                                          {calc.equipements_recommandes.panneau.modele}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Référence:
                                          </span>{" "}
                                          <span className="font-mono text-xs">
                                            {calc.equipements_recommandes.panneau.reference}
                                          </span>
                                        </p>
                                        {calc.equipements_recommandes.panneau.puissance_W && (
                                          <p>
                                            <span className="font-medium">
                                              Puissance:
                                            </span>{" "}
                                            {formatPower(calc.equipements_recommandes.panneau.puissance_W)}
                                          </p>
                                        )}
                                        {calc.equipements_recommandes.panneau.tension_nominale_V && (
                                          <p>
                                            <span className="font-medium">
                                              Tension:
                                            </span>{" "}
                                            {formatters.voltage(calc.equipements_recommandes.panneau.tension_nominale_V)}
                                          </p>
                                        )}
                                        <p>
                                          <span className="font-medium">
                                            Prix:
                                          </span>{" "}
                                          <span className="font-bold text-blue-700">
                                            {formatPrice(calc.equipements_recommandes.panneau.prix_unitaire)}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {calc.equipements_recommandes.batterie && (
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                      <div className="flex items-center gap-2 mb-3">
                                        <BatteryCharging className="w-5 h-5 text-green-600" />
                                        <p className="font-semibold text-green-700">
                                          Batterie
                                        </p>
                                      </div>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          <span className="font-medium">
                                            Modèle:
                                          </span>{" "}
                                          {calc.equipements_recommandes.batterie.modele}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Référence:
                                          </span>{" "}
                                          <span className="font-mono text-xs">
                                            {calc.equipements_recommandes.batterie.reference}
                                          </span>
                                        </p>
                                        {calc.equipements_recommandes.batterie.capacite_Ah && (
                                          <p>
                                            <span className="font-medium">
                                              Capacité:
                                            </span>{" "}
                                            {formatters.capacity(calc.equipements_recommandes.batterie.capacite_Ah)}
                                          </p>
                                        )}
                                        {calc.equipements_recommandes.batterie.tension_nominale_V && (
                                          <p>
                                            <span className="font-medium">
                                              Tension:
                                            </span>{" "}
                                            {formatters.voltage(calc.equipements_recommandes.batterie.tension_nominale_V)}
                                          </p>
                                        )}
                                        <p>
                                          <span className="font-medium">
                                            Prix:
                                          </span>{" "}
                                          <span className="font-bold text-green-700">
                                            {formatPrice(calc.equipements_recommandes.batterie.prix_unitaire)}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {calc.equipements_recommandes.regulateur && (
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                                      <div className="flex items-center gap-2 mb-3">
                                        <Settings className="w-5 h-5 text-purple-600" />
                                        <p className="font-semibold text-purple-700">
                                          Régulateur
                                        </p>
                                      </div>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          <span className="font-medium">
                                            Modèle:
                                          </span>{" "}
                                          {calc.equipements_recommandes.regulateur.modele}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Référence:
                                          </span>{" "}
                                          <span className="font-mono text-xs">
                                            {calc.equipements_recommandes.regulateur.reference}
                                          </span>
                                        </p>
                                        {calc.equipements_recommandes.regulateur.tension_nominale_V && (
                                          <p>
                                            <span className="font-medium">
                                              Tension:
                                            </span>{" "}
                                            {formatters.voltage(calc.equipements_recommandes.regulateur.tension_nominale_V)}
                                          </p>
                                        )}
                                        <p>
                                          <span className="font-medium">
                                            Prix:
                                          </span>{" "}
                                          <span className="font-bold text-purple-700">
                                            {formatPrice(calc.equipements_recommandes.regulateur.prix_unitaire)}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {calc.equipements_recommandes.onduleur && (
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                                      <div className="flex items-center gap-2 mb-3">
                                        <Zap className="w-5 h-5 text-orange-600" />
                                        <p className="font-semibold text-orange-700">
                                          Onduleur
                                        </p>
                                      </div>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          <span className="font-medium">
                                            Modèle:
                                          </span>{" "}
                                          {calc.equipements_recommandes.onduleur.modele}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Référence:
                                          </span>{" "}
                                          <span className="font-mono text-xs">
                                            {calc.equipements_recommandes.onduleur.reference}
                                          </span>
                                        </p>
                                        {calc.equipements_recommandes.onduleur.puissance_W && (
                                          <p>
                                            <span className="font-medium">
                                              Puissance:
                                            </span>{" "}
                                            {formatPower(calc.equipements_recommandes.onduleur.puissance_W)}
                                          </p>
                                        )}
                                        {calc.equipements_recommandes.onduleur.tension_nominale_V && (
                                          <p>
                                            <span className="font-medium">
                                              Tension:
                                            </span>{" "}
                                            {formatters.voltage(calc.equipements_recommandes.onduleur.tension_nominale_V)}
                                          </p>
                                        )}
                                        <p>
                                          <span className="font-medium">
                                            Prix:
                                          </span>{" "}
                                          <span className="font-bold text-orange-700">
                                            {formatPrice(calc.equipements_recommandes.onduleur.prix_unitaire)}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* ✅ Câble */}
                                  {calc.equipements_recommandes.cable && (
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                                      <div className="flex items-center gap-2 mb-3">
                                        <Cable className="w-5 h-5 text-gray-600" />
                                        <p className="font-semibold text-gray-700">
                                          Câble
                                        </p>
                                      </div>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          <span className="font-medium">
                                            Modèle:
                                          </span>{" "}
                                          {calc.equipements_recommandes.cable.modele}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Référence:
                                          </span>{" "}
                                          <span className="font-mono text-xs">
                                            {calc.equipements_recommandes.cable.reference}
                                          </span>
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Prix:
                                          </span>{" "}
                                          <span className="font-bold text-gray-700">
                                            {formatPrice(calc.equipements_recommandes.cable.prix_unitaire)} / m
                                          </span>
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Quantité:
                                          </span>{" "}
                                          <span className="text-gray-600">
                                            À calculer selon installation
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Bouton nouveau calcul */}
              {history.length > 0 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => router.push("/calculate")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl"
                  >
                    <Calculator className="w-6 h-6" />
                    Nouveau calcul
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}