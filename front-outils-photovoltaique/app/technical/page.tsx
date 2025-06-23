import Navbar from "@/components/Navbar";

export default function Technical() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-20 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Fiche technique
            </h2>
            <p className="text-gray-600">
              Cette section fournit des informations techniques sur les installations photovoltaïques autonomes, telles que :
            </p>
            <ul className="list-disc pl-5 mt-2 text-gray-600">
              <li>Dimensionnement des panneaux solaires.</li>
              <li>Choix des batteries (autonomie, voltage).</li>
              <li>Types d’onduleurs (AC/DC).</li>
              <li>Conseils pour optimiser votre installation.</li>
            </ul>
            <p className="mt-4 text-gray-600">
              (Placeholder) Plus de détails seront ajoutés bientôt.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}