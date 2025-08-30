"use client";

import { useEffect, useState } from "react";
import { fetchWithAdminAuth } from "@/lib/fetchWithAdminAuth";
import { Spinner } from "@/LoadingProvider";
import { Icons } from "../../../src/assets/icons";

type Role = "Admin" | "Entreprise" | string;

export interface UserDetails {
  id: number;
  username: string;
  email: string;
  role: Role;
  date_joined?: string | null;
  last_login?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  description?: string | null;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export default function UserDetailsModal({
  isOpen,
  onClose,
  userId,
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
}) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !userId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWithAdminAuth(`/users/${userId}/`);
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`Erreur ${res.status}: ${t || res.statusText}`);
        }
        const d = await res.json();
        const mapped: UserDetails = {
          id: d.id,
          username: d.username,
          email: d.email,
          role:
            d.role ??
            ((d.is_superuser || d.is_staff) ? "Admin" : "Entreprise"),
          date_joined: d.date_joined ?? null,
          last_login: d.last_login ?? null,
          phone: d.phone ?? null,
          address: d.address ?? null,
          website: d.website ?? null,
          description: d.description ?? null,
          is_staff: d.is_staff,
          is_superuser: d.is_superuser,
        };
        setUser(mapped);
      } catch (e: any) {
        setError(e?.message || "Impossible de charger l'utilisateur.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Icons.User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Détails de l'utilisateur</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100"
            aria-label="Fermer"
          >
            <Icons.X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {loading ? (
            <div className="min-h-[180px] flex items-center justify-center">
              <Spinner size={28} />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
              {error}
            </div>
          ) : !user ? (
            <div className="text-slate-600">Aucune donnée.</div>
          ) : (
            <div className="space-y-6">
              {/* Bloc identité */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Icons.User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-semibold">{user.username}</div>
                  <div className="text-slate-600 text-sm">{user.email}</div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "Admin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "Entreprise"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-slate-500 text-sm">Inscription</div>
                  <div className="font-medium">
                    {user.date_joined
                      ? new Date(user.date_joined).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-slate-500 text-sm">Dernière connexion</div>
                  <div className="font-medium">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleString("fr-FR")
                      : "—"}
                  </div>
                </div>
              </div>

              {/* Infos complémentaires */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <Icons.Phone className="w-4 h-4" /> Téléphone
                    </div>
                    <div className="font-medium">{user.phone || "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <Icons.Globe className="w-4 h-4" /> Site web
                    </div>
                    <div className="font-medium break-all">
                      {user.website ? (
                        <a
                          href={user.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {user.website}
                        </a>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-2 flex items-center gap-2">
                    <Icons.MapPin className="w-4 h-4" /> Adresse
                  </div>
                  <div className="font-medium whitespace-pre-line bg-slate-50 border border-slate-200 rounded-lg p-3 min-h-[64px]">
                    {user.address || "—"}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="text-sm text-slate-500 mb-2 flex items-center gap-2">
                  <Icons.FileText className="w-4 h-4" /> Description
                </div>
                <div className="font-medium whitespace-pre-line bg-slate-50 border border-slate-200 rounded-lg p-3 min-h-[64px]">
                  {user.description || "—"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
