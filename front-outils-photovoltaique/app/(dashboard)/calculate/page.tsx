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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="pt-2 pb-2">
        <div className="mx-auto max-w-7xl px-2">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Espace pour le calcul
            </h2>
            <SolarForm />
          </div>
        </div>
      </main>
    </div>
  );
}