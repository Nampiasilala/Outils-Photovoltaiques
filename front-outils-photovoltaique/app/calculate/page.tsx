// app/calculate/page.tsx
"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Sun, Shield, Home } from "lucide-react";
import { Spinner } from "@/LoadingProvider";

// ⬇️ import dynamique avec spinner de fallback
const PublicSolarCalculator = dynamic(
  () => import("@/components/PublicSolarCalculator"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-16">
        <Spinner size={28} />
        <span className="ml-3 text-slate-600">Chargement du calculateur…</span>
      </div>
    ),
  }
);

export default function CalculatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Bouton retour */}
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Retour à l'accueil</span>
                <Home className="w-4 h-4 sm:hidden" />
              </Link>

              {/* Logo et titre */}
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md">
                  <Sun className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Calculateur Solaire</h1>
                  <p className="text-xs text-gray-600 hidden sm:block">Dimensionnement photovoltaïque</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/admin-login"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Administration</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête de la page */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Calculateur de Dimensionnement
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Renseignez vos besoins énergétiques pour obtenir le dimensionnement optimal 
            de votre installation photovoltaïque autonome
          </p>
        </div>

        {/* Calculateur (spinner affiché pendant le chargement grâce au fallback ci-dessus) */}
        <PublicSolarCalculator />

        {/* Info complémentaire */}
        <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Besoin d'aide avec votre projet ?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Ce calculateur vous donne une estimation pour vous aider à planifier votre installation. 
              Pour une étude détaillée, nous recommandons de consulter un professionnel certifié.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">📊</div>
                <h4 className="font-semibold text-gray-900 mb-1">Estimation précise</h4>
                <p className="text-sm text-gray-600">Calculs basés sur des données NASA et des algorithmes professionnels</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">📋</div>
                <h4 className="font-semibold text-gray-900 mb-1">Rapport détaillé</h4>
                <p className="text-sm text-gray-600">PDF complet avec tous les calculs et équipements recommandés</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">🔒</div>
                <h4 className="font-semibold text-gray-900 mb-1">Gratuit et privé</h4>
                <p className="text-sm text-gray-600">Aucune inscription, aucune donnée personnelle collectée</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer simplifié */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Sun className="w-5 h-5 text-blue-600" />
              <span className="text-gray-600">
                © 2024 Calculateur Solaire. Outil gratuit de dimensionnement photovoltaïque.
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Accueil
              </Link>
              <Link
                href="/admin-login"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Administration
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
