import Link from "next/link";
import { Icons } from "../src/assets/icons"; // Adjust the import path as necessary


import Image from "next/image";

export default function HomePage() {
  const features = [
    {
      icon: Icons.Zap,
      title: "Calcul précis",
      description:
        "Algorithme professionnel prenant en compte tous les paramètres : consommation, autonomie, irradiation solaire locale.",
      color: "from-blue-50 to-blue-100 border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      icon: Icons.Globe,
      title: "Données locales",
      description:
        "Irradiation solaire automatique basée sur votre localisation grâce aux données satellite NASA.",
      color: "from-green-50 to-green-100 border-green-200",
      iconColor: "text-green-600",
    },
    {
      icon: Icons.Download,
      title: "Rapport PDF",
      description:
        "Téléchargez un rapport détaillé avec tous les calculs, équipements recommandés et coûts estimés.",
      color: "from-purple-50 to-purple-100 border-purple-200",
      iconColor: "text-purple-600",
    },
  ];

  const stats = [
    { label: "Calculs effectués", value: "100+", icon: Icons.Calculator },
    { label: "Testeurs satisfaits", value: "95%", icon: Icons.Star },
    { label: "Équipements référencés", value: "20+", icon: Icons.Zap },
  ];

  const steps = [
    {
      step: "1",
      title: "Renseignez vos besoins",
      description:
        "Indiquez votre consommation journalière et vos contraintes d'installation",
    },
    {
      step: "2",
      title: "Précisez votre localisation",
      description:
        "L'irradiation solaire sera calculée automatiquement pour votre région",
    },
    {
      step: "3",
      title: "Obtenez vos résultats",
      description:
        "Dimensions, équipements recommandés et coûts estimés instantanément",
    },
    {
      step: "4",
      title: "Téléchargez le rapport",
      description:
        "Rapport PDF complet pour votre installateur ou votre projet",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-10 h-10">
                <Image
                  src="/logo.png" // chemin relatif à /public
                  alt="Logo"
                  width={40}
                  height={40}
                />
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Calculateur Solaire
                </h1>
                <p className="text-xs text-gray-600 hidden sm:block">
                  Dimensionnement photovoltaïque
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/calculate"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Icons.Calculator className="w-4 h-4" />
                Calculer
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-16 md:py-18 text-center">
          <div className="inline-flex items-center justify-center  mb-8 ">
            <Image
              src="/logo.png" // chemin relatif à /public
              alt="Logo"
              width={200}
              height={200}
            />
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Dimensionnez votre
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              installation solaire
            </span>
          </h2>

          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Calculez facilement la puissance, le nombre de panneaux et batteries
            nécessaires pour votre installation photovoltaïque autonome.{" "}
            <strong className="text-gray-900">
              Gratuit et sans inscription.
            </strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/calculate"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              <Icons.Calculator className="w-6 h-6" />
              Commencer le calcul
              <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icons.CheckCircle className="w-4 h-4 text-green-600" />
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
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
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
              Une solution complète et professionnelle pour dimensionner votre
              installation solaire
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${feature.color} rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-md mb-6`}
                >
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
          <div className="bg-gradient-to-r from-blue-400 to-indigo-600 rounded-2xl p-8 md:p-16 text-center text-white shadow-2xl">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à calculer votre installation ?
            </h3>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Notre calculateur vous donnera une estimation complète en quelques
              minutes. Commencez dès maintenant, c&apos;est gratuit et sans
              engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/calculate"
                className="group inline-flex items-center gap-3 bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <Icons.Calculator className="w-6 h-6" />
                Lancer le calculateur
                <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex items-center gap-2 text-blue-100">
                <Icons.CheckCircle className="w-5 h-5" />
                <span>Résultats instantanés</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Colonne 1 : Logo + Copyright */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="inline-flex items-center justify-center w-10 h-10 ">
                <Image
                  src="/logo.png" // chemin relatif à /public
                  alt="Logo"
                  width={40}
                  height={40}
                />{" "}
              </div>
              <p className="text-gray-600 text-sm text-center md:text-left">
                © {new Date().getFullYear()} Calculateur Solaire. <br />
                Tous droits réservés.
              </p>
            </div>

            {/* Colonne 2 : Navigation */}
            <div className="flex flex-col items-center space-y-3">
              <h4 className="text-gray-900 font-semibold text-lg">
                Navigation
              </h4>
              <Link
                href="/calculate"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Calculateur
              </Link>
              <Link
                href="/admin-login"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Icons.Shield className="w-4 h-4" />
                Voir plus
              </Link>
            </div>

            {/* Colonne 3 : Contact & Réseaux */}
            <div className="flex flex-col items-center md:items-end space-y-4">
              <h4 className="text-gray-900 font-semibold text-lg">Contact</h4>
              <a
                href="mailto:nampiasilala@gmail.com"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Icons.Mail className="w-4 h-4" />
                nampiasilala@gmail.com
              </a>
              <div className="flex space-x-3">
                <a
                  href="https://facebook.com/"
                  target="_blank"
                  className="p-2 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors"
                >
                  <Icons.Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com/"
                  target="_blank"
                  className="p-2 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-sky-500 hover:border-sky-500 transition-colors"
                >
                  <Icons.Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com/"
                  target="_blank"
                  className="p-2 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-pink-500 hover:border-pink-500 transition-colors"
                >
                  <Icons.Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
