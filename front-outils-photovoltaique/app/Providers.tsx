"use client";

import { AuthProvider } from "@/components/AuthContext";   // adapte le chemin si besoin
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      {/* conteneur unique de React-Toastify */}
      <ToastContainer position="top-right" pauseOnFocusLoss={false} className="text-sm" />
    </AuthProvider>
  );
}
