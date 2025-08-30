// app/admin/equipment-approval/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { fetchWithAdminAuth } from "@/lib/fetchWithAdminAuth";
import { useAdminAuth } from "@/components/AuthContext";
import { Icons } from "../../../src/assets/icons";
import { Spinner, useLoading } from "@/LoadingProvider";
import { env } from "@/lib/env";

const EditEquipmentModal = dynamic(
  () => import("@/components/admin/AddEquipmentModal"),
  { ssr: false }
);

const API = env.NEXT_PUBLIC_API_BASE_URL;

type Categorie =
  | "panneau_solaire"
  | "batterie"
  | "regulateur" 
  | "onduleur"
  | "cable"
  | "disjoncteur"
  | "parafoudre"
  | "support"
  | "boitier_jonction"
  | "connecteur"
  | "monitoring"
  | "autre";

interface Equipment {
  id: number;
  categorie: Categorie;
  reference: string;
  marque?: string | null;
  modele?: string | null;
  nom_commercial?: string | null;
  prix_unitaire: number;
  devise?: string;
  puissance_W?: number | null;
  capacite_Ah?: number | null;
  tension_nominale_V?: number | null;
  courant_A?: number | null;
  section_mm2?: number | null;
  ampacite_A?: number | null;
  disponible?: boolean;
  approuve_dimensionnement?: boolean;
  created_by_email?: string | null;
  created_at?: string;
}

const CATEGORY_LABEL: Record<Categorie, string> = {
  panneau_solaire: "Panneau solaire",
  batterie: "Batterie", 
  regulateur: "Régulateur",
  onduleur: "Onduleur",
  cable: "Câble",
  disjoncteur: "Disjoncteur",
  parafoudre: "Parafoudre",
  support: "Support",
  boitier_jonction: "Boîtier de jonction",
  connecteur: "Connecteur",
  monitoring: "Monitoring",
  autre: "Autre",
};



