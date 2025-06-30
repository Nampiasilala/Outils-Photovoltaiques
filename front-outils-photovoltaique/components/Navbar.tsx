// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useAuth } from "./AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Effet de scroll pour navbar glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermer le menu mobile au clic extérieur
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) setIsMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link
      href={href}
      onClick={onClick}
      className="relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ease-out
                 hover:bg-white/15 hover:backdrop-blur-sm hover:shadow-lg hover:scale-105
                 active:scale-95 group overflow-hidden border border-transparent hover:border-white/20"
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/25 to-blue-400/25 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
    </Link>
  );

  const MobileNavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link
      href={href}
      onClick={onClick}
      className="block px-6 py-4 text-sm font-medium transition-all duration-200 ease-out
                 hover:bg-white/15 hover:pl-8 border-l-4 border-transparent hover:border-cyan-300"
    >
      {children}
    </Link>
  );

  return (
    <>
      <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ease-out ${
        scrolled 
          ? 'bg-gradient-to-r from-blue-600/95 to-indigo-600/95 backdrop-blur-md shadow-xl shadow-blue-900/20' 
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo avec animation */}
            <div className="flex-shrink-0">
              <Link href="/" className="group flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full 
                               flex items-center justify-center shadow-lg group-hover:shadow-xl 
                               transition-all duration-300 group-hover:scale-110">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"/>
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 
                                bg-clip-text text-transparent group-hover:from-cyan-200 
                                group-hover:to-white transition-all duration-300">
                  Solaire Autonome
                </span>
              </Link>
            </div>

            {/* Navigation desktop */}
            <div className="hidden lg:flex lg:items-center lg:space-x-2">
              {user ? (
                <>
                  <NavLink href="/calculate">
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span>Dimensionnement</span>
                    </span>
                  </NavLink>
                  <NavLink href="/parametre_systeme">
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Configuration</span>
                    </span>
                  </NavLink>
                  <NavLink href="/user_management">
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <span>Utilisateurs</span>
                    </span>
                  </NavLink>
                  <NavLink href="/profile">
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profil</span>
                    </span>
                  </NavLink>
                  <NavLink href="/history">
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Historique</span>
                    </span>
                  </NavLink>
                  <NavLink href="/technical">
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Fiche technique</span>
                    </span>
                  </NavLink>
                  
                  <div className="h-6 w-px bg-white/30 mx-2" />
                  
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium bg-rose-500/20 hover:bg-rose-500/30 
                               rounded-xl transition-all duration-300 ease-out hover:scale-105 
                               active:scale-95 border border-rose-400/30 hover:border-rose-400/50
                               flex items-center space-x-2 group shadow-lg hover:shadow-rose-500/20"
                  >
                    <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                <>
                  <NavLink href="/login">
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Connexion</span>
                    </span>
                  </NavLink>
                  <NavLink href="/register">
                    <span className="flex items-center space-x-2 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 
                                   border border-cyan-400/30 rounded-xl px-4 py-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Inscription</span>
                    </span>
                  </NavLink>
                </>
              )}
            </div>

            {/* Bouton menu mobile */}
            <div className="lg:hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className={`p-2 rounded-xl transition-all duration-300 ease-out hover:bg-white/15 
                           hover:scale-110 active:scale-95 border border-transparent hover:border-white/20 
                           ${isMenuOpen ? 'bg-white/15 rotate-180 border-white/20' : ''}`}
              >
                <svg
                  className="w-6 h-6 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile avec animation */}
        <div className={`lg:hidden transition-all duration-500 ease-out overflow-hidden ${
          isMenuOpen 
            ? 'max-h-screen opacity-100 backdrop-blur-md' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-gradient-to-b from-blue-700/98 to-indigo-700/98 backdrop-blur-md 
                         border-t border-white/20 shadow-2xl">
            {user ? (
              <div className="py-4 space-y-1">
                <MobileNavLink
                  href="/calculate"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Dimensionnement</span>
                  </span>
                </MobileNavLink>
                <MobileNavLink
                  href="/parametre_systeme"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Configuration</span>
                  </span>
                </MobileNavLink>
                <MobileNavLink
                  href="/user_management"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span>Utilisateurs</span>
                  </span>
                </MobileNavLink>
                <MobileNavLink
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profil</span>
                  </span>
                </MobileNavLink>
                <MobileNavLink
                  href="/history"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Historique</span>
                  </span>
                </MobileNavLink>
                <MobileNavLink
                  href="/technical"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Fiche technique</span>
                  </span>
                </MobileNavLink>
                
                <div className="mx-6 my-4 h-px bg-white/30" />
                
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-6 py-4 text-sm font-medium transition-all duration-200 
                           hover:bg-rose-500/20 hover:pl-8 border-l-4 border-transparent hover:border-rose-400
                           flex items-center space-x-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="py-4 space-y-1">
                <MobileNavLink
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Connexion</span>
                  </span>
                </MobileNavLink>
                <MobileNavLink
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Inscription</span>
                  </span>
                </MobileNavLink>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {/* Spacer pour compenser la navbar fixe */}
      <div className="h-16" />
    </>
  );
}