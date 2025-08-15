"use client";

import { useAdminAuth } from "@/components/AuthContext";

export default function AdminUsersPage() {
  const { admin, loading } = useAdminAuth();
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }
  if (!admin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Utilisateurs</h1>
      <p className="text-slate-600 mb-6">Gérez les comptes et rôles.</p>
      {/* TODO: gestion des utilisateurs */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Contenu à implémenter.</p>
      </div>
    </div>
  );
}
