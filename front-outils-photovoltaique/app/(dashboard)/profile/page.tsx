// app/parametre_systeme/page.tsx
import InfoProfile from "@/components/InfoProfile";

export default function profile() {
  return (
    <main className="pt-10 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Espace administrateur des utilisateurs
          </h2>

          {/* Composant client gérant toute la logique */}
          <InfoProfile />
        </div>
      </div>
    </main>
  );
}
