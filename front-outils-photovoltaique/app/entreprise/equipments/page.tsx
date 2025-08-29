"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { fetchWithAdminAuth } from "@/lib/fetchWithAdminAuth";
import { useAuth } from "@/components/AuthContext";

type Role = "Admin" | "Entreprise" | "Utilisateur" | "";

type Equipement = {
  id: number;
  categorie: string;
  reference: string;
  marque?: string;
  modele?: string;
  nom_commercial?: string;
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
  sortie_ac_V?: string | null;
  frequence_Hz?: number | null;
  section_mm2?: number | null;
  ampacite_A?: number | null;
  disponible: boolean;
  created_at?: string;
  created_by_email?: string | null;
};

const CATEGORIES = [
  { value: "panneau_solaire", label: "Panneau solaire" },
  { value: "batterie", label: "Batterie" },
  { value: "regulateur", label: "Régulateur" },
  { value: "onduleur", label: "Onduleur" },
  { value: "cable", label: "Câble" },
  // autres catégories possibles, mais non couvertes par le mini-form ci-dessous
];

type FormState = Partial<Equipement> & { categorie: string; reference: string; prix_unitaire: number };

export default function CompanyEquipmentsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const role = (user?.role || "") as Role;

  const [items, setItems] = useState<Equipement[]>([]);
  const [busy, setBusy] = useState(false);

  // ---------- Guard d’accès ----------
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

  // ---------- Fetch liste ----------
  const load = async () => {
    try {
      const res = await fetchWithAdminAuth("/equipements/");
      if (!res.ok) throw new Error("Chargement impossible");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur inconnue");
    }
  };

  useEffect(() => {
    if (!loading && user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id]);

  // ---------- Formulaire création ----------
  const [form, setForm] = useState<FormState>({
    categorie: "",
    reference: "",
    prix_unitaire: 0,
    disponible: true,
    devise: "MGA",
  });

  const onChange = (name: keyof FormState, value: any) =>
    setForm((f) => ({ ...f, [name]: value }));

  const requiredByCategory = useMemo(() => {
    // Miroir de tes validations côté modèle:
    // - panneau_solaire: puissance_W
    // - batterie: capacite_Ah, tension_nominale_V
    // - regulateur: courant_A
    // - onduleur: puissance_W
    // - cable: ampacite_A, section_mm2
    switch (form.categorie) {
      case "panneau_solaire":
        return ["puissance_W"];
      case "batterie":
        return ["capacite_Ah", "tension_nominale_V"];
      case "regulateur":
        return ["courant_A"];
      case "onduleur":
        return ["puissance_W"];
      case "cable":
        return ["ampacite_A", "section_mm2"];
      default:
        return [];
    }
  }, [form.categorie]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.categorie || !form.reference) {
      toast.error("Catégorie et Référence sont requis");
      return;
    }
    // Vérifs minimales côté client
    for (const field of requiredByCategory) {
      // @ts-ignore
      const v = form[field];
      if (v === undefined || v === null || v === "" || Number(v) === 0) {
        toast.error(`Le champ requis '${field}' est manquant.`);
        return;
      }
    }

    setBusy(true);
    try {
      // Nettoyage: ne pas envoyer les champs vides/null
      const payload: Record<string, any> = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v === "" || v === null || v === undefined) return;
        payload[k] = typeof v === "string" && v.trim ? v.trim() : v;
      });

      const res = await fetchWithAdminAuth("/equipements/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Création échouée");
      }
      toast.success("Équipement créé");
      setForm({
        categorie: "",
        reference: "",
        prix_unitaire: 0,
        disponible: true,
        devise: "MGA",
      });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  };

  // ---------- Actions ligne ----------
  const remove = async (id: number) => {
    if (!confirm("Supprimer cet équipement ?")) return;
    try {
      const res = await fetchWithAdminAuth(`/equipements/${id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Suppression échouée");
      toast.success("Supprimé");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur inconnue");
    }
  };

  const toggleDisponible = async (row: Equipement) => {
    try {
      const res = await fetchWithAdminAuth(`/equipements/${row.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ disponible: !row.disponible }),
      });
      if (!res.ok) throw new Error("Mise à jour échouée");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur inconnue");
    }
  };

  // ---------- UI ----------
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {role === "Admin" ? "Gestion des équipements (vue Entreprise)" : "Mes équipements"}
        </h1>
        <div className="text-sm text-gray-500">
          Connecté en tant que <b>{user?.email}</b> — rôle: <b>{user?.role}</b>
        </div>
      </header>

      {/* Formulaire de création */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 className="font-semibold mb-4">Ajouter un équipement</h2>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-3">
            <label className="block text-sm text-gray-600 mb-1">Catégorie *</label>
            <select
              className="w-full border rounded p-2"
              value={form.categorie}
              onChange={(e) => onChange("categorie", e.target.value)}
            >
              <option value="">— Catégorie —</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-gray-600 mb-1">Référence (unique) *</label>
            <input
              className="w-full border rounded p-2"
              value={form.reference}
              onChange={(e) => onChange("reference", e.target.value)}
              placeholder="Ex: INV-3K-ABC"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-gray-600 mb-1">Nom commercial</label>
            <input
              className="w-full border rounded p-2"
              value={form.nom_commercial || ""}
              onChange={(e) => onChange("nom_commercial", e.target.value)}
              placeholder="Ex: Onduleur 3kW"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm text-gray-600 mb-1">Prix unitaire (MGA) *</label>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded p-2"
              value={form.prix_unitaire ?? 0}
              onChange={(e) => onChange("prix_unitaire", Number(e.target.value || 0))}
              placeholder="0"
            />
          </div>

          {/* Champs dynamiques selon catégorie */}
          {form.categorie === "panneau_solaire" && (
            <>
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-1">Puissance (W) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded p-2"
                  value={form.puissance_W ?? ""}
                  onChange={(e) => onChange("puissance_W", Number(e.target.value || 0))}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-1">Vmp (V)</label>
                <input
                  type="number"
                  step="0.001"
                  className="w-full border rounded p-2"
                  value={form.vmp_V ?? ""}
                  onChange={(e) => onChange("vmp_V", Number(e.target.value || 0))}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-1">Voc (V)</label>
                <input
                  type="number"
                  step="0.001"
                  className="w-full border rounded p-2"
                  value={form.voc_V ?? ""}
                  onChange={(e) => onChange("voc_V", Number(e.target.value || 0))}
                />
              </div>
            </>
          )}

          {form.categorie === "batterie" && (
            <>
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-1">Capacité (Ah) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded p-2"
                  value={form.capacite_Ah ?? ""}
                  onChange={(e) => onChange("capacite_Ah", Number(e.target.value || 0))}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-1">Tension nominale (V) *</label>
                <input
                  type="number"
                  step="0.001"
                  className="w-full border rounded p-2"
                  value={form.tension_nominale_V ?? ""}
                  onChange={(e) => onChange("tension_nominale_V", Number(e.target.value || 0))}
                />
              </div>
            </>
          )}

          {form.categorie === "regulateur" && (
            <>
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-1">Courant (A) *</label>
                <input
                  type="number"
                  step="0.001"
                  className="w-full border rounded p-2"
                  value={form.courant_A ?? ""}
                  onChange={(e) => onChange("courant_A", Number(e.target.value || 0))}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-1">Type</label>
                <select
                  className="w-full border rounded p-2"
                  value={form.type_regulateur ?? ""}
                  onChange={(e) => onChange("type_regulateur", e.target.value || null)}
                >
                  <option value="">—</option>
                  <option value="MPPT">MPPT</option>
                  <option value="PWM">PWM</option>
                </select>
              </div>
            </>
          )}

          {form.categorie === "onduleur" && (
            <>
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-1">Puissance (W) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded p-2"
                  value={form.puissance_W ?? ""}
                  onChange={(e) => onChange("puissance_W", Number(e.target.value || 0))}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-1">Entrée DC (ex: 12/24)</label>
                <input
                  className="w-full border rounded p-2"
                  value={form.entree_dc_V ?? ""}
                  onChange={(e) => onChange("entree_dc_V", e.target.value)}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-1">Sortie AC (V)</label>
                <input
                  className="w-full border rounded p-2"
                  value={form.sortie_ac_V ?? "230"}
                  onChange={(e) => onChange("sortie_ac_V", e.target.value)}
                />
              </div>
            </>
          )}

          {form.categorie === "cable" && (
            <>
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-1">Ampacité (A) *</label>
                <input
                  type="number"
                  step="0.001"
                  className="w-full border rounded p-2"
                  value={form.ampacite_A ?? ""}
                  onChange={(e) => onChange("ampacite_A", Number(e.target.value || 0))}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-1">Section (mm²) *</label>
                <input
                  type="number"
                  step="0.001"
                  className="w-full border rounded p-2"
                  value={form.section_mm2 ?? ""}
                  onChange={(e) => onChange("section_mm2", Number(e.target.value || 0))}
                />
              </div>
            </>
          )}

          <div className="md:col-span-2 flex items-center gap-2">
            <input
              id="disponible"
              type="checkbox"
              checked={!!form.disponible}
              onChange={(e) => onChange("disponible", e.target.checked)}
            />
            <label htmlFor="disponible" className="text-sm text-gray-700">Disponible</label>
          </div>

          <div className="md:col-span-12">
            <button
              disabled={busy}
              className="w-full md:w-auto px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </section>

      {/* Liste */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 className="font-semibold mb-3">Liste des équipements</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">ID</th>
                <th>Catégorie</th>
                <th>Référence</th>
                <th>Nom</th>
                <th>Prix</th>
                <th>Dispo</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{e.id}</td>
                  <td>{e.categorie}</td>
                  <td>{e.reference}</td>
                  <td>{e.nom_commercial || "-"}</td>
                  <td>{e.prix_unitaire?.toLocaleString?.() ?? e.prix_unitaire} {e.devise || "MGA"}</td>
                  <td>
                    <button
                      onClick={() => toggleDisponible(e)}
                      className={`px-2 py-1 rounded text-xs ${
                        e.disponible ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {e.disponible ? "Oui" : "Non"}
                    </button>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => remove(e.id)}
                      className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500">
                    Aucun équipement pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
