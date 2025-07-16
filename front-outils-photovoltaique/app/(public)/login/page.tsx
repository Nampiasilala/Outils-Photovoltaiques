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
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-md">
          {/* Carte glass */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 transform hover:scale-[1.02] transition-all duration-300">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Connexion
              </h2>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2 text-sm">
                <label className="block font-semibold text-gray-700">
                  Adresse email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="exemple@domaine.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2 text-sm">
                <label className="block font-semibold text-gray-700">
                  Mot de passe
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
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

              {/* Bouton */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </form>

            {/* Liens */}
            <div className="mt-8 flex justify-between text-sm">
              <Link
                href="/forgot-password"
                className="text-indigo-600 hover:text-cyan-600 transition-colors"
              >
                Mot de passe oublié ?
              </Link>
              <Link
                href="/register"
                className="font-semibold text-indigo-600 hover:text-blue-700 transition-colors hover:underline"
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
