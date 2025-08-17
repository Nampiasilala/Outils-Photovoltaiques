// app/calculate/page.tsx
"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Spinner } from "@/LoadingProvider";
import { Icons } from "../../src/assets/icons"; // Ajuster si nécessaire

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
      {/* Header simplifié avec seulement le bouton de retour */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group"
          >
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Retour à l'accueil</span>
            <Icons.Home className="w-4 h-4 sm:hidden" />
          </Link>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête de la page */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Dimensionnement photovoltaïque
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Renseignez vos besoins énergétiques pour obtenir le dimensionnement
            optimal de votre installation photovoltaïque autonome.
          </p>
        </div>

        {/* Calculateur */}
        <PublicSolarCalculator />

        {/* Info complémentaire orientée collaboration / aide */}
        <div className="my-16 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Besoin d'accompagnement sur votre projet solaire ?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Ce calculateur vous fournit une estimation de votre installation. Pour un projet complet, nous pouvons vous aider avec des calculs plus complexes, le choix des équipements adaptés, ou même vous accompagner jusqu'à la réalisation concrète.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">📊</div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Estimation précise
                </h4>
                <p className="text-sm text-gray-600">
                  Calculs basés sur des données fiables et des algorithmes professionnels
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">🛠️</div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Assistance projet
                </h4>
                <p className="text-sm text-gray-600">
                  Aide pour le choix des équipements, calculs complexes, et accompagnement pour la réalisation
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">🔒</div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Gratuit et privé
                </h4>
                <p className="text-sm text-gray-600">
                  Aucune inscription, aucune donnée personnelle collectée
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
