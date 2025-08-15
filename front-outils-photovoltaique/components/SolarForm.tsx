// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { dimensionnementAPI } from "@/lib/api";
// import { usePDFGenerator } from "@/hooks/usePDFGenerator";
// import { 
//   formatPrice, 
//   formatEnergyLocale, 
//   formatNumber, 
//   formatPower,
//   formatCapacity,
//   formatVoltage 
// } from "@/utils/formatters";
// import {
//   Sun,
//   Zap,
//   Globe,
//   AlertCircle,
//   Calculator,
//   Settings,
//   DollarSign,
//   BatteryCharging,
//   PanelTop,
//   ClipboardCheck,
//   Search,
//   Cable,
//   Download,
// } from "lucide-react";
// import { toast } from "react-toastify";
// import { useDebounce } from "use-debounce";

// interface FormData {
//   E_jour: number;
//   P_max: number;
//   N_autonomie: number;
//   H_solaire: number;
//   V_battery: number;
//   localisation: string;
// }

// // ✅ Interface corrigée selon le backend
// interface EquipmentDetail {
//   id: number;
//   reference: string;
//   modele: string;
//   marque: string;
//   nom_commercial: string;
//   puissance_W?: number | null;
//   capacite_Ah?: number | null;
//   tension_nominale_V?: number | null;
//   prix_unitaire: number;
//   devise: string;
//   categorie: string;
// }

// // ✅ Interface ResultData corrigée
// interface ResultData {
//   id: number;
//   date_calcul: string;
//   puissance_totale: number;
//   capacite_batterie: number;
//   nombre_panneaux: number;
//   nombre_batteries: number;
//   bilan_energetique_annuel: number;
//   cout_total: number;
//   entree: number;
//   parametre: number;
//   equipements_recommandes: {
//     panneau: EquipmentDetail | null;
//     batterie: EquipmentDetail | null;
//     regulateur: EquipmentDetail | null;
//     onduleur?: EquipmentDetail | null;
//     cable?: EquipmentDetail | null;
//   };
// }

// /* ---------- Helpers & UI atoms ---------- */

// // ✅ Fonction de formatage pour les prix avec devise personnalisée
// const formatPriceWithCurrency = (n?: number | null, currency?: string) => {
//   if (typeof n !== "number") return "—";
  
//   // Utiliser la devise spécifiée ou "Ar" par défaut
//   if (currency === "MGA") {
//     return formatPrice(n); // Utilise la fonction centralisée qui retourne déjà "Ar"
//   }
  
//   // Pour autres devises, formater manuellement
//   const formatted = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
//   return `${formatted} ${currency || 'Ar'}`;
// };

// // ✅ Fonction pour formater les décimales (pour compatibilité)
// const formatDecimal = (n?: number | null, decimals: number = 1) => {
//   if (typeof n !== "number") return "—";
//   return n.toFixed(decimals);
// };

// // ✅ Composant EquipCard avec formatters centralisés
// const EquipCard = ({
//   title,
//   c,
//   extra,
//   icon: Icon,
// }: {
//   title: string;
//   c: EquipmentDetail | null | undefined;
//   extra?: React.ReactNode;
//   icon: any;
// }) => (
//   <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg shadow-sm">
//     <div className="flex items-center gap-2 mb-3">
//       <Icon className="w-5 h-5 text-gray-600" />
//       <h4 className="font-semibold text-gray-700">{title}</h4>
//     </div>
//     {c ? (
//       <ul className="mt-2 text-sm space-y-2">
//         <li className="flex justify-between">
//           <span>Modèle :</span>
//           <strong>{c.modele}</strong>
//         </li>
//         {c.reference && (
//           <li className="flex justify-between">
//             <span>Référence :</span>
//             <strong className="text-xs font-mono">{c.reference}</strong>
//           </li>
//         )}
//         {c.puissance_W && (
//           <li className="flex justify-between">
//             <span>Puissance :</span>
//             <strong>{formatPower(c.puissance_W)}</strong>
//           </li>
//         )}
//         {c.capacite_Ah && (
//           <li className="flex justify-between">
//             <span>Capacité :</span>
//             <strong>{formatCapacity(c.capacite_Ah)}</strong>
//           </li>
//         )}
//         {c.tension_nominale_V && (
//           <li className="flex justify-between">
//             <span>Tension :</span>
//             <strong>{formatVoltage(c.tension_nominale_V)}</strong>
//           </li>
//         )}
//         <li className="flex justify-between border-t pt-2 mt-2">
//           <span>Prix unitaire :</span>
//           <strong className="text-green-600">
//             {formatPriceWithCurrency(c.prix_unitaire, c.devise)}
//           </strong>
//         </li>
//         {extra}
//       </ul>
//     ) : (
//       <p className="mt-2 text-sm text-gray-500">Aucune recommandation.</p>
//     )}
//   </div>
// );

