"use client";

import { useEffect, useState } from "react";
import { Mail, Search, Filter } from "lucide-react";
import { toast } from "react-toastify";
import DeleteAlert from "@/components/DeleteAlert";           // ← nouveau composant
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  joinDate: string;
}

const roles = ["Admin", "Utilisateur", "Modérateur", "Invité"];
const API_BASE_URL = "http://localhost:8000/api";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("Tous");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/users/`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(
        data.map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          joinDate: u.date_joined,
        }))
      );
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("Utilisateur supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const s = searchTerm.toLowerCase();
    return (
      (u.username.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)) &&
      (filterRole === "Tous" || u.role === filterRole)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Gestion des Utilisateurs</h1>

        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6 space-y-3 md:space-y-0">
          <div className="relative w-full md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
            />
          </div>

          <div className="relative w-full md:w-52">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg w-full bg-white"
            >
              <option value="Tous">Tous les rôles</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <span className="text-gray-600">
            {filtered.length} utilisateur{filtered.length !== 1 && "s"} trouvé
            {filtered.length !== 1 && "s"}
          </span>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="py-3 px-4 font-semibold">Utilisateur</th>
                <th className="py-3 px-4 font-semibold">Rôle</th>
                <th className="py-3 px-4 font-semibold">Date d'inscription</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr
                  key={u.id}
                  className={`${i % 2 ? "bg-gray-50" : "bg-white"} border-b`}
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{u.username}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {u.email}
                    </div>
                  </td>

                  <td className="py-3 px-4">{u.role}</td>

                  <td className="py-3 px-4">
                    {new Date(u.joinDate).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <DeleteAlert
                      label={`Supprimer ${u.username} ?`}
                      onConfirm={() => deleteUser(u.id)}
                    />
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-500">
                    Aucun utilisateur
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
