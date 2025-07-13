"use client";
import { Plus } from "lucide-react";

export default function UserHeader({ onAddUser }: { onAddUser: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600">Gérez les comptes et permissions utilisateurs</p>
        </div>
      </div>
      <button
        onClick={onAddUser}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>Ajouter un utilisateur</span>
      </button>
    </div>
  );
}
