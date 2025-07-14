// app/login/page.tsx
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
  LogIn,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

if (email && password) {
    try {
      await login(email, password);
      router.push("/calculate");
    } catch (error) {
      toast.error("Identifiants incorrects. Veuillez réessayer.");
    }
  } else {
    toast.error("Veuillez remplir tous les champs.");
  }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">

      <main className="relative z-10 pt-10 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md px-6">
          {/* Carte principale avec effet glassmorphism */}
          <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/20 transform hover:scale-[1.02] transition-all duration-300">
            {/* En-tête avec icône */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Connexion
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
              {/* Champ Email */}
              <div className="space-y-2 text-sm">
                <label className="block text-sm font-semibold text-gray-700">
                  Adresse email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    className="w-full pl-5 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                    placeholder="exemple@domaine.com"
                    required
                  />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div className="space-y-2 text-sm">
                <label className="block font-semibold text-gray-700">
                  Mot de passe
                </label>
                <div className="relative group text-sm">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="w-full pl-5 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Lien mot de passe oublié */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-indigo-600 from-blue-600 to-indigo-600 hover:text-cyan-600 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-sm flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            {/* Lien d'inscription */}
            <div className="mt-8 text-center text-sm">
              <p className="text-gray-600">
                <Link href={"/"} className="hover:text-red-500">
                  Retour à l'acceuil
                </Link>{" "}
                <Link
                  href="/register"
                  className="font-semibold text-indigo-600 hover:text-blue-700 transition-colors hover:underline"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>

          {/* Indicateur de sécurité */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 font-medium">
                Connexion sécurisée
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
