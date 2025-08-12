'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
const DeleteAlert = dynamic(() => import('./DeleteAlert'), { ssr: false });
const AddEquipmentModal = dynamic(() => import('./AddEquipmentModal'), { ssr: false });

import { Plus, Trash2, Save, Edit, Search, Filter, Zap, Loader, XCircle } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'react-toastify';

const API = process.env.NEXT_PUBLIC_API_BASE_URL!;

type Categorie =
  | 'panneau_solaire'
  | 'batterie'
  | 'regulateur'
  | 'onduleur'
  | 'cable'
  | 'disjoncteur'
  | 'parafoudre'
  | 'support'
  | 'boitier_jonction'
  | 'connecteur'
  | 'monitoring'
  | 'autre';

interface Equipment {
  id: number;
  categorie: Categorie;
  reference: string;
  marque?: string | null;
  modele?: string | null;
  nom_commercial?: string | null;
  prix_unitaire: number;
  devise?: string; // 'MGA' par défaut côté backend

  // génériques/électriques
  puissance_W?: number | null;          // PV/ond
  capacite_Ah?: number | null;          // batterie
  tension_nominale_V?: number | null;   // batt/panneau (PWM)

  // panneau
  vmp_V?: number | null;
  voc_V?: number | null;

  // régulateur
  type_regulateur?: 'MPPT' | 'PWM' | null;
  courant_A?: number | null;
  pv_voc_max_V?: number | null;
  mppt_v_min_V?: number | null;
  mppt_v_max_V?: number | null;

  // onduleur
  puissance_surgeb_W?: number | null;
  entree_dc_V?: string | null;

  // câble
  section_mm2?: number | null;
  ampacite_A?: number | null;
}

const CATEGORY_LABEL: Record<Categorie, string> = {
  panneau_solaire: 'Panneau solaire',
  batterie: 'Batterie',
  regulateur: 'Régulateur',
  onduleur: 'Onduleur',
  cable: 'Câble',
  disjoncteur: 'Disjoncteur',
  parafoudre: 'Parafoudre',
  support: 'Support',
  boitier_jonction: 'Boîtier de jonction',
  connecteur: 'Connecteur',
  monitoring: 'Monitoring',
  autre: 'Autre',
};

const FILTER_CATEGORIES: Array<'Tous' | Categorie> = [
  'Tous',
  'panneau_solaire',
  'batterie',
  'regulateur',
  'onduleur',
  'cable',
  'autre',
];

