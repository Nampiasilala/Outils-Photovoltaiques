"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { fetchWithAdminAuth } from "@/lib/fetchWithAdminAuth";
import { useAuth } from "@/components/AuthContext";
import { Icons } from "../../../src/assets/icons"; // ✅ Ajuste si besoin
import { Spinner, useLoading } from "@/LoadingProvider";
import { env } from "@/lib/env";

const API = env.NEXT_PUBLIC_API_BASE_URL;

type Role = "admin" | "entreprise" | "manager" | "user" | string;
type CompanyStatus = "active" | "inactive" | "pending" | string;

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: Role;
  status?: CompanyStatus;
  date_joined?: string;
  last_login?: string | null;
}

interface CompanyProfile {
  id: number;
  nom: string;
  email_contact?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  site_web?: string | null;
  description?: string | null;
  logo_url?: string | null;
  status?: CompanyStatus;
  created_at?: string | null;
  updated_at?: string | null;
}

/** 🔎 Retourne la 1re clé existante du payload backend parmi des candidates */
const pickKey = (obj: any, candidates: string[]) =>
  candidates.find((k) => obj && Object.prototype.hasOwnProperty.call(obj, k));

/** Construit un profil “entreprise” à partir du payload user (même table) */
function extractCompanyFromUser(u: any, emailFallback: string): CompanyProfile {
  return {
    id: u.id,
    nom:
      u.company_name ??
      u.entreprise_nom ??
      u.nom_entreprise ??
      u.company ??
      "Mon entreprise",
    email_contact: u.company_email ?? u.email_contact ?? emailFallback ?? "",
    telephone: u.phone ?? u.telephone ?? "",
    adresse: u.address ?? u.adresse ?? "",
    site_web: u.website ?? u.site_web ?? "",
    description: u.company_description ?? u.description ?? "",
    logo_url: u.logo_url ?? u.logo ?? "",
    status: u.status ?? "active",
    created_at: u.date_joined ?? null,
    updated_at: u.updated_at ?? null,
  };
}

