// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useAuth } from "./AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-green-600 text-white shadow-md fixed w-full top-0 z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold">
              Solaire Autonome
            </Link>
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                <Link
                  href="/calculate"
                  className="px-3 py-2 text-sm font-medium hover:bg-green-700 rounded-md transition-colors"
                >
                  Calculate
                </Link>

                <Link
                  href="/profile"
                  className="px-3 py-2 text-sm font-medium hover:bg-green-700 rounded-md transition-colors"
                >
                  Profil
                </Link>
                <Link
                  href="/history"
                  className="px-3 py-2 text-sm font-medium hover:bg-green-700 rounded-md transition-colors"
                >
                  Historique
                </Link>
                <Link
                  href="/technical"
                  className="px-3 py-2 text-sm font-medium hover:bg-green-700 rounded-md transition-colors"
                >
                  Fiche technique
                </Link>
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <button
                  onClick={logout}
                  className="px-3 py-2 text-sm font-medium hover:bg-green-700 rounded-md transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-medium hover:bg-green-700 rounded-md transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 text-sm font-medium hover:bg-green-700 rounded-md transition-colors"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
          {/* Menu mobile */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-green-700 rounded-md"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="sm:hidden bg-green-600 absolute w-full top-16 left-0 z-10">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm hover:bg-green-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profil
                </Link>
                <Link
                  href="/history"
                  className="block px-4 py-2 text-sm hover:bg-green-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Historique
                </Link>
                <Link
                  href="/technical"
                  className="block px-4 py-2 text-sm hover:bg-green-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Fiche technique
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-green-700"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm hover:bg-green-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-sm hover:bg-green-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
