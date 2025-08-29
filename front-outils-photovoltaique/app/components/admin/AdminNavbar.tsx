// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/components/AuthContext";
import LogoutButton from "@/components/LogoutButton"; // ok si ce bouton lit useAuth().logout
import {
  Menu, LogIn, UserPlus, Settings, Users, History, FileText,
  User as UserIcon, Wrench
} from "lucide-react";

export default function Navbar() {
  const { user, loading, logout } = useAuth();   // ✅ user + loading + logout
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  const isAdmin = (user?.role || "").toLowerCase() === "admin";
  const isEntreprise = (user?.role || "").toLowerCase() === "entreprise";

  const adminLinks = [
    { href: "/admin/profile",    label: "Mon profil", icon: <UserIcon className="w-4 h-4" /> },
    { href: "/admin/equipments", label: "Équipements", icon: <Wrench className="w-4 h-4" /> },
    { href: "/admin/users",      label: "Utilisateurs", icon: <Users className="w-4 h-4" /> },
    { href: "/admin/parameters", label: "Paramètres", icon: <Settings className="w-4 h-4" /> },
    { href: "/admin/history",    label: "Historique", icon: <History className="w-4 h-4" /> },
    { href: "/admin/contents",   label: "Contenus", icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo + titre */}
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={32} height={32} />
              <Link href="/" className="font-bold text-blue-600 text-sm">
                Calculateur Solaire
              </Link>
            </div>

            {/* Desktop */}
            <div className="hidden md:flex items-center space-x-2 w-full">
              {/* Centre */}
              <div className="flex items-center gap-2 mx-auto">
                {loading ? (
                  <div className="h-8 w-64 rounded bg-gray-200 animate-pulse" />
                ) : isAdmin ? (
                  adminLinks.map(({ href, label, icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                        isActive(href) ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-blue-100"
                      }`}
                    >
                      {icon} <span className="hidden lg:inline">{label}</span>
                    </Link>
                  ))
                ) : isEntreprise ? (
                  <Link
                    href="/entreprise/equipments"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/entreprise/equipments")
                        ? "bg-emerald-600 text-white"
                        : "text-gray-700 hover:bg-emerald-100"
                    }`}
                  >
                    Mes équipements
                  </Link>
                ) : null}
              </div>

              {/* Droite */}
              {loading ? (
                <div className="h-8 w-40 rounded bg-gray-200 animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-2">
                  <span className="hidden lg:inline text-sm text-gray-600">
                    {user.username || user.email}
                  </span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 font-medium hover:bg-red-100"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-auto">
                  <Link
                    href="/admin-login"
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Connexion</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Inscription</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile burger */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-md border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {loading ? (
                <div className="h-8 w-full rounded bg-gray-200 animate-pulse" />
              ) : user ? (
                <>
                  <div className="px-4 py-2 border-b text-sm text-gray-700">
                    {user.email} — <b>{user.role}</b>
                  </div>

                  {isAdmin &&
                    adminLinks.map(({ href, label, icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium ${
                          isActive(href) ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-blue-100"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {icon} {label}
                      </Link>
                    ))}

                  {isEntreprise && (
                    <Link
                      href="/entreprise/equipments"
                      className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium ${
                        isActive("/entreprise/equipments")
                          ? "bg-emerald-600 text-white"
                          : "text-gray-700 hover:bg-emerald-100"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Wrench className="w-4 h-4" /> Mes équipements
                    </Link>
                  )}

                  <button
                    onClick={() => { setIsMenuOpen(false); logout(); }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/admin-login"
                    className="block px-4 py-2 text-sm rounded-md text-blue-600 hover:bg-blue-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* espace pour compenser la nav fixe */}
      <div className="h-14" />
    </>
  );
}