// /* ---------- Page ---------- */
// export default function SolarForm() {
//   const router = useRouter();
//   const { generatePDF, isGenerating } = usePDFGenerator();

//   const [formData, setFormData] = useState<FormData>({
//     E_jour: 0,
//     P_max: 0,
//     N_autonomie: 1,
//     H_solaire: 4.5,
//     V_battery: 24,
//     localisation: "",
//   });

//   const [errors, setErrors] = useState<string[]>([]);
//   const [result, setResult] = useState<ResultData | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   // 🌍 États pour les APIs de géocodage et d'irradiation
//   const [suggestions, setSuggestions] = useState<any[]>([]);
//   const [loadingIrradiation, setLoadingIrradiation] = useState(false);
//   const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
//   const [latLon, setLatLon] = useState<{
//     lat: number | null;
//     lon: number | null;
//   }>({
//     lat: null,
//     lon: null,
//   });

//   const [debouncedLocalisation] = useDebounce(formData.localisation, 500);

//   // 🌍 Étape 1: Geocodage pour trouver les coordonnées
//   useEffect(() => {
//     if (debouncedLocalisation && !selectedLocation) {
//       setLoadingIrradiation(true);
//       const fetchLocations = async () => {
//         try {
//           const res = await fetch(
//             `https://nominatim.openstreetmap.org/search?q=${debouncedLocalisation}&format=json&limit=5`
//           );
//           const data = await res.json();
//           setSuggestions(data);
//         } catch (error) {
//           console.error(
//             "Erreur lors de la recherche de la localisation",
//             error
//           );
//         } finally {
//           setLoadingIrradiation(false);
//         }
//       };
//       fetchLocations();
//     } else {
//       setSuggestions([]);
//     }
//   }, [debouncedLocalisation, selectedLocation]);

//   // 🌍 Étape 2: Récupération de l'irradiation à partir des coordonnées
//   const fetchIrradiation = async (lat: number, lon: number) => {
//     setLoadingIrradiation(true);
//     try {
//       const startYear = new Date().getFullYear() - 1;
//       const endYear = new Date().getFullYear();
//       const api_url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&start=${startYear}&end=${endYear}&format=json`;
//       const res = await fetch(api_url);
//       const data = await res.json();

//       const annualData = data.properties.parameter.ALLSKY_SFC_SW_DWN;
//       const values = Object.values(annualData)
//         .map((val) => val as number)
//         .filter((val) => val !== -999);
//       const avgIrradiation =
//         values.reduce((sum, current) => sum + current, 0) / values.length;

//       updateField("H_solaire", parseFloat(avgIrradiation.toFixed(2)));
//     } catch (error) {
//       console.error("Erreur lors de la récupération de l'irradiation", error);
//       toast.error(
//         "Impossible de récupérer l'irradiation pour cette localisation."
//       );
//       updateField("H_solaire", 0);
//     } finally {
//       setLoadingIrradiation(false);
//     }
//   };

//   const updateField = <K extends keyof FormData>(
//     field: K,
//     value: FormData[K]
//   ) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSelectLocation = (location: any) => {
//     updateField("localisation", location.display_name);
//     setSelectedLocation(location);
//     setLatLon({ lat: parseFloat(location.lat), lon: parseFloat(location.lon) });
//     setSuggestions([]);
//     fetchIrradiation(parseFloat(location.lat), parseFloat(location.lon));
//   };

