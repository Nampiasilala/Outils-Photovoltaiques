"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { fetchWithAdminAuth } from "@/lib/fetchWithAdminAuth";
import { useAuth } from "@/components/AuthContext";
import { Icons } from "../../../src/assets/icons";
import { Spinner, useLoading } from "@/LoadingProvider";
import { env } from "@/lib/env";

const EditEquipmentModal = dynamic(
  () => import("@/components/admin/AddEquipmentModal"),
  { ssr: false }
);

const API = env.NEXT_PUBLIC_API_BASE_URL;

type Role = "Admin" | "Entreprise" | "Utilisateur" | "";

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
  vmp_V?: number | null;
  voc_V?: number | null;
  type_regulateur?: "MPPT" | "PWM" | null;
  courant_A?: number | null;
  pv_voc_max_V?: number | null;
  mppt_v_min_V?: number | null;
  mppt_v_max_V?: number | null;
  puissance_surgeb_W?: number | null;
  entree_dc_V?: string | null;
  section_mm2?: number | null;
  ampacite_A?: number | null;
  disponible?: boolean; // ← Propriété optionnelle pour compatibilité
  created_at?: string;
  created_by_email?: string | null;
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

const FILTER_CATEGORIES: Array<"Tous" | Categorie> = [
  "Tous",
  "panneau_solaire",
  "batterie",
  "regulateur",
  "onduleur",
  "cable",
  "autre",
];

export default function CompanyEquipmentsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { wrap, isBusy } = useLoading();
  const role = (user?.role || "") as Role;

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<"Tous" | Categorie>("Tous");
  const [pageLoading, setPageLoading] = useState(true);






const debugTokens = () => {
  const access = localStorage.getItem("accessToken");
  const adminAccess = localStorage.getItem("adminAccessToken");
  console.log("🔍 Tokens:", {
    accessToken: access?.substring(0, 20) + "...",
    adminAccessToken: adminAccess?.substring(0, 20) + "...",
    sameToken: access === adminAccess,
    userEmail: user?.email,
    userRole: user?.role
  });
};



  // ---------- Guard d'accès ----------
  useEffect(() => {
    if (loading) return;
    const r = (user?.role || "").toLowerCase();
    if (!user) {
      router.replace("/admin-login");
      return;
    }
    if (!["entreprise", "admin"].includes(r)) {
      toast.error("Accès refusé : cette page est réservée aux entreprises.");
      router.replace("/admin-login");
      return;
    }
  }, [user, loading, router]);

  const authHeader = () => {
    const token =
      localStorage.getItem("adminAccessToken") ||
      localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Session expirée");
      router.replace("/admin-login");
      throw new Error("Token manquant");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  useEffect(() => {
    if (loading || !user) return;
    void loadEquipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const loadEquipments = async () =>
    wrap(async () => {
      setPageLoading(true);
      try {
        const res = await fetchWithAdminAuth(`${API}/equipements/`, {
          headers: authHeader(),
        });
        if (res.status === 401) {
          router.replace("/admin-login");
          return;
        }
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data: Equipment[] = await res.json();
        
        // Pour les entreprises, filtrer seulement leurs équipements
        // (côté backend, l'API devrait déjà filtrer, mais on peut doubler la sécurité)
        setEquipments(data);
      } catch (err: any) {
        toast.error("Erreur de chargement : " + (err?.message || "inconnue"));
      } finally {
        setPageLoading(false);
      }
    }, "Chargement des équipements…");

  const formatMGA = (n: number) =>
    new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      maximumFractionDigits: 0,
    }).format(n || 0);

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

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return equipments.filter((e) => {
      const matchSearch =
        !term ||
        e.reference?.toLowerCase().includes(term) ||
        e.modele?.toLowerCase().includes(term) ||
        e.nom_commercial?.toLowerCase().includes(term) ||
        e.marque?.toLowerCase().includes(term) ||
        CATEGORY_LABEL[e.categorie].toLowerCase().includes(term);
      const matchCat =
        filterCategory === "Tous" ? true : e.categorie === filterCategory;
      return matchSearch && matchCat;
    });
  }, [equipments, searchTerm, filterCategory]);

  // Guard loading
  if (loading || pageLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {!isBusy && <Spinner size={28} />}
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-10 max-w-screen-xl mx-auto overflow-x-auto text-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900">
          <Icons.Wrench className="w-7 h-7 text-blue-600" />
          Mes équipements
        </h1>
        <div className="text-sm text-gray-500 mt-2">
          Connecté en tant que <b>{user?.email}</b> — rôle: <b>{user?.role}</b>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Icons.Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="pl-7 pr-2 py-2 border rounded-lg text-sm w-full sm:w-64"
              placeholder="Référence / Modèle / Catégorie…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Icons.Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="pl-7 pr-2 py-2 border rounded-lg text-sm w-full sm:w-52"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as "Tous" | Categorie)}
            >
              {FILTER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === "Tous" ? "Tous" : CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm w-1/3 sm:w-auto justify-center hover:bg-blue-700"
        >
          <Icons.Plus className="w-4 h-4" />
          <span>Ajouter</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm border rounded-md shadow">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-3 py-2 text-left">Catégorie</th>
              <th className="px-3 py-2 text-left">Référence</th>
              <th className="px-3 py-2 text-left">Modèle / Nom</th>
              <th className="px-3 py-2 text-left">Marque</th>
              <th className="px-3 py-2 text-left">Puissance (W)</th>
              <th className="px-3 py-2 text-left">Capacité (Ah)</th>
              <th className="px-3 py-2 text-left">Tension (V)</th>
              <th className="px-3 py-2 text-left">Courant (A)</th>
              <th className="px-3 py-2 text-left">Prix (MGA)</th>
              <th className="px-3 py-2 text-left">Disponibilité</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((equip) => (
              <tr 
                key={equip.id} 
                className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(equip)}
              >
                <td className="px-3 py-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {CATEGORY_LABEL[equip.categorie]}
                  </span>
                </td>
                <td className="px-3 py-2 font-medium">{equip.reference}</td>
                <td className="px-3 py-2">
                  {equip.modele || equip.nom_commercial || "—"}
                </td>
                <td className="px-3 py-2">{equip.marque || "—"}</td>
                <td className="px-3 py-2">{equip.puissance_W ?? "—"}</td>
                <td className="px-3 py-2">{equip.capacite_Ah ?? "—"}</td>
                <td className="px-3 py-2">{equip.tension_nominale_V ?? "—"}</td>
                <td className="px-3 py-2">{equip.courant_A ?? "—"}</td>
                <td className="px-3 py-2 font-medium">{formatMGA(equip.prix_unitaire)}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche l'ouverture du modal
                      handleAvailabilityToggle(equip);
                    }}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      (equip.disponible ?? true)
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {(equip.disponible ?? true) ? "Disponible" : "Indisponible"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Icons.Zap className="mx-auto mb-2 w-6 h-6" />
          <p>Aucun équipement à afficher</p>
          {equipments.length === 0 && (
            <p className="text-sm mt-2">Commencez par ajouter votre premier équipement</p>
          )}
        </div>
      )}

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