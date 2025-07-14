"use client";

import { User } from "@/lib/types";
import { getInitials, getRoleColor, getStatusColor } from "@/lib/utils";
import { X, Mail, Building, Calendar, UserCheck, UserX } from "lucide-react";

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
  onToggleStatus: (userId: number) => void;
}

export default function UserDetailsModal({
  user,
  onClose,
  onToggleStatus,
}: UserDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Détails de l'utilisateur
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Avatar & Name */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {getInitials(user.username)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
            <p className="text-gray-600 flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              {user.email}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4 mb-6">
          <InfoRow label="Rôle" value={user.role} badgeColor={getRoleColor(user.role)} />
          <InfoRow
            label="Département"
            value={user.department ?? "-"}
            icon={<Building className="w-4 h-4 mr-1" />}
          />
          <InfoRow
            label="Statut"
            value={user.status}
            badgeColor={getStatusColor(user.status)}
          />
          <InfoRow
            label="Dernière connexion"
            value={
              user.lastLogin
                ? new Date(user.lastLogin).toLocaleDateString()
                : "-"
            }
            icon={<Calendar className="w-4 h-4 mr-1" />}
          />
          <InfoRow
            label="Date d'inscription"
            value={new Date(user.joinDate).toLocaleDateString()}
          />
        </div>

        {/* Activer / Désactiver */}
        <button
          onClick={() => {
            onToggleStatus(user.id);
            onClose();
          }}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
        >
          {user.status === "Actif" ? (
            <UserX className="w-4 h-4" />
          ) : (
            <UserCheck className="w-4 h-4" />
          )}
          <span>
            {user.status === "Actif" ? "Désactiver" : "Activer"}
          </span>
        </button>
      </div>
    </div>
  );
}

/* Helper composant pour éviter la répétition */
function InfoRow({
  label,
  value,
  badgeColor,
  icon,
}: {
  label: string;
  value: string;
  badgeColor?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      {badgeColor ? (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badgeColor}`}>
          {value}
        </span>
      ) : (
        <span className="text-gray-900 flex items-center">
          {icon}
          {value}
        </span>
      )}
    </div>
  );
}
