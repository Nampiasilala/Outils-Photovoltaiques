import type { ReactNode } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar client */}
      <AdminNavbar />
      {/* Décale le contenu sous la navbar fixe */}
      <main className="pt-14">{children}</main>
    </div>
  );
}
