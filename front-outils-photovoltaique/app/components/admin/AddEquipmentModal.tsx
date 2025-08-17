// app/admin/equipments/EditEquipmentModal.tsx
"use client";

import { Dialog } from "@headlessui/react";
import { useMemo, useState, useEffect } from "react";
import { Loader, X } from "lucide-react";
import { toast } from "react-toastify";
import { fetchWithAdminAuth } from "@/lib/fetchWithAdminAuth";
import dynamic from "next/dynamic";
import { Icons } from "../../../src/assets/icons";

const DeleteAlert = dynamic(() => import("@/components/DeleteAlert"), {
  ssr: false,
});

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
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  onUpdated: (equip: Equipment) => void;
  onDeleted?: (id: number) => void;
  authHeader: () => Record<string, string>;
  API: string;
  mode: "add" | "edit";
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

type EquipType = "Panneau solaire" | "Batterie" | "Régulateur" | "Onduleur" | "Câble";

const EQUIPMENT_TYPES: EquipType[] = ["Panneau solaire", "Batterie", "Régulateur", "Onduleur", "Câble"];

const mapCategorie = (t: EquipType): Categorie =>
  ({
    "Panneau solaire": "panneau_solaire",
    Batterie: "batterie",
    "Régulateur": "regulateur",
    Onduleur: "onduleur",
    "Câble": "cable",
  }[t] || "autre") as Categorie;

const reverseMapCategorie = (cat: Categorie): EquipType => {
  const map: Record<string, EquipType> = {
    panneau_solaire: "Panneau solaire",
    batterie: "Batterie",
    regulateur: "Régulateur",
    onduleur: "Onduleur",
    cable: "Câble",
  };
  return map[cat] || "Panneau solaire";
};

