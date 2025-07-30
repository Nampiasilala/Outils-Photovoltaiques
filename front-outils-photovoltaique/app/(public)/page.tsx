import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">      
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white pt-20 pb-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                Outil de Dimensionnement 
                <span className="block text-cyan-300">Photovoltaïque</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg lg:text-xl text-blue-100 leading-relaxed">
                Planifiez votre installation solaire autonome avec notre outil simple et précis.
                Connectez-vous ou inscrivez-vous pour commencer votre transition énergétique.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-blue-600 
                           rounded-2xl text-base sm:text-lg font-semibold hover:bg-blue-50 transition-all duration-300
                           shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 
                           text-white rounded-2xl text-base sm:text-lg font-semibold hover:from-cyan-600 hover:to-blue-600 
                           transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
                           border border-cyan-400/30"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  S'inscrire
                </Link>
              </div>
            </div>
            
            {/* Illustration */}
            <div className="hidden lg:block lg:w-1/2 lg:pl-12">
              <div className="relative">
                <div className="w-80 h-80 mx-auto">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Solar Panel */}
                    <defs>
                      <linearGradient id="solarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#1E40AF" />
                      </linearGradient>
                    </defs>
                    <rect x="50" y="60" width="100" height="60" rx="5" fill="url(#solarGradient)" />
                    <g stroke="#1E293B" strokeWidth="1" opacity="0.3">
                      <line x1="70" y1="60" x2="70" y2="120" />
                      <line x1="90" y1="60" x2="90" y2="120" />
                      <line x1="110" y1="60" x2="110" y2="120" />
                      <line x1="130" y1="60" x2="130" y2="120" />
                      <line x1="50" y1="80" x2="150" y2="80" />
                      <line x1="50" y1="100" x2="150" y2="100" />
                    </g>
                    
                    {/* Sun */}
                    <circle cx="40" cy="40" r="15" fill="#FCD34D" className="animate-pulse" />
                    <g stroke="#FCD34D" strokeWidth="2" className="animate-spin" style={{transformOrigin: '40px 40px', animationDuration: '8s'}}>
                      <line x1="40" y1="15" x2="40" y2="20" />
                      <line x1="40" y1="60" x2="40" y2="65" />
                      <line x1="15" y1="40" x2="20" y2="40" />
                      <line x1="60" y1="40" x2="65" y2="40" />
                      <line x1="23" y1="23" x2="26" y2="26" />
                      <line x1="54" y1="54" x2="57" y2="57" />
                      <line x1="23" y1="57" x2="26" y2="54" />
                      <line x1="54" y1="26" x2="57" y2="23" />
                    </g>
                    
                    {/* Energy Flow */}
                    <g className="animate-pulse">
                      <circle cx="100" cy="140" r="3" fill="#10B981" />
                      <circle cx="110" cy="150" r="2" fill="#10B981" opacity="0.7" />
                      <circle cx="90" cy="150" r="2" fill="#10B981" opacity="0.7" />
                      <circle cx="100" cy="160" r="4" fill="#10B981" />
                    </g>
                    
                    {/* House */}
                    <polygon points="70,180 130,180 130,160 100,140 70,160" fill="#64748B" />
                    <rect x="85" y="165" width="8" height="15" fill="#FCD34D" />
                    <rect x="107" y="165" width="8" height="15" fill="#FCD34D" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Features Section */}
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
              Pourquoi utiliser notre 
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> outil ?</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Notre application vous guide pour dimensionner une installation photovoltaïque
              autonome, en évitant les erreurs de surdimensionnement ou sous-dimensionnement.
              Accessible à tous, elle fournit des résultats fiables pour votre projet solaire.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl 
                          transition-all duration-300 hover:scale-105 border border-blue-100/50">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl 
                            flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Calcul Précis</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Algorithmes avancés pour un dimensionnement optimal de votre installation solaire.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl 
                          transition-all duration-300 hover:scale-105 border border-blue-100/50">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl 
                            flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Simple d'Utilisation</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Interface intuitive accessible à tous, aucune expertise technique requise.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl 
                          transition-all duration-300 hover:scale-105 border border-blue-100/50">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl 
                            flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Résultats Fiables</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Basé sur des données météorologiques réelles et des standards de l'industrie.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-12 text-white">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">
              Prêt à commencer votre projet solaire ?
            </h3>
            <p className="text-sm sm:text-base text-blue-100 mb-6 sm:mb-8">
              Rejoignez des milliers d'utilisateurs qui ont fait confiance à notre outil.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-blue-600 
                       rounded-2xl text-base sm:text-lg font-semibold hover:bg-blue-50 transition-all duration-300
                       shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Commencer maintenant
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}