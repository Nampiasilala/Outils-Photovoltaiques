// app/components/InfoProfile.tsx
'use client';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Briefcase,
  Edit3,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Profile {
  id: number;
  username: string;
  email: string;
  department: string | null;
  role: string;
  status: string;
  date_joined: string;
  last_login: string | null;
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function InfoProfile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // DEBUG logs
  console.log('🔍 InfoProfile render: user =', user);
  console.log('🔍 accessToken =', localStorage.getItem('accessToken'));
  console.log('🔍 NEXT_PUBLIC_API_BASE_URL =', API);

  const authHeader = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('❌ authHeader(): pas de token trouvé');
      logout();
      throw new Error('Token manquant');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  useEffect(() => {
    // Si user n'est pas encore défini, on stoppe et on passe loading à false
    if (user == null) {
      console.warn('⚠️ InfoProfile: user non défini, arrêt du fetchWithAuth');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        console.log(`➡️ Fetching ${API}/users/${user.id}/`);
        const res = await fetchWithAuth(`${API}/users/${user.id}/`, {
          headers: authHeader(),
        });
        console.log('⬅️ Status fetchWithAuth profile:', res.status);
        if (res.status === 401) {
          console.error('❌ 401 Unauthorized, logout');
          logout();
          return;
        }
        if (!res.ok) {
          throw new Error(`Erreur HTTP ${res.status}`);
        }
        const d = await res.json();
        console.log('✅ profile JSON:', d);
        const p: Profile = {
          id: d.id,
          username: d.username,
          email: d.email,
          department: d.department,
          role: d.role,
          status: d.status,
          date_joined: d.date_joined,
          last_login: d.last_login,
        };
        setProfile(p);
        setForm(p);
      } catch (err: any) {
        console.error('❌ Exception fetchProfile:', err);
        toast.error(err.message || 'Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, API, logout]);

  const saveProfile = async () => {
    if (!form) return;
    try {
      console.log(`➡️ Saving profile PUT ${API}/users/${form.id}/`, form);
      const res = await fetchWithAuth(`${API}/users/${form.id}/`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          department: form.department,
        }),
      });
      console.log('⬅️ Status save profile:', res.status);
      if (res.status === 401) {
        console.error('❌ 401 Unauthorized on save, logout');
        logout();
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erreur ${res.status}: ${text}`);
      }
      setProfile(form);
      setEditing(false);
      toast.success('Profil mis à jour');
    } catch (err: any) {
      console.error('❌ Exception saveProfile:', err);
      toast.error(err.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  // Si on n'a pas de user ou pas de profile, on affiche un message
  if (!user) {
    return (
      <div className="p-6 text-center text-red-600">
        Identifiant utilisateur manquant. Veuillez vous reconnecter.
      </div>
    );
  }
  if (!profile || !form) {
    return (
      <div className="p-6 text-center">
        Impossible de charger le profil. Vérifiez la console pour plus de détails.
      </div>
    );
  }

  const initials = profile.username
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            <p className="text-gray-600">{profile.role}</p>
          </div>
        </div>
        {editing ? (
          <div className="flex space-x-2">
            <button onClick={saveProfile} className="text-green-600">
              <Save />
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setForm(profile);
              }}
              className="text-red-600"
            >
              <X />
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-blue-600">
            <Edit3 />
          </button>
        )}
      </header>

      {/* Formulaire */}
      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-1 text-sm font-medium">
            <Mail /> Email
          </label>
          {editing ? (
            <input
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded p-2"
            />
          ) : (
            <p className="p-2 bg-gray-50 rounded">{profile.email}</p>
          )}
        </div>
        <div>
          <label className="flex items-center gap-1 text-sm font-medium">
            <Briefcase /> Département
          </label>
          {editing ? (
            <input
              value={form.department || ''}
              onChange={e =>
                setForm({ ...form, department: e.target.value })
              }
              className="w-full border rounded p-2"
            />
          ) : (
            <p className="p-2 bg-gray-50 rounded">
              {profile.department || '-'}
            </p>
          )}
        </div>

        <p className="text-sm text-gray-500 flex items-center gap-1">
          <Calendar /> Inscrit le{' '}
          {new Date(profile.date_joined).toLocaleDateString()}
        </p>
        {profile.last_login && (
          <p className="text-sm text-gray-500">
            Dernière connexion :{' '}
            {new Date(profile.last_login).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
