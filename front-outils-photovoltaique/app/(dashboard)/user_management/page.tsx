// app/parametre_systeme/page.tsx
import UserManagement from "@/components/UserManagement";

export default function ParametreSystemePage() {
  return (
    <main className="pt-2 pb-2">
      <div className="mx-auto max-w-7xl px-2">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Espace administrateur des utilisateurs
          </h2>

          {/* Composant client gérant toute la logique */}
          <UserManagement />
        </div>
      </div>
    </main>
  );
}
