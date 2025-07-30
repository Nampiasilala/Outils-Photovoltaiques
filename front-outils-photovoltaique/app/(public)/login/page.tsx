'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  CheckCircle,
  Home as HomeIcon // Renommé pour éviter le conflit avec la page Home
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/calculate');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    if (!email || !password) {
      toast.error(
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">
            Veuillez remplir tous les champs.
          </span>
        </div>,
        {
          className:
            'bg-red-50 border border-red-200 rounded-xl shadow-md p-4 backdrop-blur-sm',
          icon: false,
        }
      );
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);

      toast.success(
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span className="text-sm text-green-700">
            Connecté avec succès !
          </span>
        </div>,
        {
          className:
            'bg-green-50 border border-green-200 rounded-xl shadow-md p-4 backdrop-blur-sm',
          icon: false,
        }
      );

      // Laissez un bref moment pour que le toast s’affiche
      setTimeout(() => {
        router.replace('/calculate');
      }, 600);
    } catch {
      toast.error(
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">
            Identifiants incorrects. Veuillez réessayer.
          </span>
        </div>,
        {
          className:
            'bg-red-50 border border-red-200 rounded-xl shadow-md p-4 backdrop-blur-sm',
          icon: false,
        }
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Bouton de retour à l'accueil en haut à gauche */}
      <div className="absolute top-4 left-4 z-20">
        <Link 
          href="/" 
          className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-md text-gray-800 rounded-full 
                     shadow-md hover:bg-white transition-all duration-200 text-sm sm:text-base"
        >
          <HomeIcon className="w-4 h-4 mr-2" />
          Accueil
        </Link>
      </div>

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-8">
        <div className="w-full max-w-md">
          {/* Carte glass */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8 transform hover:scale-[1.02] transition-all duration-300">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-3 sm:mb-4 shadow-lg">
                <LogIn className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Connexion
              </h2>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Email */}
              <div className="space-y-1.5 sm:space-y-2 text-sm">
                <label htmlFor="email" className="block font-semibold text-gray-700">
                  Adresse email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    id="email" // Ajout de l'ID pour l'accessibilité
                    name="email"
                    required
                    placeholder="exemple@domaine.com"
                    className="w-full pl-9 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-1.5 sm:space-y-2 text-sm">
                <label htmlFor="password" className="block font-semibold text-gray-700">
                  Mot de passe
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password" // Ajout de l'ID pour l'accessibilité
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-12 py-2.5 sm:py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 text-base"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </form>

            {/* Liens supplémentaires */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm gap-2 sm:gap-0">
              <Link
                href="/forgot-password"
                className="text-indigo-600 hover:text-cyan-600 transition-colors whitespace-nowrap"
              >
                Mot de passe oublié ?
              </Link>
              <Link
                href="/register"
                className="font-semibold text-indigo-600 hover:text-blue-700 transition-colors hover:underline whitespace-nowrap"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}