export default function EditEquipmentModal({
  isOpen,
  onClose,
  equipment,
  onUpdated,
  onDeleted,
  authHeader,
  API,
  mode,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    type_equipement: "Panneau solaire" as EquipType,
    reference: "",
    marque: "",
    modele: "",
    nom_commercial: "",
    prix_unitaire: 0,
    devise: "MGA",
    puissance_W: null as number | null,
    capacite_Ah: null as number | null,
    tension_nominale_V: null as number | null,
    vmp_V: null as number | null,
    voc_V: null as number | null,
    type_regulateur: "MPPT" as "MPPT" | "PWM",
    courant_A: null as number | null,
    pv_voc_max_V: null as number | null,
    mppt_v_min_V: null as number | null,
    mppt_v_max_V: null as number | null,
    puissance_surgeb_W: null as number | null,
    entree_dc_V: "",
    section_mm2: null as number | null,
    ampacite_A: null as number | null,
  });

  // Initialiser le formulaire avec les données de l'équipement
  useEffect(() => {
    if (equipment && mode === "edit") {
      setForm({
        type_equipement: reverseMapCategorie(equipment.categorie),
        reference: equipment.reference || "",
        marque: equipment.marque || "",
        modele: equipment.modele || "",
        nom_commercial: equipment.nom_commercial || "",
        prix_unitaire: equipment.prix_unitaire || 0,
        devise: equipment.devise || "MGA",
        puissance_W: equipment.puissance_W ?? null,
        capacite_Ah: equipment.capacite_Ah ?? null,
        tension_nominale_V: equipment.tension_nominale_V ?? null,
        vmp_V: equipment.vmp_V ?? null,
        voc_V: equipment.voc_V ?? null,
        type_regulateur: equipment.type_regulateur || "MPPT",
        courant_A: equipment.courant_A ?? null,
        pv_voc_max_V: equipment.pv_voc_max_V ?? null,
        mppt_v_min_V: equipment.mppt_v_min_V ?? null,
        mppt_v_max_V: equipment.mppt_v_max_V ?? null,
        puissance_surgeb_W: equipment.puissance_surgeb_W ?? null,
        entree_dc_V: equipment.entree_dc_V || "",
        section_mm2: equipment.section_mm2 ?? null,
        ampacite_A: equipment.ampacite_A ?? null,
      });
      setIsEditing(false);
    } else if (mode === "add") {
      // Réinitialiser pour l'ajout
      setForm({
        type_equipement: "Panneau solaire",
        reference: "",
        marque: "",
        modele: "",
        nom_commercial: "",
        prix_unitaire: 0,
        devise: "MGA",
        puissance_W: null,
        capacite_Ah: null,
        tension_nominale_V: null,
        vmp_V: null,
        voc_V: null,
        type_regulateur: "MPPT",
        courant_A: null,
        pv_voc_max_V: null,
        mppt_v_min_V: null,
        mppt_v_max_V: null,
        puissance_surgeb_W: null,
        entree_dc_V: "",
        section_mm2: null,
        ampacite_A: null,
      });
      setIsEditing(true);
    }
  }, [equipment, mode]);

  const show = useMemo(() => {
    const t = form.type_equipement;
    return {
      reference: true,
      marque: true,
      modele: true,
      nom_commercial: true,
      prix_unitaire: true,
      panneau: t === "Panneau solaire",
      batterie: t === "Batterie",
      regulateur: t === "Régulateur",
      onduleur: t === "Onduleur",
      cable: t === "Câble",
    };
  }, [form.type_equipement]);

  const handleChange = (field: string, value: any) =>
    setForm((p) => ({ ...p, [field]: value }));
  
  const numOrNull = (v: any) => (v === "" || v === null ? null : Number(v));

  const validate = (): boolean => {
    const t = form.type_equipement;

    if (!form.reference.trim()) return toast.error("La référence est requise."), false;
    if (!form.modele.trim() && !form.nom_commercial.trim())
      return toast.error("Renseignez au moins Modèle ou Nom commercial."), false;
    if (form.prix_unitaire <= 0) return toast.error("Prix unitaire (MGA) invalide."), false;

    if (t === "Panneau solaire") {
      if (form.puissance_W == null) return toast.error("Puissance (W) requise pour un panneau."), false;
    }
    if (t === "Batterie") {
      if (form.capacite_Ah == null || form.tension_nominale_V == null)
        return toast.error("Capacité (Ah) et Tension nominale (V) sont requises pour une batterie."), false;
    }
    if (t === "Régulateur") {
      if (form.courant_A == null) return toast.error("Courant (A) requis pour un régulateur."), false;
      if (!["MPPT", "PWM"].includes(form.type_regulateur)) return toast.error("Type régulateur invalide."), false;
    }
    if (t === "Onduleur") {
      if (form.puissance_W == null) return toast.error("Puissance (W) requise pour un onduleur."), false;
    }
    if (t === "Câble") {
      if (form.section_mm2 == null || form.ampacite_A == null)
        return toast.error("Section (mm²) et Ampacité (A) sont requises pour un câble."), false;
    }
    return true;
  };

  const buildPayload = () => {
    const t = form.type_equipement;
    const payload: Record<string, any> = {
      categorie: mapCategorie(t),
      reference: form.reference.trim(),
      marque: form.marque.trim() || undefined,
      modele: form.modele.trim(),
      nom_commercial: form.nom_commercial.trim() || undefined,
      prix_unitaire: Number(form.prix_unitaire),
      devise: form.devise || "MGA",
      disponible: true,
    };

    if (t === "Panneau solaire") {
      payload.puissance_W = form.puissance_W;
      if (form.tension_nominale_V != null) payload.tension_nominale_V = form.tension_nominale_V;
      if (form.vmp_V != null) payload.vmp_V = form.vmp_V;
      if (form.voc_V != null) payload.voc_V = form.voc_V;
    }
    if (t === "Batterie") {
      payload.capacite_Ah = form.capacite_Ah;
      payload.tension_nominale_V = form.tension_nominale_V;
    }
    if (t === "Régulateur") {
      payload.type_regulateur = form.type_regulateur;
      payload.courant_A = form.courant_A;
      if (form.pv_voc_max_V != null) payload.pv_voc_max_V = form.pv_voc_max_V;
      if (form.mppt_v_min_V != null) payload.mppt_v_min_V = form.mppt_v_min_V;
      if (form.mppt_v_max_V != null) payload.mppt_v_max_V = form.mppt_v_max_V;
    }
    if (t === "Onduleur") {
      payload.puissance_W = form.puissance_W;
      if (form.puissance_surgeb_W != null) payload.puissance_surgeb_W = form.puissance_surgeb_W;
      if (form.entree_dc_V.trim()) payload.entree_dc_V = form.entree_dc_V.trim();
    }
    if (t === "Câble") {
      payload.section_mm2 = form.section_mm2;
      payload.ampacite_A = form.ampacite_A;
    }

    Object.keys(payload).forEach((k) => {
      if (payload[k] === null || payload[k] === "") delete payload[k];
    });
    return payload;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = buildPayload();
      const isUpdate = mode === "edit" && equipment;
      
      const res = await fetchWithAdminAuth(
        isUpdate ? `${API}/equipements/${equipment.id}/` : `${API}/equipements/`,
        {
          method: isUpdate ? "PATCH" : "POST",
          headers: { ...authHeader(), "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const result = await res.json();
      
      onUpdated(result);
      toast.success(isUpdate ? "Équipement modifié avec succès" : "Équipement ajouté avec succès");
      onClose();
    } catch (err: any) {
      toast.error(`Erreur : ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!equipment || !onDeleted) return;
    
    setDeleting(true);
    try {
      const res = await fetchWithAdminAuth(`${API}/equipements/${equipment.id}/`, {
        method: "DELETE",
        headers: authHeader(),
      });
      
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      
      onDeleted(equipment.id);
      toast.success("Équipement supprimé avec succès");
      onClose();
    } catch (err: any) {
      toast.error(`Erreur lors de la suppression : ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const formatMGA = (n: number) =>
    new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      maximumFractionDigits: 0,
    }).format(n || 0);

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black/30 p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center">
            <Dialog.Title className="text-lg font-semibold">
              {mode === "add" ? "Ajouter un équipement" : "Détails de l'équipement"}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <Icons.XCircle className="w-5 h-5" />
            </button>
          </div>

          {mode === "edit" && !isEditing && equipment && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {CATEGORY_LABEL[equipment.categorie]}
                </div>
                <div>
                  <span className="font-medium">Référence:</span> {equipment.reference}
                </div>
                <div>
                  <span className="font-medium">Modèle:</span> {equipment.modele || "—"}
                </div>
                {equipment.nom_commercial && (
                  <div>
                    <span className="font-medium">Nom commercial:</span> {equipment.nom_commercial}
                  </div>
                )}
                {equipment.marque && (
                  <div>
                    <span className="font-medium">Marque:</span> {equipment.marque}
                  </div>
                )}
                <div>
                  <span className="font-medium">Prix:</span> {formatMGA(equipment.prix_unitaire)}
                </div>
                {equipment.puissance_W && (
                  <div>
                    <span className="font-medium">Puissance:</span> {equipment.puissance_W} W
                  </div>
                )}
                {equipment.capacite_Ah && (
                  <div>
                    <span className="font-medium">Capacité:</span> {equipment.capacite_Ah} Ah
                  </div>
                )}
                {equipment.tension_nominale_V && (
                  <div>
                    <span className="font-medium">Tension:</span> {equipment.tension_nominale_V} V
                  </div>
                )}
                {equipment.courant_A && (
                  <div>
                    <span className="font-medium">Courant:</span> {equipment.courant_A} A
                  </div>
                )}
                {equipment.type_regulateur && (
                  <div>
                    <span className="font-medium">Type régulateur:</span> {equipment.type_regulateur}
                  </div>
                )}
                {equipment.section_mm2 && (
                  <div>
                    <span className="font-medium">Section:</span> {equipment.section_mm2} mm²
                  </div>
                )}
                {equipment.ampacite_A && (
                  <div>
                    <span className="font-medium">Ampacité:</span> {equipment.ampacite_A} A
                  </div>
                )}
                {equipment.entree_dc_V && (
                  <div>
                    <span className="font-medium">Entrée DC:</span> {equipment.entree_dc_V} V
                  </div>
                )}
              </div>
            </div>
          )}

          {(isEditing || mode === "add") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Type d'équipement</label>
                <select
                  value={form.type_equipement}
                  onChange={(e) => handleChange("type_equipement", e.target.value as EquipType)}
                  className="border p-2 rounded w-full"
                  disabled={mode === "edit"}
                >
                  {EQUIPMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {mode === "edit" && (
                  <p className="text-xs text-gray-500 mt-1">Le type ne peut pas être modifié</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Référence (SKU) <span className="text-red-500">*</span></label>
                <input
                  value={form.reference}
                  onChange={(e) => handleChange("reference", e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Ex: PV-200-ABC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Modèle <span className="text-red-500">*</span></label>
                <input
                  value={form.modele}
                  onChange={(e) => handleChange("modele", e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Ex: 200W Mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom commercial</label>
                <input
                  value={form.nom_commercial}
                  onChange={(e) => handleChange("nom_commercial", e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Ex: Panneau 200W"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Marque</label>
                <input
                  value={form.marque}
                  onChange={(e) => handleChange("marque", e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Ex: SunBrand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prix unitaire (MGA) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={0}
                  value={form.prix_unitaire}
                  onChange={(e) => handleChange("prix_unitaire", Number(e.target.value) || 0)}
                  className="border p-2 rounded w-full"
                />
              </div>

              {/* Champs spécifiques selon le type */}
              {show.panneau && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Puissance (W)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.puissance_W ?? ""}
                      onChange={(e) => handleChange("puissance_W", numOrNull(e.target.value))}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tension nominale (V)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.tension_nominale_V ?? ""}
                      onChange={(e) => handleChange("tension_nominale_V", numOrNull(e.target.value))}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vmp (V)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.vmp_V ?? ""}
                      onChange={(e) => handleChange("vmp_V", numOrNull(e.target.value))}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Voc (V)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.voc_V ?? ""}
                      onChange={(e) => handleChange("voc_V", numOrNull(e.target.value))}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                </>
              )}

              {show.batterie && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Capacité (Ah)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.capacite_Ah ?? ""}
                      onChange={(e) => handleChange("capacite_Ah", numOrNull(e.target.value))}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tension nominale (V)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.tension_nominale_V ?? ""}
                      onChange={(e) => handleChange("tension_nominale_V", numOrNull(e.target.value))}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                </>
              )}

              {show.regulateur && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={form.type_regulateur}
                      onChange={(e) => handleChange("type_regulateur", e.target.value)}
                      className="border p-2 rounded w-full"
                    >
                      <option value="MPPT">MPPT</option>
                      <option value="PWM">PWM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Courant (A)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.courant_A ?? ""}
                      onChange={(e) => handleChange("courant_A", numOrNull(e.target.value))}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                </>
              )}

              {show.onduleur && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Puissance (W)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.puissance_W ?? ""}
                      onChange={(e) => handleChange("puissance_W", numOrNull(e.target.value))}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Surge (W)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.puissance_surgeb_W ?? ""}
                      onChange={(e) => handleChange("puissance_surgeb_W", numOrNull(e.target.value))}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                </>
              )}

              {show.cable && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Section (mm²)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.section_mm2 ?? ""}
                      onChange={(e) => handleChange("section_mm2", numOrNull(e.target.value))}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ampacité (A)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.ampacite_A ?? ""}
                      onChange={(e) => handleChange("ampacite_A", numOrNull(e.target.value))}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {(isEditing || mode === "add") && (
            <div className="text-xs text-gray-500 italic">
              <span className="text-red-500">* Champs obligatoires</span>
            </div>
          )}

          <div className="flex justify-between gap-2 pt-4">
            <div>
              {mode === "edit" && equipment && !isEditing && (
                <DeleteAlert
                  label="Supprimer cet équipement ?"
                  onConfirm={handleDelete}
                  isLoading={deleting}
                />
              )}
            </div>
            
            <div className="flex gap-2">
              {mode === "edit" && !isEditing ? (
                <>
                  <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">
                    Fermer
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Modifier
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => mode === "edit" ? setIsEditing(false) : onClose()} 
                    className="px-4 py-2 border rounded hover:bg-gray-50" 
                    disabled={saving}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving && <Loader className="w-4 h-4 animate-spin" />}
                    {mode === "add" ? "Ajouter" : "Enregistrer"}
                  </button>
                </>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}