"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Edit, Search, Filter, Calculator, Zap, DollarSign, X, CheckCircle } from "lucide-react";

interface Equipment {
  id: number;
  name: string;
  power: number; // Puissance en W
  voltage: number; // Tension en V
  price: number; // Prix en Ar
  category: string;
  hours: number; // Heures d'utilisation par jour
}

const categories = [
  "Éclairage",
  "Électroménager",
  "Informatique",
  "Climatisation",
  "Sécurité",
  "Autres"
];

export default function EquipmentManager() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Tous");
  const [showStats, setShowStats] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const addEquipment = () => {
    const newEquipment: Equipment = {
      id: Date.now(),
      name: "",
      power: 0,
      voltage: 12,
      price: 0,
      category: "Autres",
      hours: 0,
    };
    setEquipments((prev) => [...prev, newEquipment]);
    setEditingId(newEquipment.id);
  };

  const updateEquipment = (id: number, field: keyof Equipment, value: string | number) => {
    setEquipments((prev) =>
      prev.map((equip) => (equip.id === id ? { ...equip, [field]: value } : equip))
    );
  };

  const deleteEquipment = (id: number) => {
    setEquipments((prev) => prev.filter((equip) => equip.id !== id));
    showNotification("Équipement supprimé avec succès");
  };

  const handleSave = () => {
    setEditingId(null);
    showNotification("Équipement enregistré avec succès");
  };

  // Filtrage des équipements
  const filteredEquipments = equipments.filter((equip) => {
    const matchesSearch = equip.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "Tous" || equip.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculs des statistiques
  const totalPower = equipments.reduce((sum, equip) => sum + equip.power, 0);
  const totalPrice = equipments.reduce((sum, equip) => sum + equip.price, 0);
  const dailyConsumption = equipments.reduce((sum, equip) => sum + (equip.power * equip.hours), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
          <CheckCircle className="w-5 h-5" />
          <span>{notification}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Équipements</h1>
                <p className="text-gray-600">Dimensionnement photovoltaïque intelligent</p>
              </div>
            </div>
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center space-x-2 text-gray-700"
            >
              <Calculator className="w-4 h-4" />
              <span>Statistiques</span>
            </button>
          </div>

          {/* Stats Cards */}
          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Puissance totale</p>
                    <p className="text-2xl font-bold text-blue-600">{totalPower.toLocaleString()} W</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Coût total</p>
                    <p className="text-2xl font-bold text-green-600">{totalPrice.toLocaleString()} Ar</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Consommation/jour</p>
                    <p className="text-2xl font-bold text-purple-600">{(dailyConsumption/1000).toFixed(1)} kWh</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          )}
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
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={addEquipment}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un équipement</span>
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
                  <th className="py-3 px-4 font-semibold">Prix</th>
                  <th className="py-3 px-4 font-semibold">Consommation</th>
                  <th className="py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipments.map((equip, index) => (
                  <tr key={equip.id} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <input
                          type="text"
                          value={equip.name}
                          onChange={(e) => updateEquipment(equip.id, "name", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nom de l'équipement"
                        />
                      ) : (
                        <span className="font-medium">{equip.name || "Non défini"}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <select
                          value={equip.category}
                          onChange={(e) => updateEquipment(equip.id, "category", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{equip.category}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === equip.id ? (
                        <input
                          type="number"
                          value={equip.power}
                          onChange={(e) => updateEquipment(equip.id, "power", Number(e.target.value))}
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
                          onChange={(e) => updateEquipment(equip.id, "voltage", Number(e.target.value))}
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
                          onChange={(e) => updateEquipment(equip.id, "hours", Number(e.target.value))}
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
                          value={equip.price}
                          onChange={(e) => updateEquipment(equip.id, "price", Number(e.target.value))}
                          className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="200000"
                        />
                      ) : (
                        <span className="font-medium text-green-600">{equip.price.toLocaleString()} Ar</span>
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
                {searchTerm || filterCategory !== "Tous" ? "Aucun équipement trouvé" : "Aucun équipement"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterCategory !== "Tous" 
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par ajouter votre premier équipement"
                }
              </p>
              {!searchTerm && filterCategory === "Tous" && (
                <button
                  onClick={addEquipment}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
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
