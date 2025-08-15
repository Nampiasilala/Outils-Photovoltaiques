// app/admin/users/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "@/components/AuthContext";
import { fetchWithAdminAuth } from "@/lib/fetchWithAdminAuth";
import { toast } from "react-toastify";
import DeleteAlert from "@/components/DeleteAlert";
import {
  Users as UsersIcon,
  Mail,
  Search,
  Filter,
  Loader,
} from "lucide-react";

type RoleFilter = "Tous" | "Admin" | "Modérateur" | "Utilisateur" | "Invité";

interface UserRow {
  id: number;
  username: string;
  email: string;
  role: string;      // string libre côté backend
  joinDate: string;  // ISO
}

export default function AdminUsersPage() {
  const { admin, loading: guardLoading } = useAdminAuth();

  const [rows, setRows] = useState<UserRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<RoleFilter>("Tous");

  // ----- Data -----
  const loadUsers = async () => {
    setFetching(true);
    try {
      const res = await fetchWithAdminAuth("/users/");
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Erreur ${res.status}: ${txt || res.statusText}`);
      }
      const data = await res.json();
      const mapped: UserRow[] = (Array.isArray(data) ? data : []).map((u: any) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role ?? (u.is_superuser ? "Admin" : u.is_staff ? "Modérateur" : "Utilisateur"),
        joinDate: u.date_joined ?? u.created_at ?? new Date().toISOString(),
      }));
      setRows(mapped);
    } catch (err: any) {
      toast.error(err?.message || "Échec du chargement des utilisateurs.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!guardLoading && admin) void loadUsers();
  }, [guardLoading, admin]);

  // ----- Derived -----
  const filtered = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    return rows.filter((u) => {
      const matchText =
        !t ||
        u.username?.toLowerCase().includes(t) ||
        u.email?.toLowerCase().includes(t) ||
        u.role?.toLowerCase().includes(t);
      const matchRole = filterRole === "Tous" ? true : u.role === filterRole;
      return matchText && matchRole;
    });
  }, [rows, searchTerm, filterRole]);

  // ----- Actions -----
  const handleDeleteUser = async (id: number): Promise<void> => {
    setIsDeleting(id);
    try {
      const res = await fetchWithAdminAuth(`/users/${id}/`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Erreur ${res.status}: ${txt || res.statusText}`);
      }
      setRows((r) => r.filter((x) => x.id !== id));
      toast.success("Utilisateur supprimé avec succès !");
    } catch (err: any) {
      toast.error(err?.message || "Échec de la suppression de l'utilisateur.");
    } finally {
      setIsDeleting(null);
    }
  };

  // ----- Guards UI -----
  if (guardLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }
  if (!admin) return null;

  // ----- UI -----
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900">
          <UsersIcon className="w-7 h-7 text-blue-600" />
          Gestion des utilisateurs
        </h1>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-slate-800"
            placeholder="Rechercher par nom, email ou rôle…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-slate-800"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as RoleFilter)}
          >
            <option value="Tous">Tous les rôles</option>
            <option value="Admin">Administrateur</option>
            <option value="Modérateur">Modérateur</option>
            <option value="Utilisateur">Utilisateur</option>
            <option value="Invité">Invité</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {fetching ? (
        <div className="flex items-center justify-center min-h-[200px] bg-white rounded-lg shadow-md">
          <Loader className="animate-spin w-8 h-8 text-blue-600" />
          <span className="ml-3 text-base text-slate-600">
            Chargement des utilisateurs…
          </span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-600 uppercase tracking-wider text-xs">
                  <th className="px-4 py-3 font-semibold">Utilisateur</th>
                  <th className="px-4 py-3 font-semibold">Rôle</th>
                  <th className="px-4 py-3 font-semibold">Inscription</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.length > 0 ? (
                  filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <div>
                          <div className="font-medium text-slate-900">{u.username}</div>
                          <div className="text-slate-500 text-xs">{u.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            u.role === "Admin"
                              ? "bg-red-100 text-red-800"
                              : u.role === "Modérateur"
                              ? "bg-yellow-100 text-yellow-800"
                              : u.role === "Utilisateur"
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {new Date(u.joinDate).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteAlert
                          label={`Supprimer ${u.username} ?`}
                          onConfirm={() => handleDeleteUser(u.id)}
                          isLoading={isDeleting === u.id}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-500">
                      Aucun utilisateur ne correspond à votre recherche ou à vos filtres.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
