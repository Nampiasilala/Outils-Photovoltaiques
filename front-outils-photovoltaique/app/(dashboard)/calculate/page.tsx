// app/calculate/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useEffect } from "react";
import SolarForm from "@/components/SolarForm";

export default function Calculate() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null; // ou un composant de chargement
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="pt-10 pb-10"> {/* Changé de py-8 à pt-20 pb-8 */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Dimensionnement de votre installation photovoltaïque
            </h2>
            <SolarForm />
          </div>
        </div>
      </main>
    </div>
  );
}