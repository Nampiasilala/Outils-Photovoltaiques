// app/entreprise/layout.tsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import { Spinner } from "@/LoadingProvider";
import { toast } from "react-toastify";

export default function EntrepriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // on attend d’avoir le profil
    if (!user) {
      // pas connecté
      router.replace("/admin-login");
      return;
    }
    if (user.role === "admin") {
      // admin -> dashboard admin
      router.replace("/admin");
      return;
    }
    if (user.role !== "entreprise") {
      // pas entreprise -> refus
      toast.error("Accès refusé : cette section est réservée aux entreprises.");
      router.replace("/admin-login");
      return;
    }
  }, [user, loading, router]);

  const isActive = (href: string) => pathname?.startsWith(href);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <Spinner size={40} />
          <p>Chargement…</p>
        </div>
      </div>
    );
  }

  // ici, forcément role === "entreprise"
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto  py-3 flex items-center justify-between">
          <Link href="/entreprise/equipments" className="font-semibold">
            Espace Entreprise
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/entreprise/equipments"
              className={`px-3 py-1.5 rounded-md ${
                isActive("/entreprise/equipments")
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Mes équipements
            </Link>

            {/* 👇 Nouveau bouton vers le profil entreprise */}
            <Link
              href="/entreprise/entreprise-profile" // ← adapte le chemin si ta page s’appelle autrement
              className={`px-3 py-1.5 rounded-md ${
                isActive("/entreprise/entreprise-profile")
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Profil entreprise
            </Link>

            <button
              onClick={() => {
                logout();
                router.replace("/admin-login");
              }}
              className="px-3 py-1.5 rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Se déconnecter
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">{children}</main>
    </div>
  );
}
