'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import {
  Sun,
  Zap,
  Globe,
  AlertCircle,
  Calculator,
  Settings,
  DollarSign,
  BatteryCharging,
  PanelTop,
  ClipboardCheck,
  Search,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useDebounce } from 'use-debounce';

interface FormData {
  E_jour: number;
  P_max: number;
  N_autonomie: number;
  H_solaire: number;
  V_battery: number;
  localisation: string;
}
interface ResultData {
  id: number;
  date_calcul: string;
  puissance_totale: number;
  capacite_batterie: number;
  nombre_panneaux: number;
  nombre_batteries: number;
  bilan_energetique_annuel: number;
  cout_total: number;
  entree: number;
  parametre: number;
  equipements_recommandes: {
    panneau: EquipmentDetail;
    batterie: EquipmentDetail;
    regulateur: EquipmentDetail;
  };
}
interface EquipmentDetail {
  id: number;
  modele: string;
  puissance?: number;
  capacite?: number;
  tension?: number;
  prix_unitaire: number;
}

export default function SolarForm() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirige si non connecté
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);
  if (loading || !user) return null;

  const [formData, setFormData] = useState<FormData>({
    E_jour: 0,
    P_max: 0,
    N_autonomie: 1,
    H_solaire: 4.5,
    V_battery: 24,
    localisation: '',
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<ResultData | null>(null);

  // 🌍 États pour les APIs de géocodage et d'irradiation
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingIrradiation, setLoadingIrradiation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  // Correction: le type de latLon est maintenant explicitement défini
  const [latLon, setLatLon] = useState<{ lat: number | null; lon: number | null }>({
    lat: null,
    lon: null,
  });

  const [debouncedLocalisation] = useDebounce(formData.localisation, 500);

  // 🌍 Étape 1: Geocodage pour trouver les coordonnées
  useEffect(() => {
    if (debouncedLocalisation && !selectedLocation) {
      setLoadingIrradiation(true);
      const fetchLocations = async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${debouncedLocalisation}&format=json&limit=5`);
          const data = await res.json();
          setSuggestions(data);
        } catch (error) {
          console.error("Erreur lors de la recherche de la localisation", error);
        } finally {
          setLoadingIrradiation(false);
        }
      };
      fetchLocations();
    } else {
      setSuggestions([]);
    }
  }, [debouncedLocalisation, selectedLocation]);

  // 🌍 Étape 2: Récupération de l'irradiation à partir des coordonnées
  const fetchIrradiation = async (lat: number, lon: number) => {
    setLoadingIrradiation(true);
    try {
      const startYear = new Date().getFullYear() - 1;
      const endYear = new Date().getFullYear();
      const api_url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&start=${startYear}&end=${endYear}&format=json`;
      const res = await fetch(api_url);
      const data = await res.json();

      // Extraction de la valeur moyenne de l'irradiation
      const annualData = data.properties.parameter.ALLSKY_SFC_SW_DWN;
      const values = Object.values(annualData).map(val => val as number).filter(val => val !== -999);
      const avgIrradiation = values.reduce((sum, current) => sum + current, 0) / values.length;

      updateField('H_solaire', parseFloat(avgIrradiation.toFixed(2)));
    } catch (error) {
      console.error("Erreur lors de la récupération de l'irradiation", error);
      toast.error("Impossible de récupérer l'irradiation pour cette localisation.");
      updateField('H_solaire', 0); // Réinitialise l'irradiation en cas d'erreur
    } finally {
      setLoadingIrradiation(false);
    }
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectLocation = (location: any) => {
    // 🌍 Met à jour la localisation et déclenche l'appel pour l'irradiation
    updateField('localisation', location.display_name);
    setSelectedLocation(location);
    setLatLon({ lat: parseFloat(location.lat), lon: parseFloat(location.lon) });
    setSuggestions([]);
    fetchIrradiation(parseFloat(location.lat), parseFloat(location.lon));
  };

  const validate = () => {
    const errs: string[] = [];
    if (formData.E_jour <= 0) errs.push('La consommation journalière doit être > 0.');
    if (formData.P_max <= 0) errs.push('La puissance max doit être > 0.');
    if (formData.N_autonomie <= 0) errs.push('Le nombre de jours d’autonomie doit être > 0.');
    if (formData.H_solaire <= 0) errs.push('L’irradiation doit être > 0.');
    if (![12, 24, 48].includes(formData.V_battery))
      errs.push('La tension doit être 12 V, 24 V ou 48 V.');
    if (!formData.localisation.trim()) errs.push('La localisation est requise.');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = {
        E_jour: formData.E_jour,
        P_max: formData.P_max,
        N_autonomie: formData.N_autonomie,
        H_solaire: formData.H_solaire,
        V_batterie: formData.V_battery,
        localisation: formData.localisation,
      };
      console.log('SolarForm payload:', payload);

      const res = await fetchWithAuth('/dimensionnements/calculate/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.status === 400) {
        const err = await res.json();
        toast.error(`Champs invalides : ${JSON.stringify(err)}`);
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Erreur ${res.status} : ${txt}`);
      }
      const data: ResultData = await res.json();
      setResult(data);
      setErrors([]);
    } catch (err: any) {
      setResult(null);
      setErrors([err.message || 'Erreur inattendue']);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Sun className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold">Calculateur Solaire</h1>
        </div>
        <p className="text-gray-600">Renseignez vos besoins :</p>
      </header>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Consommation */}
          <section className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold mb-4">
              <Zap /> Consommation
            </h3>
            <label className="block text-sm mb-1">Consommation journalière (Wh)</label>
            <input
              type="number"
              className="w-full mb-4 p-2 border rounded"
              value={formData.E_jour}
              onChange={e => updateField('E_jour', +e.target.value)}
            />
            <label className="block text-sm mb-1">Puissance max (W)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={formData.P_max}
              onChange={e => updateField('P_max', +e.target.value)}
            />
          </section>
          {/* Configuration */}
          <section className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold mb-4">
              <Settings /> Configuration
            </h3>
            <label className="block text-sm mb-1">Jours d'autonomie</label>
            <input
              type="number"
              className="w-full mb-4 p-2 border rounded"
              value={formData.N_autonomie}
              onChange={e => updateField('N_autonomie', +e.target.value)}
            />
            <label className="block text-sm mb-1">Tension batterie</label>
            <div className="flex space-x-2">
              {[12, 24, 48].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => updateField('V_battery', v)}
                  className={`px-3 py-1 rounded ${
                    formData.V_battery === v
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  {v}V
                </button>
              ))}
            </div>
          </section>
          {/* Environnement */}
          <section className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold mb-4">
              <Globe /> Environnement
            </h3>
            <label className="block text-sm mb-1">
              Localisation <span className="text-gray-500 text-xs">(Tapez pour rechercher)</span>
            </label>
            <div className="relative mb-4">
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 border rounded pr-10"
                  value={formData.localisation}
                  onChange={e => {
                    updateField('localisation', e.target.value);
                    setSelectedLocation(null);
                  }}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
              {loadingIrradiation && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg p-2 text-center text-gray-500">
                  Chargement...
                </div>
              )}
              {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map((loc, i) => (
                    <li
                      key={i}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => handleSelectLocation(loc)}
                    >
                      {loc.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <label className="block text-sm mb-1">Irradiation (kWh/m²/j)</label>
            <input
              type="number"
              step="0.1"
              className="w-full mb-6 p-2 border rounded bg-gray-100"
              value={formData.H_solaire}
              onChange={e => updateField('H_solaire', +e.target.value)}
              disabled={!!selectedLocation}
            />
            {selectedLocation && (
              <p className="text-xs text-green-600 -mt-4 mb-4">
                Irradiation calculée pour {selectedLocation.display_name}. Vous pouvez effacer la localisation pour modifier la valeur.
              </p>
            )}
            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              <Calculator /> Calculer
            </button>
          </section>
        </div>
        {/* Erreurs */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <h4 className="flex items-center gap-2 text-red-800 mb-2">
              <AlertCircle /> Erreurs
            </h4>
            <ul className="list-disc pl-5 text-red-700">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        {result && (
          <div className="bg-white p-6 rounded-xl shadow mt-6">
            <h3 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <Calculator /> Résumé du Dimensionnement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-gray-50 border rounded flex items-center gap-2">
                <PanelTop className="text-blue-500" />
                <span>Puissance totale (Onduleur) : <strong>{result.puissance_totale} W</strong></span>
              </div>
              <div className="p-3 bg-gray-50 border rounded flex items-center gap-2">
                <BatteryCharging className="text-green-500" />
                <span>Capacité batterie totale : <strong>{result.capacite_batterie} Wh</strong></span>
              </div>
              <div className="p-3 bg-gray-50 border rounded flex items-center gap-2">
                <ClipboardCheck className="text-purple-500" />
                <span>Bilan énergétique annuel : <strong>{result.bilan_energetique_annuel} Wh</strong></span>
              </div>
              <div className="p-3 bg-gray-50 border rounded flex items-center gap-2">
                <DollarSign className="text-yellow-600" />
                <span>Coût total estimé : <strong>{result.cout_total} €</strong></span>
              </div>
              <div className="p-3 bg-gray-50 border rounded flex items-center gap-2">
                <Sun className="text-orange-500" />
                <span>Nombre de panneaux : <strong>{result.nombre_panneaux}</strong></span>
              </div>
              <div className="p-3 bg-gray-50 border rounded flex items-center gap-2">
                <BatteryCharging className="text-green-500" />
                <span>Nombre de batteries : <strong>{result.nombre_batteries}</strong></span>
              </div>
            </div>
          </div>
        )}
        {/* Équipements recommandés */}
        {result && result.equipements_recommandes && (
          <div className="bg-white p-6 rounded-xl shadow mt-6">
            <h3 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <Zap /> Équipements recommandés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Panneau solaire */}
              <div className="p-4 bg-gray-50 border rounded">
                <h4 className="font-semibold text-blue-600">Panneau solaire</h4>
                <ul className="mt-2 text-sm space-y-1">
                  <li>Modèle : <strong>{result.equipements_recommandes.panneau.modele}</strong></li>
                  <li>Puissance : <strong>{result.equipements_recommandes.panneau.puissance} W</strong></li>
                  <li>Quantité : <strong>{result.nombre_panneaux}</strong></li>
                  <li>Prix unitaire : <strong>{result.equipements_recommandes.panneau.prix_unitaire} €</strong></li>
                </ul>
              </div>
              {/* Batterie */}
              <div className="p-4 bg-gray-50 border rounded">
                <h4 className="font-semibold text-green-600">Batterie</h4>
                <ul className="mt-2 text-sm space-y-1">
                  <li>Modèle : <strong>{result.equipements_recommandes.batterie.modele}</strong></li>
                  <li>Capacité : <strong>{result.equipements_recommandes.batterie.capacite} Ah</strong></li>
                  <li>Quantité : <strong>{result.nombre_batteries}</strong></li>
                  <li>Prix unitaire : <strong>{result.equipements_recommandes.batterie.prix_unitaire} €</strong></li>
                </ul>
              </div>
              {/* Régulateur */}
              <div className="p-4 bg-gray-50 border rounded">
                <h4 className="font-semibold text-purple-600">Régulateur</h4>
                <ul className="mt-2 text-sm space-y-1">
                  <li>Modèle : <strong>{result.equipements_recommandes.regulateur.modele}</strong></li>
                  <li>Tension : <strong>{result.equipements_recommandes.regulateur.tension} V</strong></li>
                  <li>Quantité : <strong>1</strong></li>
                  <li>Prix unitaire : <strong>{result.equipements_recommandes.regulateur.prix_unitaire} €</strong></li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
