"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useLoading, Spinner } from "@/LoadingProvider"; // loader centralisé

// Icônes en import dynamique
const Eye = dynamic(() => import("lucide-react").then((m) => m.Eye));
const EyeOff = dynamic(() => import("lucide-react").then((m) => m.EyeOff));
const Mail = dynamic(() => import("lucide-react").then((m) => m.Mail));
const Lock = dynamic(() => import("lucide-react").then((m) => m.Lock));
const LogIn = dynamic(() => import("lucide-react").then((m) => m.LogIn));
const AlertCircle = dynamic(() => import("lucide-react").then((m) => m.AlertCircle));
const CheckCircle = dynamic(() => import("lucide-react").then((m) => m.CheckCircle));
const HomeIcon = dynamic(() => import("lucide-react").then((m) => m.Home));

interface LoginFormData {
  email: string;
  password: string;
}
type ValidationErrors = Partial<Record<keyof LoginFormData, string>>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { admin, login, loading: authLoading } = useAuth();
  const { wrap, isBusy } = useLoading();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<ValidationErrors>({});

  // 👉 Bloque l'affichage si admin déjà connecté
  useEffect(() => {
    if (admin && !authLoading) {
      router.replace("/admin");
    }
  }, [admin, authLoading, router]);

  const validateForm = () => {
    const newErrors: ValidationErrors = {};
    if (!formData.email) newErrors.email = "L'adresse email est requise";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Format d'email invalide";

    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    else if (formData.password.length < 6) newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (authLoading || isLoading) return;

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
      await wrap(() => login(formData.email, formData.password), "Connexion…");

      toast.success(
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span className="text-sm text-green-700">Connecté avec succès !</span>
        </div>,
        { className: "bg-green-50 border border-green-200 rounded-xl shadow-md p-4 backdrop-blur-sm", icon: false }
      );

      setTimeout(() => router.replace("/admin"), 600);
    } catch (err) {
      console.error("Erreur de connexion:", err);
      const msg = err instanceof Error ? err.message : "";

      toast.error(
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">
            {msg === "ADMIN_ONLY"
              ? "Accès refusé. Seuls les administrateurs peuvent se connecter."
              : "Identifiants incorrects. Veuillez réessayer."}
          </span>
        </div>,
        { className: "bg-red-50 border border-red-200 rounded-xl shadow-md p-4 backdrop-blur-sm", icon: false }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 👉 Masque tout si admin déjà connecté
  if (authLoading || admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {!isBusy && <Spinner size={48} />}
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Bouton de retour à l'accueil */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-md text-gray-800 rounded-full shadow-md hover:bg-white transition-all duration-200 text-sm sm:text-base"
        >
          <HomeIcon className="w-4 h-4 mr-2" />
          Accueil
        </Link>
      </div>

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8 transform hover:scale-[1.02] transition-all duration-300">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-3 sm:mb-4 shadow-lg">
                <LogIn className="w-7 h-7 sm:w-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Connexion (Admin)
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2 text-sm">
                <label htmlFor="email" className="block font-semibold text-gray-700">
                  Adresse email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="exemple@domaine.com"
                    autoComplete="email"
                    className={`w-full pl-9 pr-4 py-2.5 sm:py-3 border rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm ${
                      errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-emerald-500"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2 text-sm">
                <label htmlFor="password" className="block font-semibold text-gray-700">
                  Mot de passe
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full pl-9 pr-12 py-2.5 sm:py-3 border rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm ${
                      errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-emerald-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || authLoading}
                aria-busy={isLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 text-base"
              >
                {isLoading && !isBusy ? <Spinner size={20} /> : <LogIn className="w-5 h-5" />}
                {isLoading || isBusy ? "Connexion en cours..." : "Se connecter"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