export default function EquipmentManager() {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { user, logout } = useAuth();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'Tous' | Categorie>('Tous');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const authHeader = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      logout();
      throw new Error('Token manquant');
    }
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    if (!user) return;
    void loadEquipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadEquipments = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API}/equipements/`, { headers: authHeader() });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data: Equipment[] = await res.json();
      setEquipments(data);
    } catch (err: any) {
      toast.error('Erreur de chargement : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ————— Helpers —————

  const formatMGA = (n: number) =>
    new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(n || 0);

  const isEditing = (id: number) => editingId === id;

  const sanitizeNumber = (v: any) => {
    if (v === '' || v === null || v === undefined) return null;
    const num = Number(v);
    return Number.isFinite(num) ? num : null;
  };

  // Ne PATCH que les champs pertinents et non vides
  const buildPatchPayload = (e: Equipment): Partial<Equipment> => {
    const p: Partial<Equipment> = {
      categorie: e.categorie,
      reference: e.reference?.trim(),
      marque: e.marque?.trim() || undefined,
      modele: e.modele?.trim() || undefined,
      nom_commercial: e.nom_commercial?.trim() || undefined,
      prix_unitaire: Number.isFinite(e.prix_unitaire) ? Number(e.prix_unitaire) : 0,
      devise: e.devise || 'MGA',
    };

    // Champs selon catégorie
    if (e.categorie === 'panneau_solaire') {
      p.puissance_W = sanitizeNumber(e.puissance_W);
      p.tension_nominale_V = sanitizeNumber(e.tension_nominale_V);
      p.vmp_V = sanitizeNumber(e.vmp_V);
      p.voc_V = sanitizeNumber(e.voc_V);
    }
    if (e.categorie === 'batterie') {
      p.capacite_Ah = sanitizeNumber(e.capacite_Ah);
      p.tension_nominale_V = sanitizeNumber(e.tension_nominale_V);
    }
    if (e.categorie === 'regulateur') {
      p.type_regulateur = e.type_regulateur || undefined;
      p.courant_A = sanitizeNumber(e.courant_A);
      p.pv_voc_max_V = sanitizeNumber(e.pv_voc_max_V);
      p.mppt_v_min_V = sanitizeNumber(e.mppt_v_min_V);
      p.mppt_v_max_V = sanitizeNumber(e.mppt_v_max_V);
    }
    if (e.categorie === 'onduleur') {
      p.puissance_W = sanitizeNumber(e.puissance_W);
      p.puissance_surgeb_W = sanitizeNumber(e.puissance_surgeb_W);
      p.entree_dc_V = e.entree_dc_V?.trim() || undefined;
    }
    if (e.categorie === 'cable') {
      p.section_mm2 = sanitizeNumber(e.section_mm2);
      p.ampacite_A = sanitizeNumber(e.ampacite_A);
    }

    // Supprime les null/undefined vides
    Object.keys(p).forEach((k) => {
      // @ts-ignore
      if (p[k] === null || p[k] === '') delete p[k];
    });
    return p;
  };

  const saveEquipment = async (equip: Equipment) => {
    setSaving(true);
    try {
      const payload = buildPatchPayload(equip);
      const res = await fetchWithAuth(`${API}/equipements/${equip.id}/`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const updated: Equipment = await res.json();
      setEquipments((arr) => arr.map((x) => (x.id === equip.id ? updated : x)));
      setEditingId(null);
      toast.success('Équipement mis à jour avec succès');
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour : ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteEquipment = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetchWithAuth(`${API}/equipements/${id}/`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setEquipments((e) => e.filter((x) => x.id !== id));
      toast.success('Équipement supprimé avec succès');
    } catch (err: any) {
      toast.error('Erreur lors de la suppression : ' + err.message);
    } finally {
      setDeletingId(null);
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
        CATEGORY_LABEL[e.categorie].toLowerCase().includes(term);
      const matchCat = filterCategory === 'Tous' ? true : e.categorie === filterCategory;
      return matchSearch && matchCat;
    });
  }, [equipments, searchTerm, filterCategory]);

  // ————— UI —————

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="py-6 max-w-screen-xl mx-auto overflow-x-auto text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="pl-7 pr-2 py-1 border rounded text-sm w-full sm:w-64"
              placeholder="Référence / Modèle / Catégorie…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="pl-7 pr-2 py-1 border rounded text-sm w-full sm:w-52"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as 'Tous' | Categorie)}
            >
              {FILTER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'Tous' ? 'Tous' : CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm w-1/3 sm:w-auto justify-center"
        >
          {saving ? <Loader className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
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
              <th className="px-3 py-2 text-left">Puissance (W)</th>
              <th className="px-3 py-2 text-left">Capacité (Ah)</th>
              <th className="px-3 py-2 text-left">Tension (V)</th>
              <th className="px-3 py-2 text-left">Courant (A)</th>
              <th className="px-3 py-2 text-left">Ampacité (A)</th>
              <th className="px-3 py-2 text-left">Prix (MGA)</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((equip) => {
              const editing = isEditing(equip.id);
              const set = (field: keyof Equipment, value: any) =>
                setEquipments((prev) =>
                  prev.map((x) => (x.id === equip.id ? { ...x, [field]: value } : x))
                );

              return (
                <tr key={equip.id} className="border-b">
                  {/* Catégorie */}
                  <td className="px-3 py-2">
                    {editing ? (
                      <select
                        value={equip.categorie}
                        onChange={(e) => set('categorie', e.target.value as Categorie)}
                        className="border rounded p-1"
                      >
                        {FILTER_CATEGORIES.filter((c) => c !== 'Tous').map((c) => (
                          <option key={c} value={c}>
                            {CATEGORY_LABEL[c]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      CATEGORY_LABEL[equip.categorie]
                    )}
                  </td>

                  {/* Référence */}
                  <td className="px-3 py-2">
                    {editing ? (
                      <input
                        value={equip.reference || ''}
                        onChange={(ev) => set('reference', ev.target.value)}
                        className="w-36 border rounded p-1"
                      />
                    ) : (
                      equip.reference
                    )}
                  </td>

                  {/* Modèle / Nom */}
                  <td className="px-3 py-2">
                    {editing ? (
                      <div className="flex gap-1">
                        <input
                          value={equip.modele || ''}
                          onChange={(ev) => set('modele', ev.target.value)}
                          className="w-40 border rounded p-1"
                          placeholder="Modèle"
                        />
                        <input
                          value={equip.nom_commercial || ''}
                          onChange={(ev) => set('nom_commercial', ev.target.value)}
                          className="w-40 border rounded p-1"
                          placeholder="Nom"
                        />
                      </div>
                    ) : (
                      <span>{equip.modele || equip.nom_commercial || '—'}</span>
                    )}
                  </td>

                  {/* Puissance W (PV/ond) */}
                  <td className="px-3 py-2">
                    {editing ? (
                      <input
                        type="number"
                        value={equip.puissance_W ?? ''}
                        onChange={(ev) => set('puissance_W', sanitizeNumber(ev.target.value))}
                        className="w-24 border rounded p-1"
                        disabled={!(equip.categorie === 'panneau_solaire' || equip.categorie === 'onduleur')}
                      />
                    ) : (
                      equip.puissance_W ?? '—'
                    )}
                  </td>

                  {/* Capacité Ah (batterie) */}
                  <td className="px-3 py-2">
                    {editing ? (
                      <input
                        type="number"
                        value={equip.capacite_Ah ?? ''}
                        onChange={(ev) => set('capacite_Ah', sanitizeNumber(ev.target.value))}
                        className="w-24 border rounded p-1"
                        disabled={equip.categorie !== 'batterie'}
                      />
                    ) : (
                      equip.capacite_Ah ?? '—'
                    )}
                  </td>

                  {/* Tension V (batt/panneau PWM) */}
                  <td className="px-3 py-2">
                    {editing ? (
                      <input
                        type="number"
                        value={equip.tension_nominale_V ?? ''}
                        onChange={(ev) => set('tension_nominale_V', sanitizeNumber(ev.target.value))}
                        className="w-24 border rounded p-1"
                        disabled={!(equip.categorie === 'batterie' || equip.categorie === 'panneau_solaire')}
                      />
                    ) : (
                      equip.tension_nominale_V ?? '—'
                    )}
                  </td>

                  {/* Courant A (régulateur) */}
                  <td className="px-3 py-2">
                    {editing ? (
                      <input
                        type="number"
                        value={equip.courant_A ?? ''}
                        onChange={(ev) => set('courant_A', sanitizeNumber(ev.target.value))}
                        className="w-24 border rounded p-1"
                        disabled={equip.categorie !== 'regulateur'}
                      />
                    ) : (
                      equip.courant_A ?? '—'
                    )}
                  </td>

                  {/* Ampacité A (câble) */}
                  <td className="px-3 py-2">
                    {editing ? (
                      <input
                        type="number"
                        value={equip.ampacite_A ?? ''}
                        onChange={(ev) => set('ampacite_A', sanitizeNumber(ev.target.value))}
                        className="w-24 border rounded p-1"
                        disabled={equip.categorie !== 'cable'}
                      />
                    ) : (
                      equip.ampacite_A ?? '—'
                    )}
                  </td>

                  {/* Prix */}
                  <td className="px-3 py-2">
                    {editing ? (
                      <input
                        type="number"
                        value={equip.prix_unitaire}
                        onChange={(ev) => set('prix_unitaire', Number(ev.target.value) || 0)}
                        className="w-28 border rounded p-1"
                      />
                    ) : (
                      formatMGA(equip.prix_unitaire)
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2 space-x-1">
                    {editing ? (
                      <>
                        <button onClick={() => saveEquipment(equip)} disabled={saving} className="text-green-600">
                          <Save size={14} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-red-600">
                          <XCircle size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingId(equip.id)} className="text-blue-600">
                          <Edit size={14} />
                        </button>
                        <DeleteAlert
                          label="Supprimer cet équipement ?"
                          onConfirm={() => deleteEquipment(equip.id)}
                          isLoading={deletingId === equip.id}
                        />
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Zap className="mx-auto mb-2 w-6 h-6" />
          <p>Aucun équipement à afficher</p>
        </div>
      )}

      <AddEquipmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={(e: Equipment) => setEquipments((prev) => [e, ...prev])}
        authHeader={authHeader}
        API={API}
      />
    </div>
  );
}
