import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";

export const metadata: Metadata = {
  title: "Outil de Dimensionnement Photovoltaïque",
  description: "Application pour calculer et planifier une installation solaire autonome",
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}