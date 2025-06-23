// app/profile/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function Profile() {
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
      <main className="pt-20 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Profil
            </h2>
            <div className="space-y-4">
              <p>
                <span className="font-medium">Email :</span> {user.email}
              </p>
              <p>
                <span className="font-medium">Avatar :</span>
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full mt-2"
                />
              </p>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
              >
                Retour à l’accueil
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}