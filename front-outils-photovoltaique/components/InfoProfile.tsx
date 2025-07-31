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
  Lock
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
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const authHeader = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      logout();
      throw new Error('Token manquant');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  useEffect(() => {
    if (user == null) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetchWithAuth(`${API}/users/${user.id}/`, {
          headers: authHeader(),
        });
        if (res.status === 401) {
          logout();
          return;
        }
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const d = await res.json();
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
        toast.error(err.message || 'Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const saveProfile = async () => {
    if (!form) return;
    try {
      const res = await fetchWithAuth(`${API}/users/${form.id}/`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          department: form.department,
        }),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erreur ${res.status}: ${text}`);
      }
      setProfile(form);
      setEditing(false);
      toast.success('Profil mis à jour avec succès');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  const changePassword = async () => {
    if (!newPassword.trim()) {
      toast.error("Le mot de passe ne peut pas être vide");
      return;
    }
    try {
      const res = await fetchWithAuth(`${API}/users/${user?.id}/change-password/`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) throw new Error('Erreur lors du changement de mot de passe');
      toast.success('Mot de passe mis à jour');
      setNewPassword('');
      setShowPasswordField(false);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du changement de mot de passe');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

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

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 bg-white shadow rounded-lg">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{profile.username}</h1>
            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{profile.role}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={saveProfile} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                <Save size={16} />
              </button>
              <button onClick={() => { setEditing(false); setForm(profile); }} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                <X size={16} />
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
              <Edit3 size={16} /> Modifier
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <Mail size={16} /> Email
          </label>
          {editing ? (
            <input
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          ) : (
            <p className="mt-1 text-gray-900">{profile.email}</p>
          )}
        </div>
        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <Briefcase size={16} /> Département
          </label>
          {editing ? (
            <input
              value={form.department || ''}
              onChange={e => setForm({ ...form, department: e.target.value })}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          ) : (
            <p className="mt-1 text-gray-900">{profile.department || '-'}</p>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p className="flex items-center gap-2">
          <Calendar size={16} /> Inscrit le {new Date(profile.date_joined).toLocaleDateString()}
        </p>
        {profile.last_login && (
          <p className="flex items-center gap-2 mt-1">
            <Calendar size={16} /> Dernière connexion : {new Date(profile.last_login).toLocaleString()}
          </p>
        )}
      </div>

      <div className="pt-4 border-t">
        {showPasswordField ? (
          <>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <Lock size={16} /> Nouveau mot de passe
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 border rounded px-3 py-2"
              />
              <button onClick={changePassword} className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm">
                Enregistrer
              </button>
              <button onClick={() => setShowPasswordField(false)} className="text-gray-500 hover:text-red-600 text-sm">Annuler</button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setShowPasswordField(true)}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
          >
            <Lock size={16} /> Modifier le mot de passe
          </button>
        )}
      </div>
    </div>
  );
}
