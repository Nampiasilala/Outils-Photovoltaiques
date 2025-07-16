// app/components/UserManagement.tsx
'use client';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Mail, Search, Filter } from 'lucide-react';
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
        if (res.status===401) { logout(); return; }
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data = await res.json();
        setUsers(data.map((u:any) => ({
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
      if (res.status===401) { logout(); return; }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setUsers(u => u.filter(x=>x.id!==id));
      toast.success('Utilisateur supprimé');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = users.filter(u =>
    (u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterRole==='Tous' || u.role===filterRole)
  );

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement…</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>

      <div className="flex mb-4 space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-8 border rounded"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={e=>setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            className="pl-8 border rounded"
            value={filterRole}
            onChange={e=>setFilterRole(e.target.value)}
          >
            <option>Tous</option>
            <option>Admin</option>
            <option>Utilisateur</option>
            <option>Modérateur</option>
            <option>Invité</option>
          </select>
        </div>
      </div>

      <table className="w-full table-auto text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2">Utilisateur</th>
            <th className="px-3 py-2">Rôle</th>
            <th className="px-3 py-2">Inscrit le</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map(u => (
              <tr key={u.id} className="border-b">
                <td className="px-3 py-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{u.username}</span>
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
              <td colSpan={4} className="py-8 text-center text-gray-500">
                Aucun utilisateur à afficher
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
