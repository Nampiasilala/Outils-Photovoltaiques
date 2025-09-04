"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "react-toastify";
import { useLoading, Spinner } from "@/LoadingProvider";

// Icônes
const UserPlus = dynamic(() => import("lucide-react").then((m) => m.UserPlus));
const Mail = dynamic(() => import("lucide-react").then((m) => m.Mail));
const Lock = dynamic(() => import("lucide-react").then((m) => m.Lock));
const UserIcon = dynamic(() => import("lucide-react").then((m) => m.User));
const Phone = dynamic(() => import("lucide-react").then((m) => m.Phone));
const MapPin = dynamic(() => import("lucide-react").then((m) => m.MapPin));
const Globe = dynamic(() => import("lucide-react").then((m) => m.Globe));
const FileText = dynamic(() => import("lucide-react").then((m) => m.FileText));
const AlertCircle = dynamic(() => import("lucide-react").then((m) => m.AlertCircle));
const CheckCircle = dynamic(() => import("lucide-react").then((m) => m.CheckCircle));
const Eye = dynamic(() => import("lucide-react").then((m) => m.Eye));
const EyeOff = dynamic(() => import("lucide-react").then((m) => m.EyeOff));

// Lis la variable .env (ex: http://localhost:8000/api)
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
}
type ValidationErrors = Partial<Record<keyof RegisterFormData, string>>;

function extractErrorMessage(data: unknown, fallback = "Erreur d'inscription"): string {
  if (!data || typeof data !== "object") return fallback;
  const obj = data as Record<string, unknown>;
  if (typeof obj.detail === "string") return obj.detail;
  const vals = Object.values(obj);
  if (vals.length) {
    const first = vals[0];
    if (Array.isArray(first) && first.length) return String(first[0]);
    if (typeof first === "string") return first;
  }
  return fallback;
}

/** POST helper qui tente d'abord /users/register/, puis fallback /register/ */
async function registerRequest(payload: object) {
  if (!API_BASE_URL) {
    throw new Error("Configuration manquante : NEXT_PUBLIC_API_BASE_URL");
  }
  const endpoints = [
    `${API_BASE_URL}/users/register/`,
    `${API_BASE_URL}/register/`,
  ];

  let lastErr: Error | null = null;
  for (const url of endpoints) {
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const data: unknown = await resp.json().catch(() => null);
        throw new Error(extractErrorMessage(data));
      }
      return resp.json();
    } catch (e) {
      lastErr = e as Error;
    }
  }
  throw lastErr ?? new Error("Impossible d'appeler l'API d'inscription.");
}

