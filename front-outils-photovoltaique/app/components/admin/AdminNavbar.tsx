// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton"; // 👈 ajoute ça

import { useAuth } from "@/components/AuthContext";
import Image from "next/image";
import {
  Menu,
  LogIn,
  UserPlus,
  Settings,
  Users,
  History,
  FileText,
  User as UserIcon,
  Wrench, // ajout pour équipements
} from "lucide-react";

export default function Navbar() {
  const { admin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  // 🚀 Nouvelle config des menus (les 6 éléments seulement)
  const navigationLinks = [
    {
      href: "/admin/profile",
      label: "Mon profil",
      icon: <UserIcon className="w-4 h-4" />,
    },
    {
      href: "/admin/equipments",
      label: "Équipements",
      icon: <Wrench className="w-4 h-4" />,
    },
    {
      href: "/admin/users",
      label: "Utilisateurs",
      icon: <Users className="w-4 h-4" />,
    },
    {
      href: "/admin/parameters",
      label: "Paramètres",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      href: "/admin/history",
      label: "Historique",
      icon: <History className="w-4 h-4" />,
    },
    {
      href: "/admin/contents",
      label: "Contenus",
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="p-4">
              <Image
                src="/logo.png" // chemin relatif à /public
                alt="Logo"
                width={40}
                height={40}
              />
            </div>
            <Link href="/admin" className="font-bold text-blue-600 text-sm">
              Calculateur Solaire
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-1 w-full">
              {admin && (
                <>
                  {/* Navigation centrée */}
                  <div className="flex items-center gap-2 mx-auto">
                    {navigationLinks.map(({ href, label, icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          isActive(href)
                            ? "bg-blue-500 text-white"
                            : "text-gray-700 hover:bg-blue-100"
                        }`}
                      >
                        {icon}
                        <span className="hidden lg:inline text-sm">
                          {label}
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* Bouton de déconnexion */}
                  <LogoutButton
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 font-medium hover:bg-red-100 ml-2"
                    label="Déconnexion"
                  />
                </>
              )}

              {!admin && (
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

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-md border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {admin && (
                <>
                  {/* Badge + email */}
                  <div className="px-4 py-2 border-b">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {admin.email}
                      </span>
                    </div>
                  </div>

                  {/* Liens mobile */}
                  {navigationLinks.map(({ href, label, icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        isActive(href)
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 hover:bg-blue-100"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {icon}
                      <span className="text-sm">{label}</span>
                    </Link>
                  ))}

                  {/* Déconnexion */}
                  <LogoutButton
                    className="rounded-md text-sm text-red-600 hover:bg-red-100 ml-1 w-full"
                    label="Déconnexion"
                  />
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="h-14" />
    </>
  );
}
