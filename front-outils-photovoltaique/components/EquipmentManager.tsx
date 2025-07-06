"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  Edit,
  Search,
  Filter,
  Zap,
  AlertCircle,
  Loader,
} from "lucide-react";
// Note: toast notifications would need to be implemented with a supported library

interface Equipment {
  id: number;
  type_equipement: string;
  categorie: string;
  puissance: number;
  tension: number;
  capacite: number;
  prix_unitaire: number;
}

// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Service API
const equipmentService = {
  async getAll(): Promise<Equipment[]> {
    const response = await fetch(`${API_BASE_URL}/equipements/`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des équipements');
    return response.json();
  },

  async create(equipment: Omit<Equipment, 'id'>): Promise<Equipment> {
    const response = await fetch(`${API_BASE_URL}/equipements/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(equipment),
    });
    if (!response.ok) throw new Error('Erreur lors de la création de l\'équipement');
    return response.json();
  },

  async update(id: number, equipment: Partial<Equipment>): Promise<Equipment> {
    const response = await fetch(`${API_BASE_URL}/equipements/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(equipment),
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'équipement');
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/equipements/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression de l\'équipement');
  },
};

const categories = [
  "Éclairage",
  "Électroménager",
  "Informatique",
  "Climatisation",
  "Sécurité",
  "Autres",
];

export default function EquipmentManager() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Charger les équipements au démarrage
  useEffect(() => {
    loadEquipments();
  }, []);

  const loadEquipments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentService.getAll();
      setEquipments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      // toast.error('Erreur lors du chargement des équipements');
      console.error('Erreur lors du chargement des équipements:', err);
    } finally {
      setLoading(false);
    }
  };

  const addEquipment = async () => {
    try {
      setSaving(true);
      const newEquipment = {
        type_equipement: "Nouvel équipement",
        categorie: "Autres",
        puissance: 0,
        tension: 12,
        capacite: 0,
        prix_unitaire: 0,
      };
      
      const createdEquipment = await equipmentService.create(newEquipment);
      setEquipments((prev) => [...prev, createdEquipment]);
      setEditingId(createdEquipment.id);
      // toast.success('Équipement créé avec succès !');
      console.log('Équipement créé avec succès !');
    } catch (err) {
      // toast.error('Erreur lors de la création de l\'équipement');
      console.error('Erreur lors de la création de l\'équipement:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateEquipment = (
    id: number,
    field: keyof Equipment,
    value: string | number
  ) => {
    setEquipments((prev) =>
      prev.map((equip) =>
        equip.id === id ? { ...equip, [field]: value } : equip
      )
    );
  };

  const saveEquipment = async (equipment: Equipment) => {
    try {
      setSaving(true);
      const updatedEquipment = await equipmentService.update(equipment.id, equipment);
      setEquipments((prev) =>
        prev.map((equip) =>
          equip.id === equipment.id ? updatedEquipment : equip
        )
      );
      setEditingId(null);
      // toast.success('Équipement sauvegardé avec succès !');
      console.log('Équipement sauvegardé avec succès !');
    } catch (err) {
      // toast.error('Erreur lors de la sauvegarde');
      console.error('Erreur lors de la sauvegarde:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteEquipment = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      return;
    }

    try {
      await equipmentService.delete(id);
      setEquipments((prev) => prev.filter((equip) => equip.id !== id));
      // toast.success('Équipement supprimé avec succès');
      console.log('Équipement supprimé avec succès');
    } catch (err) {
      // toast.error('Erreur lors de la suppression');
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const handleSave = () => {
    const equipment = equipments.find((equip) => equip.id === editingId);
    if (equipment) {
      saveEquipment(equipment);
    }
  };

  // Filtrage des équipements
  const filteredEquipments = equipments.filter((equip) => {
    const matchesSearch = equip.type_equipement
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "Tous" || equip.categorie === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des équipements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de connexion</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadEquipments}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

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
                  Gestion des Équipements
                </h1>
                <p className="text-gray-600">
                  Equipements prédéfinis qui seront suggérés à l'utilisateur. Ils seront utiles pour le dimensionnement et le coût. 
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
                  placeholder="Rechercher un équipement..."
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
              onClick={addEquipment}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Ajouter un équipement</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-700 bg-gray-50 border-b-2 border-gray-200">
                  <th className="py-3 px-4 font-semibold">Type d'équipement</th>
                  <th className="py-3 px-4 font-semibold">Catégorie</th>
                  <th className="py-3 px-4 font-semibold">Puissance (W)</th>
                  <th className="py-3 px-4 font-semibold">Tension (V)</th>
                  <th className="py-3 px-4 font-semibold">Capacité</th>
                  <th className="py-3 px-4 font-semibold">Prix unitaire (Ar)</th>
                  <th className="py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipments.map((equip, index) => (
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
                          value={equip.type_equipement}
                          onChange={(e) =>
                            updateEquipment(equip.id, "type_equipement", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Type d'équipement"
                        />
                      ) : (
                        <span className="font-medium">
                          {equip.type_equipement || "Non défini"}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <select
                          value={equip.categorie}
                          onChange={(e) =>
                            updateEquipment(equip.id, "categorie", e.target.value)
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
                          {equip.categorie}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <input
                          type="number"
                          value={equip.puissance}
                          onChange={(e) =>
                            updateEquipment(equip.id, "puissance", Number(e.target.value))
                          }
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="100"
                        />
                      ) : (
                        <span className="font-medium">{equip.puissance}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <input
                          type="number"
                          value={equip.tension}
                          onChange={(e) =>
                            updateEquipment(equip.id, "tension", Number(e.target.value))
                          }
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="12"
                        />
                      ) : (
                        <span>{equip.tension}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <input
                          type="number"
                          value={equip.capacite}
                          onChange={(e) =>
                            updateEquipment(equip.id, "capacite", Number(e.target.value))
                          }
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="1000"
                        />
                      ) : (
                        <span>{equip.capacite}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <input
                          type="number"
                          value={equip.prix_unitaire}
                          onChange={(e) =>
                            updateEquipment(equip.id, "prix_unitaire", Number(e.target.value))
                          }
                          className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="200000"
                        />
                      ) : (
                        <span className="font-medium text-green-600">
                          {equip.prix_unitaire.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center space-x-1 disabled:opacity-50"
                        >
                          {saving ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
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
                            onClick={() => deleteEquipment(equip.id)}
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
          {filteredEquipments.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterCategory !== "Tous"
                  ? "Aucun équipement trouvé"
                  : "Aucun équipement"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterCategory !== "Tous"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par ajouter votre premier équipement"}
              </p>
              {!searchTerm && filterCategory === "Tous" && (
                <button
                  onClick={addEquipment}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-colors flex items-center space-x-2 mx-auto disabled:opacity-50"
                >
                  {saving ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Ajouter un équipement</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}