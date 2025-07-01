// app/history/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function History() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-10 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Historique des calculs
            </h2>
            <p className="text-gray-600">
              (Placeholder) Aucun calcul enregistré pour le moment. Effectuez un calcul pour voir l’historique.
            </p>
            <button
              onClick={() => router.push("/calculate")}
              className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
            >
              Nouveau calcul
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}