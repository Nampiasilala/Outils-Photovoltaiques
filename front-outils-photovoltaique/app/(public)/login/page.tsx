'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Si déjà connecté, redirige vers /calculate
  useEffect(() => {
    if (user) {
      router.replace('/calculate');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      // login() redirige vers /calculate via AuthContext
    } catch {
      setError('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Connexion
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="exemple@domaine.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
          <Link href="/forgot-password" className="text-indigo-600 hover:underline">
            Mot de passe oublié ?
          </Link>
          <Link href="/register" className="text-indigo-600 hover:underline">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
