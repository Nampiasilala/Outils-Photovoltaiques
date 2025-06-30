"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Edit } from "lucide-react";

interface Equipment {
  id: number;
  name: string;
  power: number; // Puissance en W
  voltage: number; // Tension en V
  price: number; // Prix en Ar
}

export default function EquipmentManager() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const addEquipment = () => {
    const newEquipment: Equipment = {
      id: Date.now(),
      name: "",
      power: 0,
      voltage: 12,
      price: 0,
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
  };

  const handleSave = () => {
    setEditingId(null);
    // Tu peux ajouter ici une requête API si nécessaire
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des équipements</h1>
        </div>
        <p className="text-gray-600 text-sm">Ajoutez et gérez vos équipements pour le dimensionnement photovoltaïque.</p>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={addEquipment}
            className="btn btn-success btn-sm flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un équipement</span>
          </button>
        </div>

        <table className="w-full text-sm table-auto">
          <thead>
            <tr className="text-left text-gray-700 border-b">
              <th className="py-2">Nom</th>
              <th className="py-2">Puissance (W)</th>
              <th className="py-2">Tension (V)</th>
              <th className="py-2">Prix (Ar)</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipments.map((equip) => (
              <tr key={equip.id} className="border-b hover:bg-gray-50">
                <td className="py-3">
                  {editingId === equip.id ? (
                    <input
                      type="text"
                      value={equip.name}
                      onChange={(e) => updateEquipment(equip.id, "name", e.target.value)}
                      className="input input-bordered w-full text-sm"
                      placeholder="Nom de l'équipement"
                    />
                  ) : (
                    <span>{equip.name}</span>
                  )}
                </td>
                <td className="py-3">
                  {editingId === equip.id ? (
                    <input
                      type="number"
                      value={equip.power}
                      onChange={(e) => updateEquipment(equip.id, "power", Number(e.target.value))}
                      className="input input-bordered w-24 text-sm"
                      placeholder="Ex. 100"
                    />
                  ) : (
                    <span>{equip.power} W</span>
                  )}
                </td>
                <td className="py-3">
                  {editingId === equip.id ? (
                    <input
                      type="number"
                      value={equip.voltage}
                      onChange={(e) => updateEquipment(equip.id, "voltage", Number(e.target.value))}
                      className="input input-bordered w-24 text-sm"
                      placeholder="Ex. 12"
                    />
                  ) : (
                    <span>{equip.voltage} V</span>
                  )}
                </td>
                <td className="py-3">
                  {editingId === equip.id ? (
                    <input
                      type="number"
                      value={equip.price}
                      onChange={(e) => updateEquipment(equip.id, "price", Number(e.target.value))}
                      className="input input-bordered w-24 text-sm"
                      placeholder="Ex. 200000"
                    />
                  ) : (
                    <span>{equip.price.toLocaleString()} Ar</span>
                  )}
                </td>
                <td className="py-3">
                  {editingId === equip.id ? (
                    <button
                      onClick={handleSave}
                      className="btn btn-primary btn-sm flex items-center space-x-1"
                    >
                      <Save className="w-4 h-4" />
                      <span>Enregistrer</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingId(equip.id)}
                        className="btn btn-primary btn-sm flex items-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => deleteEquipment(equip.id)}
                        className="btn btn-error btn-sm flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {equipments.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-6">Aucun équipement ajouté.</p>
        )}
      </div>
    </div>
  );
}
