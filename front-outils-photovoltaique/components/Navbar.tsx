"use client";

import Link from "next/link";
import { useAuth } from "./AuthContext";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Menu, LogOut, LogIn, UserPlus, Settings, Users, History, FileText, Calculator, User
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    logout();
    toast.info("Vous avez été déconnecté.");
  };

  const links = [
    { href: "/calculate", label: "Dimensionnement", icon: <Calculator className="w-4 h-4" /> },
    { href: "/parametre_systeme", label: "Configuration", icon: <Settings className="w-4 h-4" /> },
    { href: "/user_management", label: "Utilisateurs", icon: <Users className="w-4 h-4" /> },
    { href: "/profile", label: "Profil", icon: <User className="w-4 h-4" /> },
    { href: "/history", label: "Historique", icon: <History className="w-4 h-4" /> },
    { href: "/technical", label: "Fiche technique", icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <Link href="/" className="font-bold text-blue-600 text-sm">Calulateur Solaire</Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex space-x-1">
              {links.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive(href) ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-blue-100"
                  }`}
                >
                  {icon}
                  <span className="hidden lg:inline text-sm">{label}</span>
                </Link>
              ))}
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 font-medium hover:bg-red-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline text-sm">Déconnexion</span>
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {links.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive(href) ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-blue-100"
                  }`}
                >
                  {icon}
                  <span className="text-sm">{label}</span>
                </Link>
              ))}
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Déconnexion</span>
                </button>
              )}
              {!user && (
                <div className="flex flex-col gap-2 px-4 py-2">
                  <Link href="/login" className="flex items-center gap-2 text-blue-600 text-sm hover:underline">
                    <LogIn className="w-4 h-4" /> <span className="text-sm">Connexion</span>
                  </Link>
                  <Link href="/register" className="flex items-center gap-2 text-blue-600 text-sm hover:underline">
                    <UserPlus className="w-4 h-4" /> <span className="text-sm">Inscription</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Push content below navbar */}
      <div className="h-12" />
    </>
  );
}
