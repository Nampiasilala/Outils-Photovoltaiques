"use client";

import Link from "next/link";
import { useAdminAuth } from "@/components/AuthContext";
import {
  Crown,
  Settings,
  Users,
  Wrench,
  History,
  ArrowRight,
  User,
  FileText,
} from "lucide-react";
import { Spinner } from "@/LoadingProvider";

export default function AdminHomePage() {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size={32} />
          <p className="text-gray-600 mt-3">Chargement de l’interface admin…</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  const cards = [
    {
      href: "/admin/profile",
      title: "Mon profil",
      desc: "Voir et modifier mes informations",
      icon: <User className="w-5 h-5" />,
    },
    {
      href: "/admin/equipments",
      title: "Équipements",
      desc: "Gérer le catalogue d’équipements",
      icon: <Wrench className="w-5 h-5" />,
    },
    {
      href: "/admin/users",
      title: "Utilisateurs",
      desc: "Editer, supprimer des comptes",
      icon: <Users className="w-5 h-5" />,
    },
    {
      href: "/admin/parameters",
      title: "Paramètres",
      desc: "Configurer les paramètres du système",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      href: "/admin/history",
      title: "Historique",
      desc: "Voir l’historique des calculs",
      icon: <History className="w-5 h-5" />,
    },
    {
      href: "/admin/contents", // ← route corrigée (plural)
      title: "Contenus",
      desc: "Éditer les pages de contenu",
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Tableau de bord administrateur
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Connecté en tant que <span className="font-medium text-violet-700">{admin.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-sm px-3 py-2 rounded-md bg-white border shadow-sm hover:bg-slate-50"
            >
              Accueil public
            </Link>

          <span className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium bg-purple-100 text-purple-700 rounded-full">
          <Crown className="w-4 h-4" />
          Admin
        </span>
          </div>
        </header>

        {/* Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ href, title, desc, icon }) => (
            <Link
              key={href}
              href={href}
              className="group block rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-slate-700">
                    {icon}
                  </span>
                  <h2 className="font-semibold text-slate-900">{title}</h2>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" />
              </div>
              <p className="text-sm text-slate-600 mt-3">{desc}</p>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