//   const validate = () => {
//     const errs: string[] = [];
//     if (formData.E_jour <= 0)
//       errs.push("La consommation journalière doit être > 0.");
//     if (formData.P_max <= 0) errs.push("La puissance max doit être > 0.");
//     if (formData.N_autonomie <= 0)
//       errs.push("Le nombre de jours d'autonomie doit être > 0.");
//     if (formData.H_solaire <= 0) errs.push("L'irradiation doit être > 0.");
//     if (![12, 24, 48].includes(formData.V_battery))
//       errs.push("La tension doit être 12 V, 24 V ou 48 V.");
//     if (!formData.localisation.trim())
//       errs.push("La localisation est requise.");
//     setErrors(errs);
//     return errs.length === 0;
//   };

//   const handleDownloadPDF = async () => {
//     if (!result) return;

//     const pdfData = {
//       result,
//       inputData: {
//         E_jour: formData.E_jour,
//         P_max: formData.P_max,
//         N_autonomie: formData.N_autonomie,
//         H_solaire: formData.H_solaire,
//         V_batterie: formData.V_battery,
//         localisation: formData.localisation,
//       },
//     };

//     await generatePDF(pdfData);
//   };

//   const handleSubmit = async () => {
//     if (!validate()) return;

//     setIsLoading(true);
//     try {
//       const payload = {
//         E_jour: formData.E_jour,
//         P_max: formData.P_max,
//         N_autonomie: formData.N_autonomie,
//         H_solaire: formData.H_solaire,
//         V_batterie: formData.V_battery,
//         localisation: formData.localisation,
//       };
//       console.log("SolarForm payload:", payload);

//       const data: ResultData = await dimensionnementAPI.calculate(payload);
//       setResult(data);
//       setErrors([]);
//       toast.success("Calcul effectué avec succès !");
//     } catch (err: any) {
//       console.error("Erreur lors du calcul:", err);

//       if (err.message.includes("400")) {
//         toast.error("Données invalides. Vérifiez vos saisies.");
//         setErrors(["Veuillez vérifier les données saisies"]);
//       } else {
//         setResult(null);
//         setErrors([err.message || "Erreur inattendue"]);
//         toast.error(err.message || "Erreur lors du calcul");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
//       <header className="mb-6">
//         <div className="flex items-center space-x-3 mb-2">
//           <Sun className="w-8 h-8 text-blue-600" />
//           <h1 className="text-2xl font-bold text-gray-800">
//             Calculateur Solaire
//           </h1>
//         </div>
//         <p className="text-gray-600">
//           Dimensionnez votre installation photovoltaïque :
//         </p>
//       </header>

//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* FORM */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Consommation */}
//           <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//             <h3 className="flex items-center gap-2 font-semibold mb-4 text-gray-800">
//               <Zap className="text-yellow-500" /> Consommation
//             </h3>
//             <label className="block text-sm font-medium mb-2 text-gray-700">
//               Consommation journalière (Wh)
//             </label>
//             <input
//               type="number"
//               className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//               value={formData.E_jour}
//               onChange={(e) => updateField("E_jour", +e.target.value)}
//               placeholder="Ex: 1520"
//             />
//             <label className="block text-sm font-medium mb-2 text-gray-700">
//               Puissance max (W)
//             </label>
//             <input
//               type="number"
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//               value={formData.P_max}
//               onChange={(e) => updateField("P_max", +e.target.value)}
//               placeholder="Ex: 400"
//             />
//           </section>

//           {/* Configuration */}
//           <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//             <h3 className="flex items-center gap-2 font-semibold mb-4 text-gray-800">
//               <Settings className="text-purple-500" /> Configuration
//             </h3>
//             <label className="block text-sm font-medium mb-2 text-gray-700">
//               Jours d'autonomie
//             </label>
//             <input
//               type="number"
//               className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//               value={formData.N_autonomie}
//               onChange={(e) => updateField("N_autonomie", +e.target.value)}
//               min="1"
//             />
//             <label className="block text-sm font-medium mb-2 text-gray-700">
//               Tension batterie
//             </label>
//             <div className="flex space-x-2">
//               {[12, 24, 48].map((v) => (
//                 <button
//                   key={v}
//                   type="button"
//                   onClick={() => updateField("V_battery", v)}
//                   className={`px-4 py-2 rounded-lg font-medium transition-all ${
//                     formData.V_battery === v
//                       ? "bg-blue-600 text-white shadow-md"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   {v}V
//                 </button>
//               ))}
//             </div>
//           </section>

