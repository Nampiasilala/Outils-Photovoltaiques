import Navbar from "../components/Navbar";
import SolarForm from "../components/SolarForm"; // Vérifie que ce chemin est correct

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <header className="bg-green-600 text-white py-4">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold">
            Outil de Dimensionnement Photovoltaïque
          </h1>
          <p className="mt-2 text-sm">
            Calculez et planifiez votre installation solaire autonome
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="py-5">
        <div className="mx-auto max-w-10xl px-2 sm:px-6 lg:px-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="text-xl font-semibold mb-4">
                Saisissez vos données
              </h2>
              <SolarForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}