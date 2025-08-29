// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";
import Toaster from "@/components/Toaster";
import Navbar from "@/components/admin/AdminNavbar"; // ✅ AJOUT

export const metadata: Metadata = {
  title: "Calculateur Solaire",
  description: "Application pour dimensionner une installation solaire autonome",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-inter">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