//           {/* Environnement */}
//           <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//             <h3 className="flex items-center gap-2 font-semibold mb-4 text-gray-800">
//               <Globe className="text-green-500" /> Environnement
//             </h3>
//             <label className="block text-sm font-medium mb-2 text-gray-700">
//               Localisation{" "}
//               <span className="text-gray-500 text-xs">
//                 (Tapez pour rechercher)
//               </span>
//             </label>
//             <div className="relative mb-4">
//               <div className="relative">
//                 <input
//                   type="text"
//                   className="w-full p-3 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   value={formData.localisation}
//                   onChange={(e) => {
//                     updateField("localisation", e.target.value);
//                     setSelectedLocation(null);
//                   }}
//                   placeholder="Ex: Antananarivo"
//                 />
//                 <Search
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
//                   size={20}
//                 />
//               </div>
//               {loadingIrradiation && (
//                 <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-3 text-center text-gray-500">
//                   Chargement...
//                 </div>
//               )}
//               {suggestions.length > 0 && (
//                 <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
//                   {suggestions.map((loc, i) => (
//                     <li
//                       key={i}
//                       className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
//                       onClick={() => handleSelectLocation(loc)}
//                     >
//                       <div className="font-medium text-sm">
//                         {loc.display_name}
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//             <label className="block text-sm font-medium mb-2 text-gray-700">
//               Irradiation (kWh/m²/j)
//             </label>
//             <input
//               type="number"
//               step="0.1"
//               className={`w-full mb-6 p-3 border border-gray-300 rounded-lg transition-all ${
//                 selectedLocation
//                   ? "bg-gray-100 cursor-not-allowed"
//                   : "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               }`}
//               value={formData.H_solaire}
//               onChange={(e) => updateField("H_solaire", +e.target.value)}
//               disabled={!!selectedLocation}
//               placeholder="Ex: 4.5"
//             />
//             {selectedLocation && (
//               <p className="text-xs text-green-600 -mt-4 mb-4 p-2 bg-green-50 rounded border border-green-200">
//                 ✓ Irradiation calculée pour {selectedLocation.display_name}.
//                 Effacez la localisation pour modifier.
//               </p>
//             )}
//             <button
//               onClick={handleSubmit}
//               disabled={isLoading}
//               className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   Calcul en cours...
//                 </>
//               ) : (
//                 <>
//                   <Calculator className="w-5 h-5" /> Calculer
//                 </>
//               )}
//             </button>
//           </section>
//         </div>

