"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { LogOut, Home } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20 pb-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-2xl p-8">
            {/* Header du profil */}
            <div className="flex items-center space-x-6 mb-6">
              <img
                src={user.avatar || "https://via.placeholder.com/150"}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-2 border-green-600"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Bienvenue, {"Utilisateur"}
                </h2>
                <p className="text-gray-600 text-sm">Utilisateur enregistré</p>
              </div>
            </div>

            {/* Informations de l'utilisateur */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-100 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Email</h4>
                <p className="text-gray-900 text-sm">{user.email}</p>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Changer mot de passe</h4>
                <p className="text-gray-900 text-sm">{"Non renseigné"}</p>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Date d'inscription</h4>
                <p className="text-gray-900 text-sm">{"Non disponible"}</p>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Statut</h4>
                <p className="text-gray-900 text-sm">Actif</p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </button>
              <button
                onClick={() => router.push("/login")}
                className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors flex-1"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
