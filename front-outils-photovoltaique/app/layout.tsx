import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Outil de Dimensionnement Photovoltaïque',
  description: 'Application pour calculer et planifier une installation solaire autonome',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}