//         {/* Erreurs */}
//         {errors.length > 0 && (
//           <div className="bg-red-50 border border-red-200 p-6 rounded-xl shadow-sm">
//             <h4 className="flex items-center gap-2 text-red-800 mb-3 font-semibold">
//               <AlertCircle className="w-5 h-5" /> Erreurs de validation
//             </h4>
//             <ul className="list-disc pl-5 text-red-700 space-y-1">
//               {errors.map((e, i) => (
//                 <li key={i}>{e}</li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* Résumé */}
//         {result && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
//                 <Calculator className="text-blue-600" /> Résumé du
//                 Dimensionnement
//               </h3>
//               <button
//                 onClick={handleDownloadPDF}
//                 disabled={isGenerating}
//                 className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isGenerating ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     Génération...
//                   </>
//                 ) : (
//                   <>
//                     <Download className="w-4 h-4" />
//                     Télécharger PDF
//                   </>
//                 )}
//               </button>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg text-center">
//                 <PanelTop className="w-6 h-6 text-blue-600 mx-auto mb-2" />
//                 <p className="text-sm font-medium text-gray-600 mb-1">
//                   Puissance totale
//                 </p>
//                 <p className="text-lg font-bold text-gray-800">
//                   {formatPower(result.puissance_totale)}
//                 </p>
//               </div>
//               <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg text-center">
//                 <BatteryCharging className="w-6 h-6 text-green-600 mx-auto mb-2" />
//                 <p className="text-sm font-medium text-gray-600 mb-1">
//                   Capacité batterie
//                 </p>
//                 <p className="text-lg font-bold text-gray-800">
//                   {formatEnergyLocale(result.capacite_batterie)}
//                 </p>
//               </div>
//               <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg text-center">
//                 <ClipboardCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
//                 <p className="text-sm font-medium text-gray-600 mb-1">
//                   Bilan énergétique annuel
//                 </p>
//                 <p className="text-lg font-bold text-gray-800">
//                   {formatEnergyLocale(result.bilan_energetique_annuel)}
//                 </p>
//               </div>
//               <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg text-center">
//                 <DollarSign className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
//                 <p className="text-sm font-medium text-gray-600 mb-1">
//                   Coût total estimé
//                 </p>
//                 <p className="text-lg font-bold text-gray-800">
//                   {formatPrice(result.cout_total)}
//                 </p>
//               </div>
//               <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg text-center">
//                 <Sun className="w-6 h-6 text-orange-600 mx-auto mb-2" />
//                 <p className="text-sm font-medium text-gray-600 mb-1">
//                   Nombre de panneaux
//                 </p>
//                 <p className="text-lg font-bold text-gray-800">
//                   {formatNumber(result.nombre_panneaux)}
//                 </p>
//               </div>
//               <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg text-center">
//                 <BatteryCharging className="w-6 h-6 text-green-600 mx-auto mb-2" />
//                 <p className="text-sm font-medium text-gray-600 mb-1">
//                   Nombre de batteries
//                 </p>
//                 <p className="text-lg font-bold text-gray-800">
//                   {formatNumber(result.nombre_batteries)}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Équipements recommandés */}
//         {result?.equipements_recommandes && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="flex items-center gap-2 text-xl font-semibold mb-6 text-gray-800">
//               <Zap className="text-indigo-600" /> Équipements recommandés
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//               <EquipCard
//                 title="Panneau solaire"
//                 icon={Sun}
//                 c={result.equipements_recommandes.panneau}
//                 extra={
//                   <li className="flex justify-between border-t pt-2 mt-2">
//                     <span>Quantité :</span>
//                     <strong className="text-blue-600">
//                       {formatNumber(result?.nombre_panneaux)}
//                     </strong>
//                   </li>
//                 }
//               />

//               <EquipCard
//                 title="Batterie"
//                 icon={BatteryCharging}
//                 c={result.equipements_recommandes.batterie}
//                 extra={
//                   <li className="flex justify-between border-t pt-2 mt-2">
//                     <span>Quantité :</span>
//                     <strong className="text-green-600">
//                       {formatNumber(result?.nombre_batteries)}
//                     </strong>
//                   </li>
//                 }
//               />

//               <EquipCard
//                 title="Régulateur"
//                 icon={Settings}
//                 c={result.equipements_recommandes.regulateur}
//                 extra={
//                   <li className="flex justify-between border-t pt-2 mt-2">
//                     <span>Quantité :</span>
//                     <strong className="text-purple-600">1</strong>
//                   </li>
//                 }
//               />

//               <EquipCard
//                 title="Onduleur"
//                 icon={Zap}
//                 c={result.equipements_recommandes.onduleur}
//                 extra={
//                   <li className="flex justify-between border-t pt-2 mt-2">
//                     <span>Quantité :</span>
//                     <strong className="text-orange-600">1</strong>
//                   </li>
//                 }
//               />

//               <EquipCard
//                 title="Câble"
//                 icon={Cable}
//                 c={result.equipements_recommandes.cable}
//                 extra={
//                   <li className="flex justify-between border-t pt-2 mt-2">
//                     <span>Quantité :</span>
//                     <strong className="text-gray-600 text-xs">
//                       Selon installation
//                     </strong>
//                   </li>
//                 }
//               />
//             </div>
//           </div>
//         )}

//         {/* Boutons d'action */}
//         {result && (
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <button
//               onClick={() => router.push("/history")}
//               className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center"
//             >
//               <Calculator className="w-5 h-5" />
//               Voir l'historique
//             </button>
//             <button
//               onClick={handleDownloadPDF}
//               disabled={isGenerating}
//               className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
//             >
//               {isGenerating ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   Génération PDF...
//                 </>
//               ) : (
//                 <>
//                   <Download className="w-5 h-5" />
//                   Télécharger rapport PDF
//                 </>
//               )}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }