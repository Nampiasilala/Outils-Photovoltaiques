"use client";

import { User } from "@/lib/types";
import { getInitials, getRoleColor, getStatusColor } from "@/lib/utils";
import { Mail, Trash2, UserCheck, UserX } from "lucide-react";

interface UserTableProps {
  users: User[];
  onDelete: (userId: number) => void;
  onToggleStatus: (userId: number) => void;
}

export default function UserTable({
  users,
  onDelete,
  onToggleStatus,
}: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-700 bg-gray-50 border-b-2 border-gray-200">
            <th className="py-4 px-4 font-semibold">Utilisateur</th>
            <th className="py-4 px-4 font-semibold">Rôle</th>
            <th className="py-4 px-4 font-semibold">Département</th>
            <th className="py-4 px-4 font-semibold">Statut</th>
            <th className="py-4 px-4 font-semibold">Dernière connexion</th>
            <th className="py-4 px-4 font-semibold">Date d'inscription</th>
            <th className="py-4 px-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user, idx) => (
            <tr
              key={user.id}
              className={`border-b hover:bg-blue-50 transition-colors ${
                idx % 2 ? "bg-gray-50" : "bg-white"
              }`}
            >
              {/* Nom + avatar */}
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(user.username)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.username}</div>
                    <div className="text-gray-500 text-xs flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>

              <td className="py-4 px-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </td>

              <td className="py-4 px-4 text-gray-700">{user.department ?? "-"}</td>

              <td className="py-4 px-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    user.status
                  )}`}
                >
                  {user.status}
                </span>
              </td>

              <td className="py-4 px-4 text-gray-600">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "-"}
              </td>

              <td className="py-4 px-4 text-gray-600">
                {new Date(user.joinDate).toLocaleDateString()}
              </td>

              <td className="py-4 px-4">
                <div className="flex items-center justify-end space-x-2">
                  {/* Activer / Désactiver */}
                  <button
                    onClick={() => onToggleStatus(user.id)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                    title={user.status === "Actif" ? "Désactiver" : "Activer"}
                  >
                    {user.status === "Actif" ? (
                      <UserX className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </button>

                  {/* Supprimer */}
                  <button
                    onClick={() => onDelete(user.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucun utilisateur trouvé.
        </div>
      )}
    </div>
  );
}
