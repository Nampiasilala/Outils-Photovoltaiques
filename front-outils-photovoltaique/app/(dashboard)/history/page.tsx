"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { toast } from "react-toastify";
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
  Trash2, // <-- NOUVEAU : Icône de suppression
} from "lucide-react";

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
    panneau: {
      id: number;
      modele: string;
      puissance?: number | null;
      prix_unitaire: number;
      tension?: number | null;
    } | null;
    batterie: {
      id: number;
      modele: string;
      capacite?: number | null;
      prix_unitaire: number;
      tension?: number | null;
    } | null;
    regulateur: {
      id: number;
      modele: string;
      tension?: number | null;
      prix_unitaire: number;
    } | null;
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
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<ResultData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchHistory = async () => {
    if (user) {
      try {
        setLoadingHistory(true);
        setError(null);
        const res = await fetchWithAuth(
          "/dimensionnements/",
          {
            method: "GET",
          },
          true
        );

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Erreur ${res.status}: ${errText}`);
        }

        const data: ResultData[] = await res.json();
        setHistory(data);
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
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchHistory();
    }
  }, [user, authLoading]);

  // NOUVEAU : Fonction pour gérer la suppression
  const handleDelete = async (id: number) => {
    if (
      !confirm("Êtes-vous sûr de vouloir supprimer ce calcul de l'historique ?")
    ) {
      return; // L'utilisateur a annulé
    }

    try {
      // Appel à l'API DELETE pour l'élément spécifique
      const res = await fetchWithAuth(
        `/dimensionnements/${id}/`,
        {
          method: "DELETE",
        },
        true
      ); // Requiert l'authentification

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Erreur ${res.status}: ${errText}`);
      }

      // Si la suppression est réussie, mettez à jour l'état du frontend
      setHistory((prevHistory) => prevHistory.filter((calc) => calc.id !== id));
      toast.success("Calcul supprimé avec succès !");
    } catch (err: any) {
      console.error("Échec de la suppression :", err);
      toast.error(err.message || "Erreur lors de la suppression du calcul.");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
        <p className="ml-2 text-gray-700">
          Chargement de l'authentification...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <main className="pt-10 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <HistoryIcon className="w-7 h-7 text-blue-600" /> Historique des
              calculs
            </h2>

            {loadingHistory ? (
              <div className="flex items-center justify-center py-10 text-gray-500">
                <Loader2 className="animate-spin mr-2" /> Chargement de
                l'historique...
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 p-4 rounded text-red-800 flex items-center gap-2">
                <AlertCircle /> {error}
              </div>
            ) : history.length === 0 ? (
              <div className="text-gray-600 py-10 text-center">
                <Info className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p>Aucun calcul enregistré pour le moment.</p>
                <p>Effectuez un calcul pour voir l’historique ici.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {history.map((calc) => (
                  <div
                    key={calc.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-lg text-gray-700">
                        Calcul du{" "}
                        {new Date(calc.date_calcul).toLocaleDateString()}
                      </h3>
                      <button
                        onClick={() => handleDelete(calc.id)}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        title="Supprimer ce calcul"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* ✅ Affichage des données d'entrée */}
                    {calc.entree_details && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Données d'entrée :
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <li>
                            <strong>Consommation journalière (E_jour):</strong>{" "}
                            {calc.entree_details.e_jour} Wh
                          </li>
                          <li>
                            <strong>Puissance max (P_max):</strong>{" "}
                            {calc.entree_details.p_max} W
                          </li>
                          <li>
                            <strong>Jours d'autonomie:</strong>{" "}
                            {calc.entree_details.n_autonomie}
                          </li>
                          <li>
                            <strong>Tension batterie:</strong>{" "}
                            {calc.entree_details.v_batterie} V
                          </li>
                          <li>
                            <strong>Localisation:</strong>{" "}
                            {calc.entree_details.localisation}
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Résumé du dimensionnement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <PanelTop className="text-blue-500 w-4 h-4" />{" "}
                        <strong>Puissance totale (Onduleur):</strong>{" "}
                        {calc.puissance_totale} W
                      </div>
                      <div className="flex items-center gap-2">
                        <BatteryCharging className="text-green-500 w-4 h-4" />{" "}
                        <strong>Capacité batterie totale:</strong>{" "}
                        {calc.capacite_batterie} Wh
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="text-orange-500 w-4 h-4" />{" "}
                        <strong>Nombre de panneaux:</strong>{" "}
                        {calc.nombre_panneaux}
                      </div>
                      <div className="flex items-center gap-2">
                        <BatteryCharging className="text-green-500 w-4 h-4" />{" "}
                        <strong>Nombre de batteries:</strong>{" "}
                        {calc.nombre_batteries}
                      </div>
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="text-purple-500 w-4 h-4" />{" "}
                        <strong>Bilan énergétique annuel:</strong>{" "}
                        {calc.bilan_energetique_annuel} Wh
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="text-yellow-600 w-4 h-4" />{" "}
                        <strong>Coût total estimé:</strong> {calc.cout_total} €
                      </div>
                    </div>

                    {/* Équipements recommandés */}
                    {calc.equipements_recommandes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Détail des Équipements Recommandés:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {calc.equipements_recommandes.panneau && (
                            <div className="bg-white p-3 rounded border">
                              <p className="font-semibold text-blue-600">
                                Panneau:
                              </p>
                              <p>
                                Modèle:{" "}
                                {calc.equipements_recommandes.panneau.modele}
                              </p>
                              <p>
                                Puissance:{" "}
                                {calc.equipements_recommandes.panneau.puissance}{" "}
                                W
                              </p>
                              <p>
                                Tension:{" "}
                                {calc.equipements_recommandes.panneau.tension} V
                              </p>
                              <p>
                                Prix:{" "}
                                {
                                  calc.equipements_recommandes.panneau
                                    .prix_unitaire
                                }{" "}
                                €
                              </p>
                            </div>
                          )}
                          {calc.equipements_recommandes.batterie && (
                            <div className="bg-white p-3 rounded border">
                              <p className="font-semibold text-green-600">
                                Batterie:
                              </p>
                              <p>
                                Modèle:{" "}
                                {calc.equipements_recommandes.batterie.modele}
                              </p>
                              <p>
                                Capacité:{" "}
                                {calc.equipements_recommandes.batterie.capacite}{" "}
                                Ah
                              </p>
                              <p>
                                Tension:{" "}
                                {calc.equipements_recommandes.batterie.tension}{" "}
                                V
                              </p>
                              <p>
                                Prix:{" "}
                                {
                                  calc.equipements_recommandes.batterie
                                    .prix_unitaire
                                }{" "}
                                €
                              </p>
                            </div>
                          )}
                          {calc.equipements_recommandes.regulateur && (
                            <div className="bg-white p-3 rounded border">
                              <p className="font-semibold text-purple-600">
                                Régulateur:
                              </p>
                              <p>
                                Modèle:{" "}
                                {calc.equipements_recommandes.regulateur.modele}
                              </p>
                              <p>
                                Tension:{" "}
                                {
                                  calc.equipements_recommandes.regulateur
                                    .tension
                                }{" "}
                                V
                              </p>
                              <p>
                                Prix:{" "}
                                {
                                  calc.equipements_recommandes.regulateur
                                    .prix_unitaire
                                }{" "}
                                €
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => router.push("/calculate")}
              className="mt-6 inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700 transition-colors shadow-md"
            >
              <Calculator className="mr-2 h-5 w-5" /> Nouveau calcul
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
