"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useState } from "react";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  UserPlus, 
  AlertCircle,
  Check,
  X
} from "lucide-react";

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Validation du mot de passe
  const passwordValidation = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  };

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== "";
  const isFormValid = Object.values(passwordValidation).every(Boolean) && passwordsMatch && formData.name.trim() && formData.email.trim();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validation côté client
      if (!formData.name.trim()) {
        setError("Le nom est requis.");
        return;
      }

      if (!formData.email.trim()) {
        setError("L'email est requis.");
        return;
      }

      if (!formData.password) {
        setError("Le mot de passe est requis.");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }

      if (!Object.values(passwordValidation).every(Boolean)) {
        setError("Veuillez respecter tous les critères de sécurité du mot de passe.");
        return;
      }

      // Tentative d'inscription
      await register(formData.name.trim(), formData.email.trim(), formData.password);
      router.push("/calculate");
      
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      setError(error?.message || "Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationIcon = ({ isValid }: { isValid: boolean }) => (
    isValid ? (
      <Check className="w-4 h-4 text-emerald-500" />
    ) : (
      <X className="w-4 h-4 text-red-400" />
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      <main className="relative z-10 pt-10 flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <div className="w-full max-w-xl px-6">
          {/* Carte principale avec effet glassmorphism */}
          <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
            {/* En-tête avec icône */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Inscription
              </h2>
            </div>

            {/* Message d'erreur amélioré */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom et Email sur la même ligne */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nom
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-5 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-5 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                      placeholder="email@domaine.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Mot de passe et Confirmation sur la même ligne */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Mot de passe
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-5 pr-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Confirmation
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-5 pr-5 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 ${
                        formData.confirmPassword
                          ? passwordsMatch
                            ? "border-emerald-200 focus:ring-emerald-500/20 focus:border-emerald-500"
                            : "border-red-200 focus:ring-red-500/20 focus:border-red-500"
                          : "border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-500"
                      }`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Indicateurs de validation du mot de passe */}
              {formData.password && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Critères de sécurité :</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <ValidationIcon isValid={passwordValidation.length} />
                      <span className={passwordValidation.length ? "text-emerald-600" : "text-gray-500"}>
                        8 caractères minimum
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ValidationIcon isValid={passwordValidation.uppercase} />
                      <span className={passwordValidation.uppercase ? "text-emerald-600" : "text-gray-500"}>
                        Une majuscule
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ValidationIcon isValid={passwordValidation.lowercase} />
                      <span className={passwordValidation.lowercase ? "text-emerald-600" : "text-gray-500"}>
                        Une minuscule
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ValidationIcon isValid={passwordValidation.number} />
                      <span className={passwordValidation.number ? "text-emerald-600" : "text-gray-500"}>
                        Un chiffre
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ValidationIcon isValid={passwordValidation.special} />
                      <span className={passwordValidation.special ? "text-emerald-600" : "text-gray-500"}>
                        Un caractère spécial
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ValidationIcon isValid={passwordsMatch} />
                      <span className={passwordsMatch ? "text-emerald-600" : "text-gray-500"}>
                        Mots de passe identiques
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton d'inscription */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Inscription en cours...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Créer mon compte
                  </>
                )}
              </button>
            </form>

            {/* Lien de connexion */}
            <div className="mt-8 text-center text-sm">
              <p className="text-gray-600">
                Déjà un compte ?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>

          {/* Indicateur de sécurité */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 font-medium">
                Inscription sécurisée
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}