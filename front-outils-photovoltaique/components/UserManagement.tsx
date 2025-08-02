'use client';

import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';
import {
  Mail,
  Search,
  Filter,
  Loader,
  Users,
  Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import DeleteAlert from '@/components/DeleteAlert';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  joinDate: string;
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function UserManagement() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const authHeader = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      logout();
      throw new Error('Jeton d\'authentification manquant. Veuillez vous reconnecter.');
    }
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, [logout]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API}/users/`, { headers: authHeader() });
      if (res.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        logout();
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Erreur lors du chargement des utilisateurs: ${res.status}`);
      }
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
    } catch (err: any) {
      toast.error(err.message || 'Échec du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  }, [authHeader, logout]);

  useEffect(() => {
    if (user) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user, fetchUsers]);

  const handleDeleteUser = async (id: number) => {
    setIsDeleting(id);
    try {
      const res = await fetchWithAuth(`${API}/users/${id}/`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (res.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        logout();
        return;
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Erreur lors de la suppression de l'utilisateur: ${res.status}`);
      }
      setUsers((prevUsers) => prevUsers.filter((x) => x.id !== id));
      toast.success('Utilisateur supprimé avec succès !');
    } catch (err: any) {
      toast.error(err.message || 'Échec de la suppression de l\'utilisateur.');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterRole === 'Tous' || u.role === filterRole)
  );

  return (
    <div className="p-2 sm:p-2 max-w-7xl mx-auto text-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-3 text-gray-800">
          <Users className="w-7 h-7 text-blue-600" />
          Gestion des Utilisateurs
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-gray-700"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-gray-700"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="Tous">Tous les rôles</option>
            <option value="Admin">Administrateur</option>
            <option value="Utilisateur">Utilisateur standard</option>
            <option value="Modérateur">Modérateur</option>
            <option value="Invité">Invité</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px] bg-white rounded-lg shadow-md">
          <Loader className="animate-spin w-8 h-8 text-blue-600" />
          <span className="ml-3 text-lg text-gray-600">Chargement des utilisateurs...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-gray-600 uppercase tracking-wider text-xs">
                  <th className="px-4 py-3 font-semibold">Utilisateur</th>
                  <th className="px-4 py-3 font-semibold">Rôle</th>
                  <th className="px-4 py-3 font-semibold">Date d'inscription</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="font-medium text-gray-900">{u.username}</div>
                          <div className="text-gray-500 text-xs">{u.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold
                            ${
                              u.role === 'Admin'
                                ? 'bg-red-100 text-red-800'
                                : u.role === 'Modérateur'
                                ? 'bg-yellow-100 text-yellow-800'
                                : u.role === 'Utilisateur'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(u.joinDate).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
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
                    <td colSpan={4} className="text-center py-10 text-gray-500 text-base">
                      <p>
                        <Search className="inline-block w-6 h-6 mr-2 mb-1" />
                        Aucun utilisateur ne correspond à votre recherche ou à vos filtres.
                      </p>
                      <p className="mt-2 text-sm">Essayez d'ajuster vos critères.</p>
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