function roleToBadge(role: Role) {
  switch ((role || "").toLowerCase()) {
    case "admin":
      return "bg-red-100 text-red-700 border-red-200";
    case "entreprise":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "manager":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "user":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function statusToText(status?: CompanyStatus) {
  switch ((status || "").toLowerCase()) {
    case "active":
      return "text-green-600";
    case "inactive":
      return "text-red-600";
    case "pending":
      return "text-amber-600";
    default:
      return "text-gray-600";
  }
}

export default function EntrepriseProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { wrap, isBusy } = useLoading();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // form
  const [formUser, setFormUser] = useState<UserProfile | null>(null);
  const [formCompany, setFormCompany] = useState<CompanyProfile | null>(null);

  // raw backend payload (pour mapper dynamiquement les noms de champs)
  const [userRaw, setUserRaw] = useState<any>(null);

  // password
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  // ---------- Guards d'accès ----------
  useEffect(() => {
    if (authLoading) return;
    const r = (user?.role || "").toLowerCase();
    if (!user) {
      router.replace("/admin-login");
      return;
    }
    if (!["entreprise", "admin"].includes(r)) {
      toast.error("Accès refusé : réservé aux comptes entreprise.");
      router.replace("/admin-login");
      return;
    }
  }, [user, authLoading, router]);

  // ---------- Chargement ----------
  useEffect(() => {
    if (authLoading || !user) return;

    (async () => {
      setLoading(true);
      try {
        await wrap(async () => {
          const uRes = await fetchWithAdminAuth(`${API}/users/${user.id}/`);
          if (!uRes.ok) throw new Error(`Erreur utilisateur ${uRes.status}`);
          const uData = await uRes.json();
          setUserRaw(uData);

          const up: UserProfile = {
            id: uData.id,
            username: uData.username ?? user.username ?? "",
            email: uData.email ?? user.email ?? "",
            role: (uData.role || user.role || "entreprise") as Role,
            status: (uData.status || "active") as CompanyStatus,
            date_joined: uData.date_joined ?? null,
            last_login: uData.last_login ?? null,
          };
          setUserProfile(up);

          const c = extractCompanyFromUser(uData, up.email);
          setCompany(c);
          setFormUser(up);
          setFormCompany(c);
        }, "Chargement du profil entreprise…");
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || "Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, wrap]);

  const canSave = useMemo(() => !!formUser && !!formCompany, [formUser, formCompany]);

  // ---------- Sauvegarde (PATCH /users/:id/) ----------
  const saveProfile = async () => {
    if (!formUser || !formCompany) return;
    setSaving(true);

    try {
      await wrap(async () => {
        const body: Record<string, any> = {
          username: formUser.username,
          email: formUser.email,
        };

        // Mappe dynamiquement les champs entreprise vers les clés existantes du backend
        if (userRaw) {
          const add = (cands: string[], val: any) => {
            const key = pickKey(userRaw, cands);
            if (key) body[key] = val;
          };
          add(["company_name", "entreprise_nom", "nom_entreprise", "company", "entreprise"], formCompany.nom);
          add(["company_email", "email_contact"], formCompany.email_contact);
          add(["phone", "telephone", "company_phone"], formCompany.telephone);
          add(["address", "adresse", "company_address"], formCompany.adresse);
          add(["website", "site_web", "company_website"], formCompany.site_web);
          add(["company_description", "description"], formCompany.description);
          add(["logo_url", "logo", "company_logo"], formCompany.logo_url);
          add(["status", "account_status"], formCompany.status);
        }

        const uRes = await fetchWithAdminAuth(`${API}/users/${formUser.id}/`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        if (!uRes.ok) {
          const t = await uRes.text().catch(() => "");
          throw new Error(`Erreur utilisateur ${uRes.status} ${t}`);
        }
      }, "Enregistrement du profil…");

      setUserProfile(formUser);
      setCompany(formCompany);
      setEditing(false);
      toast.success("Profil mis à jour");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Mot de passe ----------
  const changePassword = async () => {
    if (!userProfile) return;

    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Tous les champs sont requis");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    setChangingPwd(true);
    try {
      await wrap(async () => {
        const res = await fetchWithAdminAuth(
          `${API}/users/${userProfile.id}/change-password/`,
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
      setChangingPwd(false);
    }
  };

  // ---------- Rendu ----------
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
        <div className="text-center">
          {!isBusy && (
            <div className="mx-auto mb-4">
              <Spinner size={48} />
            </div>
          )}
          <p className="text-gray-600 font-medium">
            Chargement du profil entreprise...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile || !company || !formUser || !formCompany) {
    return (
      <div className="p-8 text-center bg-yellow-50 border border-yellow-200 rounded-xl">
        <Icons.AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-yellow-700">
          Impossible de charger les données du compte entreprise.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900">
          <Icons.Building2 className="w-7 h-7 text-emerald-600" />
          Profil entreprise
        </h1>

        <div className="flex gap-3">
          {editing ? (
            <>
              <button
                onClick={saveProfile}
                disabled={!canSave || saving}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-slate-800 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  !isBusy ? (
                    <Spinner size={16} />
                  ) : (
                    <Icons.Save className="w-4 h-4" />
                  )
                ) : (
                  <Icons.Save className="w-4 h-4" />
                )}
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormUser(userProfile);
                  setFormCompany(company);
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
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
            >
              <Icons.Edit3 className="w-4 h-4" />
              Modifier
            </button>
          )}
        </div>
      </div>

      {/* Carte d'identité */}
      <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 text-gray-600">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden">
                {formCompany.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formCompany.logo_url}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Icons.Image className="w-7 h-7 text-emerald-600" />
                )}
              </div>
              <div>
                {editing ? (
                  <input
                    value={formCompany.nom}
                    onChange={(e) =>
                      setFormCompany({ ...formCompany, nom: e.target.value })
                    }
                    className="text-2xl font-bold mb-1 w-full border-2 border-gray-200 rounded-lg p-2 focus:border-emerald-500 focus:outline-none bg-white"
                  />
                ) : (
                  <h2 className="text-2xl font-bold mb-1">
                    {company.nom || "(sans nom)"}
                  </h2>
                )}

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${roleToBadge(
                      userProfile.role
                    )} bg-white/90`}
                  >
                    <Icons.Shield className="w-4 h-4 inline mr-1" />
                    {userProfile.role || "entreprise"}
                  </span>
                  <span
                    className={`text-sm font-medium ${statusToText(
                      company.status
                    )}`}
                  >
                    • {company.status || "active"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-500">Membre depuis</p>
                <p className="font-semibold text-gray-900">
                  {new Date(
                    userProfile.date_joined || Date.now()
                  ).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              {userProfile.last_login && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-500">Dernière connexion</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(userProfile.last_login).toLocaleString("fr-FR")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Infos principales */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Col gauche */}
          <div className="space-y-6">
            {/* Email de compte (User) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Icons.Mail className="w-5 h-5 text-blue-500" />
                Email de connexion
              </label>
              {editing ? (
                <input
                  type="email"
                  value={formUser.email}
                  onChange={(e) =>
                    setFormUser({ ...formUser, email: e.target.value })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-emerald-500 focus:outline-none bg-white"
                  placeholder="pro@votre-domaine.com"
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <p className="text-gray-900 font-medium">{userProfile.email}</p>
                </div>
              )}
            </div>

            {/* Email de contact (Entreprise) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Icons.AtSign className="w-5 h-5 text-emerald-500" />
                Email de contact
              </label>
              {editing ? (
                <input
                  type="email"
                  value={formCompany.email_contact || ""}
                  onChange={(e) =>
                    setFormCompany({
                      ...formCompany,
                      email_contact: e.target.value,
                    })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-emerald-500 focus:outline-none bg-white"
                  placeholder="contact@entreprise.com"
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <p className="text-gray-900 font-medium">
                    {company.email_contact || "—"}
                  </p>
                </div>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Icons.Phone className="w-5 h-5 text-emerald-500" />
                Téléphone
              </label>
              {editing ? (
                <input
                  value={formCompany.telephone || ""}
                  onChange={(e) =>
                    setFormCompany({
                      ...formCompany,
                      telephone: e.target.value,
                    })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-emerald-500 focus:outline-none bg-white"
                  placeholder="(+261) ..."
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <p className="text-gray-900 font-medium">
                    {company.telephone || "—"}
                  </p>
                </div>
              )}
            </div>

            {/* Logo URL (texte) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Icons.Image className="w-5 h-5 text-emerald-500" />
                Logo (URL)
              </label>
              {editing ? (
                <input
                  value={formCompany.logo_url || ""}
                  onChange={(e) =>
                    setFormCompany({ ...formCompany, logo_url: e.target.value })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-emerald-500 focus:outline-none bg-white"
                  placeholder="https://.../logo.png"
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <p className="text-gray-900 font-medium truncate">
                    {company.logo_url || "—"}
                  </p>
                </div>
              )}
              {/* Pour un upload de fichier : utiliser un endpoint multipart côté API */}
            </div>
          </div>

          {/* Col droite */}
          <div className="space-y-6">
            {/* Adresse */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Icons.MapPin className="w-5 h-5 text-emerald-500" />
                Adresse
              </label>
              {editing ? (
                <textarea
                  rows={3}
                  value={formCompany.adresse || ""}
                  onChange={(e) =>
                    setFormCompany({ ...formCompany, adresse: e.target.value })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-emerald-500 focus:outline-none bg-white"
                  placeholder="Adresse complète"
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 min-h-[44px]">
                  <p className="text-gray-900 font-medium whitespace-pre-line">
                    {company.adresse || "—"}
                  </p>
                </div>
              )}
            </div>

            {/* Site web */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Icons.Globe className="w-5 h-5 text-emerald-500" />
                Site web
              </label>
              {editing ? (
                <input
                  value={formCompany.site_web || ""}
                  onChange={(e) =>
                    setFormCompany({ ...formCompany, site_web: e.target.value })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-emerald-500 focus:outline-none bg-white"
                  placeholder="https://votre-entreprise.mg"
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <p className="text-gray-900 font-medium truncate">
                    {company.site_web || "—"}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Icons.FileText className="w-5 h-5 text-emerald-500" />
                Description
              </label>
              {editing ? (
                <textarea
                  rows={4}
                  value={formCompany.description || ""}
                  onChange={(e) =>
                    setFormCompany({
                      ...formCompany,
                      description: e.target.value,
                    })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-emerald-500 focus:outline-none bg-white"
                  placeholder="Décrivez brièvement votre entreprise, vos services, etc."
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 min-h-[44px]">
                  <p className="text-gray-900 font-medium whitespace-pre-line">
                    {company.description || "—"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sécurité du compte */}
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-2 px-5 text-white">
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
                      type={showOld ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-emerald-500 focus:outline-none"
                      placeholder="Mot de passe actuel"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    >
                      {showOld ? (
                        <Icons.EyeOff className="w-5 h-5" />
                      ) : (
                        <Icons.Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                {/* Nouveau */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Icons.Lock className="w-4 h-4 text-green-500" />
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-emerald-500 focus:outline-none"
                      placeholder="Nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    >
                      {showNew ? (
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
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-emerald-500 focus:outline-none"
                      placeholder="Confirmer le mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirm ? (
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
                  disabled={changingPwd}
                  className="bg-blue-600 hover:bg-blue-800 text-white text-sm px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {changingPwd ? (
                    !isBusy ? (
                      <Spinner size={16} />
                    ) : (
                      <Icons.CheckCircle className="w-4 h-4" />
                    )
                  ) : (
                    <Icons.CheckCircle className="w-4 h-4" />
                  )}
                  {changingPwd ? "Modification..." : "Modifier le mot de passe"}
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

      <div className="text-xs text-gray-500 text-center">
        <p>
          💡 Tous les champs entreprise sont sauvegardés via <code>/api/users/:id/</code>.
          Seules les clés **existantes** dans votre serializer User sont envoyées.
        </p>
      </div>
    </div>
  );
}
