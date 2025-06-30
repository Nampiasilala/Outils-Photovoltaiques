"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john.doe@email.com", role: "Admin", status: "Actif" },
    { id: 2, name: "Jane Smith", email: "jane.smith@email.com", role: "Utilisateur", status: "Inactif" },
    { id: 3, name: "Alice Martin", email: "alice.martin@email.com", role: "Utilisateur", status: "Actif" },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Tous les utilisateurs</h1>
          <button className="flex items-center bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un utilisateur
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-4 relative max-w-sm">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* Tableau des utilisateurs */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === "Actif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex justify-end space-x-2">
                    <button className="flex items-center text-blue-600 hover:text-blue-800">
                      <Pencil className="w-4 h-4 mr-1" />
                      Modifier
                    </button>
                    <button className="flex items-center text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
