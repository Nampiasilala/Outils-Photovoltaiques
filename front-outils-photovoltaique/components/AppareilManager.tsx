"use client";

import { useState} from "react";
import {
  Plus,
  Trash2,
  Save,
  Edit,
  Search,
  Filter,
  Zap,
} from "lucide-react";
import { toast } from "react-toastify";

interface Appareil {
  id: number;
  name: string;
  power: number; // Puissance en W
  voltage: number; // Tension en V
  fournisseur: string;
  category: string;
  hours: number; // Heures d'utilisation par jour
}

const categories = [
  "Éclairage",
  "Électroménager",
  "Informatique",
  "Climatisation",
  "Sécurité",
  "Autres",
];

export default function AppareilManager() {
  const [appareils, setAppareils] = useState<Appareil[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Tous");

  const addAppareil = () => {
    const newAppareil: Appareil = {
      id: Date.now(),
      name: "",
      power: 0,
      voltage: 12,
      fournisseur: "",
      category: "Autres",
      hours: 0,
    };
    setAppareils((prev) => [...prev, newAppareil]);
    setEditingId(newAppareil.id);
  };

  const updateAppareil = (
    id: number,
    field: keyof Appareil,
    value: string | number
  ) => {
    setAppareils((prev) =>
      prev.map((equip) =>
        equip.id === id ? { ...equip, [field]: value } : equip
      )
    );
  };

  const deleteAppareil = (id: number) => {
    setAppareils((prev) => prev.filter((equip) => equip.id !== id));
    toast.info("Appareil supprimé avec succès");
  };

  const handleSave = () => {
    setEditingId(null);
    toast.success("Appareil enregistré avec succès !");
  };

  // Filtrage des appareils
  const filteredAppareils = appareils.filter((equip) => {
    const matchesSearch = equip.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "Tous" || equip.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-sm">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestion des Appareils
                </h1>
                <p className="text-gray-600">
                  Peut être utile cas où les entrées seront directement les appareils utilisés
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un appareil..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="Tous">Toutes catégories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={addAppareil}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un appareil</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-700 bg-gray-50 border-b-2 border-gray-200">
                  <th className="py-3 px-4 font-semibold">Nom</th>
                  <th className="py-3 px-4 font-semibold">Catégorie</th>
                  <th className="py-3 px-4 font-semibold">Puissance</th>
                  <th className="py-3 px-4 font-semibold">Tension</th>
                  <th className="py-3 px-4 font-semibold">Heures/jour</th>
                  <th className="py-3 px-4 font-semibold">Fournisseur</th>
                  <th className="py-3 px-4 font-semibold">Consommation</th>
                  <th className="py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppareils.map((equip, index) => (
                  <tr
                    key={equip.id}
                    className={`border-b hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <input
                          type="text"
                          value={equip.name}
                          onChange={(e) =>
                            updateAppareil(equip.id, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nom de l'appareil"
                        />
                      ) : (
                        <span className="font-medium">
                          {equip.name || "Non défini"}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <select
                          value={equip.category}
                          onChange={(e) =>
                            updateAppareil(
                              equip.id,
                              "category",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {equip.category}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <input
                          type="number"
                          value={equip.power}
                          onChange={(e) =>
                            updateAppareil(
                              equip.id,
                              "power",
                              Number(e.target.value)
                            )
                          }
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="100"
                        />
                      ) : (
                        <span className="font-medium">{equip.power} W</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <input
                          type="number"
                          value={equip.voltage}
                          onChange={(e) =>
                            updateAppareil(
                              equip.id,
                              "voltage",
                              Number(e.target.value)
                            )
                          }
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="12"
                        />
                      ) : (
                        <span>{equip.voltage} V</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <input
                          type="number"
                          value={equip.hours}
                          onChange={(e) =>
                            updateAppareil(
                              equip.id,
                              "hours",
                              Number(e.target.value)
                            )
                          }
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="8"
                          max="24"
                        />
                      ) : (
                        <span>{equip.hours} h</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <input
                          type="number"
                          value={equip.fournisseur}
                          onChange={(e) =>
                            updateAppareil(
                              equip.id,
                              "fournisseur",
                              String(e.target.value)
                            )
                          }
                          className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="200000"
                        />
                      ) : (
                        <span className="font-medium text-green-600">
                          {equip.fournisseur.toLocaleString()} Ar
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-purple-600">
                        {((equip.power * equip.hours) / 1000).toFixed(2)} kWh
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <button
                          onClick={handleSave}
                          className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center space-x-1"
                        >
                          <Save className="w-4 h-4" />
                          <span>Sauver</span>
                        </button>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingId(equip.id)}
                            className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteAppareil(equip.id)}
                            className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center space-x-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredAppareils.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterCategory !== "Tous"
                  ? "Aucun appareil trouvé"
                  : "Aucun appareil"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterCategory !== "Tous"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par ajouter votre premier appareil"}
              </p>
              {!searchTerm && filterCategory === "Tous" && (
                <button
                  onClick={addAppareil}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un appareil</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
