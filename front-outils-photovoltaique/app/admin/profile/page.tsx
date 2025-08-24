"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAdminAuth } from "@/lib/fetchWithAdminAuth";
import { useAuth } from "@/components/AuthContext";
import { Icons } from "../../../src/assets/icons"; // Ajuster si nécessaire

import { toast } from "react-toastify";
import { useLoading, Spinner } from "@/LoadingProvider";
import { env } from "@/lib/env";
interface Profile {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  date_joined: string;
  last_login: string | null;
}

const API = env.NEXT_PUBLIC_API_BASE_URL;

export default function AdminProfilePage() {
  const router = useRouter();
  const { admin, loading: authLoading, logout } = useAuth();
  const { wrap, isBusy } = useLoading(); // ✅ overlay + état global

  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showPasswordField, setShowPasswordField] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const getRoleFromFlags = (
    is_superuser?: boolean,
    is_staff?: boolean,
    fallback?: string
  ) => {
    if (is_superuser) return "admin";
    if (is_staff) return "manager";
    return fallback ?? "user";
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200";
      case "manager":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "user":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return "text-green-600";
      case "inactive":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Chargement du profil
  useEffect(() => {
    if (authLoading) return;
    if (!admin) {
      router.replace("/admin-login");
      return;
    }

    (async () => {
      setLoading(true);
      try {
        await wrap(async () => {
          const res = await fetchWithAdminAuth(`${API}/users/${admin.id}/`);
          if (!res.ok) {
            if (res.status === 401) {
              logout();
              return;
            }
            const text = await res.text().catch(() => "");
            throw new Error(`Erreur HTTP ${res.status} ${text}`);
          }

          const d = await res.json();
          const derivedRole = getRoleFromFlags(
            d?.is_superuser,
            d?.is_staff,
            d?.role
          );
          const derivedStatus = d?.status ?? "active";

          const p: Profile = {
            id: d.id,
            username: d.username ?? admin.username ?? "",
            email: d.email ?? admin.email,
            role: derivedRole,
            status: derivedStatus,
            date_joined: d.date_joined ?? new Date().toISOString(),
            last_login: d.last_login ?? null,
          };

          setProfile(p);
          setForm(p);
        }, "Chargement du profil…");
      } catch (err: any) {
        console.error("Erreur profil:", err);
        toast.error(err?.message || "Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    })();
  }, [admin, authLoading, logout, router, wrap]);

  const saveProfile = async () => {
    if (!form) return;
    setIsSaving(true);
    try {
      await wrap(async () => {
        const res = await fetchWithAdminAuth(`${API}/users/${form.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ username: form.username, email: form.email }),
        });

        if (!res.ok) {
          if (res.status === 401) {
            logout();
            return;
          }
          const text = await res.text().catch(() => "");
          throw new Error(`Erreur ${res.status}: ${text}`);
        }
      }, "Enregistrement du profil…");

      setProfile(form);
      setEditing(false);
      toast.success("Profil mis à jour avec succès");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (!admin) return;

    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Tous les champs sont requis");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    setIsChangingPassword(true);
    try {
      await wrap(async () => {
        const res = await fetchWithAdminAuth(
          `${API}/users/${admin.id}/change-password/`,
          {
            method: "POST",
            body: JSON.stringify({
              old_password: oldPassword,
              new_password: newPassword,
              confirm_password: confirmPassword,
            }),
          }
        );

        const result = await res.json().catch(() => null);

        if (!res.ok) {
          if (result && typeof result === "object") {
            Object.entries(result).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                messages.forEach((msg) => toast.error(`${field} : ${msg}`));
              } else if (messages) {
                toast.error(`${field} : ${messages}`);
              }
            });
          } else {
            toast.error(`Erreur ${res.status}`);
          }
          return;
        }
      }, "Mise à jour du mot de passe…");

      toast.success("Mot de passe mis à jour");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordField(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erreur lors du changement de mot de passe");
    } finally {
      setIsChangingPassword(false);
    }
  };

  /* -------------------- Rendu -------------------- */

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
        <div className="text-center">
          {/* ⬇️ n’affiche le spinner local que si l’overlay n’est PAS visible */}
          {!isBusy && (
            <div className="mx-auto mb-4">
              <Spinner size={48} />
            </div>
          )}
          <p className="text-gray-600 font-medium">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl">
        <Icons.AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Erreur d'authentification
        </h3>
        <p className="text-red-600">
          Session invalide. Veuillez vous reconnecter.
        </p>
      </div>
    );
  }

  if (!profile || !form) {
    return (
      <div className="p-8 text-center bg-yellow-50 border border-yellow-200 rounded-xl">
        <Icons.AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-yellow-700">
          Impossible de charger le profil. Réessayez plus tard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-10">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900">
          <Icons.User className="w-7 h-7 text-blue-600" />
          Gestion de profile
        </h1>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-2 text-gray-600">
          <div className="flex flex-col px-2 sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {profile.username || "(sans nom)"}
                </h1>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                      profile.role
                    )} bg-white/90`}
                  >
                    <Icons.Shield className="w-4 h-4 inline mr-1" />
                    {profile.role}
                  </span>
                  <span
                    className={`text-sm font-medium ${getStatusColor(
                      profile.status
                    )}`}
                  >
                    • {profile.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {editing ? (
                <>
                  <button
                    onClick={saveProfile}
                    disabled={isSaving}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-slate-800 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {/* ⬇️ pas de double spinner : si overlay actif, on laisse l’icône */}
                    {isSaving ? (
                      !isBusy ? (
                        <Spinner size={16} />
                      ) : (
                        <Icons.Save className="w-4 h-4" />
                      )
                    ) : (
                      <Icons.Save className="w-4 h-4" />
                    )}
                    {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setForm(profile);
                    }}
                    className="bg-blue-600 text-white hover:bg-blue-800 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
                  >
                    <Icons.X className="w-4 h-4" />
                    Annuler
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
                >
                  <Icons.Edit3 className="w-4 h-4" />
                  Modifier
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Icons.Mail className="w-5 h-5 text-blue-500" />
                  Adresse email
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500 focus:outline-none transition-colors bg-white"
                    placeholder="votre@email.com"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                    <p className="text-gray-900 font-medium">{profile.email}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-100 rounded-xl p-2 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Icons.Clock className="w-5 h-5 text-blue-500" />
                  Informations du compte
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Icons.Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Membre depuis
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {new Date(profile.date_joined).toLocaleDateString(
                          "fr-FR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  {profile.last_login && (
                    <div className="flex items-center gap-3">
                      <Icons.UserCheck className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Dernière connexion
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {new Date(profile.last_login).toLocaleString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 px-5 text-white">
          <h2 className="text-base font-bold flex items-center gap-3">
            <Icons.Lock className="w-4 h-4" />
            Sécurité du compte
          </h2>
        </div>

        <div className="p-8">
          {showPasswordField ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mot de passe actuel */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Icons.Lock className="w-4 h-4 text-gray-500" />
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Mot de passe actuel"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showOldPassword ? (
                        <Icons.EyeOff className="w-5 h-5" />
                      ) : (
                        <Icons.Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Icons.Lock className="w-4 h-4 text-green-500" />
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showNewPassword ? (
                        <Icons.EyeOff className="w-5 h-5" />
                      ) : (
                        <Icons.Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmation */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Icons.CheckCircle className="w-4 h-4 text-blue-500" />
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Confirmer le mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <Icons.EyeOff className="w-5 h-5" />
                      ) : (
                        <Icons.Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button
                  onClick={changePassword}
                  disabled={isChangingPassword}
                  className="bg-blue-600 hover:bg-blue-800  text-white text-sm px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {/* idem : pas de mini-spinner si l’overlay tourne */}
                  {isChangingPassword ? (
                    !isBusy ? (
                      <Spinner size={16} />
                    ) : (
                      <Icons.CheckCircle className="w-4 h-4" />
                    )
                  ) : (
                    <Icons.CheckCircle className="w-4 h-4" />
                  )}
                  {isChangingPassword
                    ? "Modification..."
                    : "Modifier le mot de passe"}
                </button>

                <button
                  onClick={() => {
                    setShowPasswordField(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="px-6 py-3 rounded-lg font-semibold text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-all duration-200"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Icons.Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Modifier votre mot de passe
              </h3>
              <p className="text-gray-500 mb-6">
                Assurez-vous que votre compte reste sécurisé
              </p>
              <button
                onClick={() => setShowPasswordField(true)}
                className="bg-blue-600 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
              >
                <Icons.Lock className="w-4 h-4" />
                Modifier le mot de passe
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
