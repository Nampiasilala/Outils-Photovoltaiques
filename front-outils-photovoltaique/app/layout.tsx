import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";           // ← nouveau

export const metadata: Metadata = {
  title: "Calculateur Solaire",
  description:
    "Application pour dimensionner une installation solaire autonome",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-inter">
        {/* Tous les providers côté client */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
