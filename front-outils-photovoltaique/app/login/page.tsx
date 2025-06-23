// app/login/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (email && password) {
      login(email, password);
      router.push("/calculate");
    } else {
      setError("Veuillez remplir tous les champs.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-20 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Connexion
          </h2>
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="exemple@domaine.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                type="password"
                name="password"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
            >
              Se connecter
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Pas de compte ?{" "}
            <Link href="/register" className="text-green-600 hover:underline">
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}