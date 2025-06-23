import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <header className="bg-green-600 text-white pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Outil de Dimensionnement Photovoltaïque
          </h1>
          <p className="mt-4 text-lg">
            Planifiez votre installation solaire autonome avec notre outil simple et précis.
            Connectez-vous ou inscrivez-vous pour commencer.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-green-600 rounded-md text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md text-lg font-semibold hover:bg-green-700 transition-colors"
            >
              S’inscrire
            </Link>
          </div>
        </div>
      </header>
      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Pourquoi utiliser notre outil ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Notre application vous guide pour dimensionner une installation photovoltaïque
              autonome, en évitant les erreurs de surdimensionnement ou sous-dimensionnement.
              Accessible à tous, elle fournit des résultats fiables pour votre projet solaire.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}