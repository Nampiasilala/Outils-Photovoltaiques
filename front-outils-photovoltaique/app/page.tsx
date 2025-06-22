import SolarForm from '../components/SolarForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-600 text-white py-6">
        <div className="container">
          <h1 className="text-3xl font-bold">Outil de Dimensionnement Photovoltaïque</h1>
          <p className="mt-2 text-lg">Calculez et planifiez votre installation solaire autonome</p>
        </div>
      </header>
      <main className="py-8">
        <div className="container">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Saisissez vos données</h2>
            <SolarForm />
          </div>
        </div>
      </main>
    </div>
  );
}