export default function Page() {
  const { wrap, isBusy } = useLoading();

  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // ✅ état succès (affiche page blanche)

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    website: "",
    description: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const newErrors: ValidationErrors = {};
    if (!formData.username || formData.username.trim().length < 3) {
      newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }
    if (!formData.email) newErrors.email = "L'adresse email est requise";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Format d'email invalide";
    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    else if (formData.password.length < 6)
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirmez votre mot de passe";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    if (formData.website && !/^https?:\/\//i.test(formData.website))
      newErrors.website = "L'URL doit commencer par http:// ou https://";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error(
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">Veuillez corriger les erreurs dans le formulaire.</span>
        </div>,
        { className: "bg-red-50 border border-red-200 rounded-xl shadow-md p-4 backdrop-blur-sm", icon: false }
      );
      return;
    }

    setIsLoading(true);
    try {
      await wrap(
        () =>
          registerRequest({
            email: formData.email,
            username: formData.username,
            password: formData.password,
            role: "Entreprise",
            phone: formData.phone || undefined,
            address: formData.address || undefined,
            website: formData.website || undefined,
            description: formData.description || undefined,
          }),
        "Création du compte…"
      );

      // ✅ Pas de redirection, pas de toast : on passe en "page blanche + message"
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'inscription";
      toast.error(
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{msg}</span>
        </div>,
        { className: "bg-red-50 border border-red-200 rounded-xl shadow-md p-4 backdrop-blur-sm", icon: false }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Vue "page blanche" après succès
  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-600" />
          <p className="text-sm text-gray-700">
            Inscription réussie. Un administrateur activera votre compte.
          </p>
        </div>
      </div>
    );
  }

  // Formulaire (2 colonnes)
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-8">
        <div className="w-full max-w-3xl">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-3 sm:mb-4 shadow-lg">
                <UserPlus className="w-7 h-7 sm:w-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Créer un compte entreprise
              </h2>
              <p className="text-sm text-gray-600 mt-1">L'accès sera activé par un administrateur après vérification.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username / Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-sm">
                  <label htmlFor="username" className="block font-semibold text-gray-700">Nom d'utilisateur</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text" id="username" value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder="ex: societe_ak"
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-xl bg-white/50 focus:outline-none focus:ring-2 text-sm ${
                        errors.username ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-emerald-500"
                      }`}
                    />
                  </div>
                  {errors.username && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.username}</p>}
                </div>

                <div className="space-y-1.5 text-sm">
                  <label htmlFor="email" className="block font-semibold text-gray-700">Adresse email</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="email" id="email" value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="exemple@domaine.com" autoComplete="email"
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-xl bg-white/50 focus:outline-none focus:ring-2 text-sm ${
                        errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-emerald-500"
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                </div>
              </div>

              {/* Password / Confirmation (avec œil) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-sm">
                  <label htmlFor="password" className="block font-semibold text-gray-700">Mot de passe</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"} id="password" value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="••••••••" autoComplete="new-password"
                      className={`w-full pl-9 pr-12 py-2.5 border rounded-xl bg-white/50 focus:outline-none focus:ring-2 text-sm ${
                        errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-emerald-500"
                      }`}
                    />
                    <button
                      type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
                </div>

                <div className="space-y-1.5 text-sm">
                  <label htmlFor="confirmPassword" className="block font-semibold text-gray-700">Confirmation</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type={showConfirm ? "text" : "password"} id="confirmPassword" value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="••••••••" autoComplete="new-password"
                      className={`w-full pl-9 pr-12 py-2.5 border rounded-xl bg-white/50 focus:outline-none focus:ring-2 text-sm ${
                        errors.confirmPassword ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-emerald-500"
                      }`}
                    />
                    <button
                      type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showConfirm ? "Masquer la confirmation" : "Afficher la confirmation"}>
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Téléphone / Site web */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-sm">
                  <label htmlFor="phone" className="block font-semibold text-gray-700">Téléphone (optionnel)</label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text" id="phone" value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="ex: +261 34 12 345 67"
                      className="w-full pl-9 pr-4 py-2.5 border rounded-xl bg-white/50 focus:outline-none focus:ring-2 text-sm border-gray-200 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-sm">
                  <label htmlFor="website" className="block font-semibold text-gray-700">Site web (optionnel)</label>
                  <div className="relative group">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="url" id="website" value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://votre-site.com"
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-xl bg-white/50 focus:outline-none focus:ring-2 text-sm ${
                        errors.website ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-emerald-500"
                      }`}
                    />
                  </div>
                  {errors.website && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.website}</p>}
                </div>
              </div>

              {/* Adresse / Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-sm">
                  <label htmlFor="address" className="block font-semibold text-gray-700">Adresse (optionnel)</label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <textarea
                      id="address" value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Votre adresse complète"
                      className="w-full pl-9 pr-4 py-2.5 min-h-[100px] border rounded-xl bg-white/50 focus:outline-none focus:ring-2 text-sm border-gray-200 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-sm">
                  <label htmlFor="description" className="block font-semibold text-gray-700">Description (optionnel)</label>
                  <div className="relative group">
                    <FileText className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <textarea
                      id="description" value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Quelques mots sur votre entreprise"
                      className="w-full pl-9 pr-4 py-2.5 min-h-[100px] border rounded-xl bg-white/50 focus:outline-none focus:ring-2 text-sm border-gray-200 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit" disabled={isLoading} aria-busy={isLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-base"
              >
                {isLoading && !isBusy ? <Spinner size={20} /> : <UserPlus className="w-5 h-5" />}
                {isLoading || isBusy ? "Création en cours..." : "Créer mon compte"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
