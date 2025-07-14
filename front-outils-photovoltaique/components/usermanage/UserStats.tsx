"use client";

import { Shield, UserCheck, UserX, UserIcon } from "lucide-react";

interface UserStatsProps {
  total: number;
  actifs: number;
  inactifs: number;
  admins: number;
}

export default function UserStats({ total, actifs, inactifs, admins }: UserStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total utilisateurs</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Utilisateurs actifs</p>
            <p className="text-2xl font-bold text-green-600">{actifs}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Utilisateurs inactifs</p>
            <p className="text-2xl font-bold text-gray-600">{inactifs}</p>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <UserX className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Administrateurs</p>
            <p className="text-2xl font-bold text-purple-600">{admins}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
