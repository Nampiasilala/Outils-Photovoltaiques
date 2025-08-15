// app/page.tsx - Page d'accueil publique simplifiée (remplace l'ancienne)
"use client";

import Link from "next/link";
import {
  Sun,
  Zap,
  Globe,
  Calculator,
  Download,
  Shield,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function HomePage() {
  const features = [
    {
      icon: Zap,
      title: "Calcul précis",
      description: "Algorithme professionnel prenant en compte tous les paramètres : consommation, autonomie, irradiation solaire locale.",
      color: "from-blue-50 to-blue-100 border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      icon: Globe,
      title: "Données locales",
      description: "Irradiation solaire automatique basée sur votre localisation grâce aux données satellite NASA.",
      color: "from-green-50 to-green-100 border-green-200",
      iconColor: "text-green-600",
    },
    {
      icon: Download,
      title: "Rapport PDF",
      description: "Téléchargez un rapport détaillé avec tous les calculs, équipements recommandés et coûts estimés.",
      color: "from-purple-50 to-purple-100 border-purple-200",
      iconColor: "text-purple-600",
    },
  ];

  const stats = [
    { label: "Calculs effectués", value: "10,000+", icon: Calculator },
    { label: "Utilisateurs satisfaits", value: "95%", icon: Star },
    { label: "Équipements référencés", value: "500+", icon: Zap },
  ];

  const steps = [
    {
      step: "1",
      title: "Renseignez vos besoins",
      description: "Indiquez votre consommation journalière et vos contraintes d'installation",
    },
    {
      step: "2",
      title: "Précisez votre localisation",
      description: "L'irradiation solaire sera calculée automatiquement pour votre région",
    },
    {
      step: "3",
      title: "Obtenez vos résultats",
      description: "Dimensions, équipements recommandés et coûts estimés instantanément",
    },
    {
      step: "4",
      title: "Téléchargez le rapport",
      description: "Rapport PDF complet pour votre installateur ou votre projet",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Calculateur Solaire</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Dimensionnement photovoltaïque</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/calculate"
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Calculator className="w-4 h-4" />
                Calculer
              </Link>
              <Link
                href="/admin/login"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Administration</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-16 md:py-24 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-8 shadow-2xl">
            <Sun className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Dimensionnez votre
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              installation solaire
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Calculez facilement la puissance, le nombre de panneaux et batteries nécessaires 
            pour votre installation photovoltaïque autonome. 
            <strong className="text-gray-900">Gratuit et sans inscription.</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/calculate"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              <Calculator className="w-6 h-6" />
              Commencer le calcul
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Aucune inscription requise</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-md mb-4">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir notre calculateur ?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une solution complète et professionnelle pour dimensionner votre installation solaire
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${feature.color} rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-md mb-6`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-16">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Obtenez votre dimensionnement en 4 étapes simples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-bold rounded-full shadow-lg mb-6">
                  {step.step}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {step.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-16 text-center text-white shadow-2xl">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à calculer votre installation ?
            </h3>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Notre calculateur vous donnera une estimation complète en quelques minutes.
              Commencez dès maintenant, c'est gratuit et sans engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/calculate"
                className="group inline-flex items-center gap-3 bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <Calculator className="w-6 h-6" />
                Lancer le calculateur
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle className="w-5 h-5" />
                <span>Résultats instantanés</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-gray-200 mt-16">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Sun className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-600">
                © 2024 Calculateur Solaire. Tous droits réservés.
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link
                href="/calculate"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Calculateur
              </Link>
              <Link
                href="/admin/login"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Interface Admin
              </Link>
            </div>
          </div>
        </footer>
      </main>
      
      {/* Toast container pour les notifications */}
      <ToastContainer 
        position="top-right" 
        pauseOnFocusLoss={false} 
        className="text-sm"
        theme="light"
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnHover
        draggable
      />
    </div>
  );
}