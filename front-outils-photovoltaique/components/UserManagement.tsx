// app/components/UserManagement.tsx
'use client';

import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Mail, Search, Filter, Loader, Users } from 'lucide-react';
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

  const authHeader = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { logout(); throw new Error('Token manquant'); }
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    if (!user) return setLoading(false);
    (async () => {
      try {
        const res = await fetchWithAuth(`${API}/users/`, { headers: authHeader() });
        if (res.status === 401) { logout(); return; }
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data = await res.json();
        setUsers(data.map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          joinDate: u.date_joined,
        })));
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const deleteUser = async (id: number) => {
    try {
      const res = await fetchWithAuth(`${API}/users/${id}/`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setUsers(u => u.filter(x => x.id !== id));
      toast.success('Utilisateur supprimé');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = users.filter(u =>
    (u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterRole === 'Tous' || u.role === filterRole)
  );

  return (
    <div className="p-4 max-w-5xl mx-auto text-sm">
      <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-blue-600" />
        Gestion des utilisateurs
      </h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            className="pl-8 pr-2 py-2 border rounded w-full"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            className="pl-8 pr-2 py-2 border rounded w-full"
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
          >
            <option>Tous</option>
            <option>Admin</option>
            <option>Utilisateur</option>
            <option>Modérateur</option>
            <option>Invité</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader className="animate-spin w-6 h-6 text-blue-600" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border rounded shadow text-sm">
            <thead className="bg-gray-100">
              <tr className="text-left text-gray-600 uppercase text-xs">
                <th className="px-3 py-2">Utilisateur</th>
                <th className="px-3 py-2">Rôle</th>
                <th className="px-3 py-2">Inscrit le</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {filtered.length > 0 ? (
                filtered.map(u => (
                  <tr key={u.id}>
                    <td className="px-3 py-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{u.username}</div>
                        <div className="text-gray-500 text-xs">{u.email}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">{u.role}</td>
                    <td className="px-3 py-2">{new Date(u.joinDate).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-right">
                      <DeleteAlert
                        label={`Supprimer ${u.username} ?`}
                        onConfirm={() => deleteUser(u.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    Aucun utilisateur à afficher
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