export default function AdminEquipmentApprovalPage() {
  const { admin, loading } = useAdminAuth();
  const { wrap, isBusy } = useLoading();
  
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [viewMode, setViewMode] = useState<"tous" | "approuves" | "non_approuves" | "entreprises">("tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<"Tous" | Categorie>("Tous");
  
  // États pour le modal
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [showModal, setShowModal] = useState(false);

  const authHeader = () => {
    const token = localStorage.getItem("adminAccessToken") || localStorage.getItem("accessToken");
    if (!token) throw new Error("Token manquant");
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  };


  const handleAvailabilityToggle = async (equipment: Equipment) => {
  try {
    const newStatus = !(equipment.disponible ?? true);
    const res = await fetchWithAdminAuth(`${API}/equipements/${equipment.id}/`, {
      method: "PATCH",
      headers: authHeader(),
      body: JSON.stringify({ disponible: newStatus }),
    });
    
    if (!res.ok) throw new Error("Mise à jour échouée");
    
    setEquipments(prev => 
      prev.map(e => 
        e.id === equipment.id 
          ? { ...e, disponible: newStatus }
          : e
      )
    );
    
    toast.success(
      newStatus 
        ? "Équipement marqué comme disponible" 
        : "Équipement marqué comme indisponible"
    );
  } catch (error) {
    toast.error("Erreur lors de la mise à jour");
  }
};

  useEffect(() => {
    if (loading || !admin) return;
    void loadEquipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, loading]);

  const loadEquipments = async () =>
    wrap(async () => {
      try {
        const res = await fetchWithAdminAuth(`${API}/equipements/`, {
          headers: authHeader(),
        });
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data: Equipment[] = await res.json();
        setEquipments(data);
      } catch (err: any) {
        toast.error("Erreur de chargement : " + (err?.message || "inconnue"));
      }
    }, "Chargement des équipements…");

  const handleApprovalToggle = async (equipment: Equipment) => {
    try {
      const newStatus = !equipment.approuve_dimensionnement;
      const res = await fetchWithAdminAuth(`${API}/equipements/${equipment.id}/approve/`, {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify({ approuve_dimensionnement: newStatus }),
      });
      
      if (!res.ok) throw new Error("Mise à jour échouée");
      
      setEquipments(prev => 
        prev.map(e => 
          e.id === equipment.id 
            ? { ...e, approuve_dimensionnement: newStatus }
            : e
        )
      );
      
      toast.success(
        newStatus 
          ? "Équipement approuvé pour le dimensionnement" 
          : "Équipement retiré du dimensionnement"
      );
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Gestionnaires du modal
  const handleRowClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleAddClick = () => {
    setSelectedEquipment(null);
    setModalMode("add");
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedEquipment(null);
  };

  const handleEquipmentUpdated = (equipment: Equipment) => {
    if (modalMode === "add") {
      setEquipments((prev) => [equipment, ...prev]);
    } else {
      setEquipments((prev) =>
        prev.map((e) => (e.id === equipment.id ? equipment : e))
      );
    }
  };

  const handleEquipmentDeleted = (id: number) => {
    setEquipments((prev) => prev.filter((e) => e.id !== id));
  };

  const filteredEquipments = useMemo(() => {
    return equipments.filter(equipment => {
      // Filtre par mode de vue
      if (viewMode === "approuves" && !equipment.approuve_dimensionnement) return false;
      if (viewMode === "non_approuves" && equipment.approuve_dimensionnement) return false;
      if (viewMode === "entreprises") {
        // Filtre pour les équipements créés par des entreprises (non-admin)
        const isFromEntreprise = equipment.created_by_email && !equipment.created_by_email.includes('admin');
        if (!isFromEntreprise) return false;
      }
      
      // Filtre par catégorie
      if (filterCategory !== "Tous" && equipment.categorie !== filterCategory) return false;
      
      // Filtre par recherche
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchSearch = 
          equipment.reference?.toLowerCase().includes(term) ||
          equipment.modele?.toLowerCase().includes(term) ||
          equipment.nom_commercial?.toLowerCase().includes(term) ||
          equipment.marque?.toLowerCase().includes(term) ||
          equipment.created_by_email?.toLowerCase().includes(term);
        if (!matchSearch) return false;
      }
      
      return true;
    });
  }, [equipments, viewMode, searchTerm, filterCategory]);

  const stats = useMemo(() => {
    const total = equipments.length;
    const approuves = equipments.filter(e => e.approuve_dimensionnement).length;
    const disponibles = equipments.filter(e => e.disponible).length;
    const entrepriseEquips = equipments.filter(e => e.created_by_email && !e.created_by_email.includes('admin')).length;
    return { total, approuves, disponibles, entrepriseEquips };
  }, [equipments]);

  const formatMGA = (n: number) =>
    new Intl.NumberFormat("fr-MG", {
      style: "currency", 
      currency: "MGA",
      maximumFractionDigits: 0,
    }).format(n || 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {!isBusy && <Spinner size={28} />}
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="p-8 max-w-screen-xl mx-auto">
      {/* Header avec statistiques */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 mb-4">
          <Icons.CheckCircle className="w-7 h-7 text-green-600" />
          Approbation des équipements
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-700">Total équipements</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approuves}</div>
            <div className="text-sm text-green-700">Approuvés</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.disponibles}</div>
            <div className="text-sm text-orange-700">Disponibles</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.entrepriseEquips}</div>
            <div className="text-sm text-purple-700">Par entreprises</div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setViewMode("tous")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "tous" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tous ({stats.total})
            </button>
            <button
              onClick={() => setViewMode("approuves")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "approuves" 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Approuvés ({stats.approuves})
            </button>
            <button
              onClick={() => setViewMode("non_approuves")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "non_approuves" 
                  ? "bg-red-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Non approuvés ({stats.total - stats.approuves})
            </button>
            <button
              onClick={() => setViewMode("entreprises")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "entreprises" 
                  ? "bg-purple-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Entreprises ({stats.entrepriseEquips})
            </button>
          </div>

          {/* Bouton d'ajout */}
          <button
            onClick={handleAddClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-700 transition-colors"
          >
            <Icons.Plus className="w-4 h-4" />
            Ajouter équipement
          </button>
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Rechercher..."
            className="px-4 py-2 border border-gray-300 rounded-lg w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg w-48"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as "Tous" | Categorie)}
          >
            <option value="Tous">Toutes catégories</option>
            {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm border rounded-md shadow">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-3 py-2 text-left">Catégorie</th>
              <th className="px-3 py-2 text-left">Référence</th>
              <th className="px-3 py-2 text-left">Modèle</th>
              <th className="px-3 py-2 text-left">Créé par</th>
              <th className="px-3 py-2 text-left">Spécs</th>
              <th className="px-3 py-2 text-left">Prix</th>
              <th className="px-3 py-2 text-left">Dispo</th>
              <th className="px-3 py-2 text-left">Dimensionnement</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEquipments.map((equip) => (
              <tr 
                key={equip.id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(equip)}
              >
                <td className="px-3 py-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {CATEGORY_LABEL[equip.categorie]}
                  </span>
                </td>
                <td className="px-3 py-2 font-medium">{equip.reference}</td>
                <td className="px-3 py-2">
                  <div>
                    <div className="font-medium">{equip.modele || equip.nom_commercial || "—"}</div>
                    {equip.marque && <div className="text-xs text-gray-500">{equip.marque}</div>}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs">
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    equip.created_by_email?.includes('admin') || !equip.created_by_email
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {equip.created_by_email || "Admin"}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-gray-600">
                  {equip.puissance_W && <div>{equip.puissance_W}W</div>}
                  {equip.capacite_Ah && <div>{equip.capacite_Ah}Ah</div>}
                  {equip.courant_A && <div>{equip.courant_A}A</div>}
                  {equip.section_mm2 && <div>{equip.section_mm2}mm²</div>}
                  {equip.tension_nominale_V && <div>{equip.tension_nominale_V}V</div>}
                </td>
                <td className="px-3 py-2 font-medium">{formatMGA(equip.prix_unitaire)}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    (equip.disponible ?? true)
                      ? "bg-emerald-100 text-emerald-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {(equip.disponible ?? true) ? "Oui" : "Non"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    equip.approuve_dimensionnement
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {equip.approuve_dimensionnement ? "Approuvé" : "En attente"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche l'ouverture du modal
                      handleApprovalToggle(equip);
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      equip.approuve_dimensionnement
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {equip.approuve_dimensionnement ? "Retirer" : "Approuver"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEquipments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Icons.AlertCircle className="mx-auto mb-2 w-6 h-6" />
          <p>Aucun équipement à afficher</p>
          {searchTerm && <p className="text-sm mt-2">Essayez de modifier vos critères de recherche</p>}
        </div>
      )}

      {/* Modal d'édition/ajout */}
      <EditEquipmentModal
        isOpen={showModal}
        onClose={handleModalClose}
        equipment={selectedEquipment}
        onUpdated={handleEquipmentUpdated}
        onDeleted={handleEquipmentDeleted}
        authHeader={authHeader}
        API={API}
        mode={modalMode}
      />
    </div>
  );
}