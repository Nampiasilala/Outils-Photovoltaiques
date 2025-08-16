"use client";

import { AuthProvider } from "@/components/AuthContext";
import { LoadingProvider } from "@/LoadingProvider"; // si tu as ajouté le loader global

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LoadingProvider>
        {children}
      </LoadingProvider>
    </AuthProvider>
  );
}
