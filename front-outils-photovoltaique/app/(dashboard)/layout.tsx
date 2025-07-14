// app/(dashboard)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();      // user: { email: string } | null
  const router = useRouter();

  // Redirige vers /login si l’utilisateur n’est pas connecté
  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  // Pendant la redirection (user == null), ne rien afficher
  if (!user) return null;          // tu peux mettre ici un petit spinner

  return (
    <div className="min-h-screen bg-gray-100">
      {/* La barre de navigation n’apparaît QUE dans le dashboard */}
      <Navbar />
      {children}
    </div>
  );
}
