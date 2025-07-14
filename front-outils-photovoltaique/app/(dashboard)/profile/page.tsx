// app/components/InfoProfile.tsx
"use client";

import { useEffect, useState } from "react";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Briefcase,
  Edit3,
  Save,
  X,
  Settings,
  Bell,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button"; // ← votre composant Button

interface UserProfile {
  id: number;
  username: string;
  email: string;
  department: string | null;
  role: string;
  status: string;
  joinDate: string;
  lastLogin: string | null;
}

const API = "http://localhost:8000/api";

export default function InfoProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    const id = localStorage.getItem("user_id");
    if (!id) {
      toast.error("Identifiant utilisateur manquant");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API}/users/${id}/`, {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error();
        const d = await res.json();
        const p: UserProfile = {
          id: d.id,
          username: d.username,
          email: d.email,
          department: d.department,
          role: d.role,
          status: d.status,
          joinDate: d.date_joined,
          lastLogin: d.last_login,
        };
        setProfile(p);
        setForm(p);
      } catch {
        toast.error("Impossible de charger le profil");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveProfile = async () => {
    if (!form) return;
    try {
      const res = await fetch(`${API}/users/${form.id}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          department: form.department,
        }),
      });
      if (!res.ok) throw new Error();
      setProfile(form);
      setEditing(false);
      toast.success("Profil mis à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading || !profile || !form) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const initials = profile.username
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
              <p className="text-gray-600">Informations personnelles</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Carte de profil */}
        <div className="bg-white border rounded-xl shadow-lg p-6 space-y-6">
          {/* Avatar & Nom */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {profile.username}
              </h2>
              <p className="text-sm text-gray-600">Rôle : {profile.role}</p>
            </div>
          </div>

          {/* Méta */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Inscrit le {new Date(profile.joinDate).toLocaleDateString()}
            </span>
            {profile.lastLogin && (
              <span className="flex items-center">
                Dernière connexion :{" "}
                {new Date(profile.lastLogin).toLocaleString()}
              </span>
            )}
          </div>

          {/* Formulaire / affichage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="inline w-4 h-4 mr-1" />
                Email
              </label>
              {editing ? (
                <input
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              ) : (
                <p className="bg-gray-50 rounded-lg p-3">{profile.email}</p>
              )}
            </div>

            {/* Département */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Briefcase className="inline w-4 h-4 mr-1" />
                Département
              </label>
              {editing ? (
                <select
                  value={form.department ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">--</option>
                  <option value="IT">IT</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Ventes">Ventes</option>
                  <option value="Support">Support</option>
                  <option value="RH">RH</option>
                  <option value="Finance">Finance</option>
                </select>
              ) : (
                <p className="bg-gray-50 rounded-lg p-3">
                  {profile.department || "-"}
                </p>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3">
            {!editing ? (
              <Button onClick={() => setEditing(true)}>
                <Edit3 className="w-4 h-4" />
                Modifier
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={saveProfile}>
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </Button>
                <Button variant="outline" onClick={() => {
                    setEditing(false);
                    setForm(profile);
                  }}>
                  <X className="w-4 h-4" />
                  Annuler
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
