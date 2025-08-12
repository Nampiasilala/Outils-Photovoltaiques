'use client';

import { Dialog } from '@headlessui/react';
import { useMemo, useState } from 'react';
import { Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (equip: any) => void;
  authHeader: () => Record<string, string>;
  API: string;
}

type EquipType = 'Panneau solaire' | 'Batterie' | 'Régulateur' | 'Onduleur' | 'Câble';

const EQUIPMENT_TYPES: EquipType[] = ['Panneau solaire', 'Batterie', 'Régulateur', 'Onduleur', 'Câble'];

const mapCategorie = (t: EquipType) =>
  ({
    'Panneau solaire': 'panneau_solaire',
    'Batterie': 'batterie',
    'Régulateur': 'regulateur',
    'Onduleur': 'onduleur',
    'Câble': 'cable',
  }[t] || 'autre');

export default function AddEquipmentModal({ isOpen, onClose, onCreated, authHeader, API }: Props) {
  const [saving, setSaving] = useState(false);

  // Etat unique et simple; on ne montrera que ce qui est utile
  const [form, setForm] = useState({
    type_equipement: 'Panneau solaire' as EquipType,
    reference: '',
    marque: '',
    modele: '',
    nom_commercial: '',
    prix_unitaire: 0,
    devise: 'MGA',

    // communs/electriques
    puissance_W: null as number | null,
    capacite_Ah: null as number | null,
    tension_nominale_V: null as number | null,

    // panneau
    vmp_V: null as number | null,
    voc_V: null as number | null,

    // regulateur
    type_regulateur: 'MPPT', // 'MPPT' | 'PWM'
    courant_A: null as number | null,
    pv_voc_max_V: null as number | null,
    mppt_v_min_V: null as number | null,
    mppt_v_max_V: null as number | null,

    // onduleur
    puissance_surgeb_W: null as number | null,
    entree_dc_V: '',

    // cable
    section_mm2: null as number | null,
    ampacite_A: null as number | null,
  });

  const show = useMemo(() => {
    const t = form.type_equipement;
    return {
      // identite
      reference: true,
      marque: true,
      modele: true,
      nom_commercial: true,
      prix_unitaire: true,

      // champs par type
      panneau: t === 'Panneau solaire',
      batterie: t === 'Batterie',
      regulateur: t === 'Régulateur',
      onduleur: t === 'Onduleur',
      cable: t === 'Câble',
    };
  }, [form.type_equipement]);

  const handleChange = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));
  const numOrNull = (v: any) => (v === '' || v === null ? null : Number(v));

  // validation stricte minimale (par type)
  const validate = (): boolean => {
    const t = form.type_equipement;

    if (!form.reference.trim()) return toast.error('La référence est requise.'), false;
    if (!form.modele.trim() && !form.nom_commercial.trim())
      return toast.error('Renseignez au moins Modèle ou Nom commercial.'), false;
    if (form.prix_unitaire <= 0) return toast.error('Prix unitaire (MGA) invalide.'), false;

    if (t === 'Panneau solaire') {
      if (form.puissance_W == null) return toast.error('Puissance (W) requise pour un panneau.'), false;
      // tension_nominale_V utile pour PWM (si tu veux la demander)
    }
    if (t === 'Batterie') {
      if (form.capacite_Ah == null || form.tension_nominale_V == null)
        return toast.error('Capacité (Ah) et Tension nominale (V) sont requises pour une batterie.'), false;
    }
    if (t === 'Régulateur') {
      if (form.courant_A == null) return toast.error('Courant (A) requis pour un régulateur.'), false;
      if (!['MPPT', 'PWM'].includes(form.type_regulateur)) return toast.error('Type régulateur invalide.'), false;
    }
    if (t === 'Onduleur') {
      if (form.puissance_W == null) return toast.error('Puissance (W) requise pour un onduleur.'), false;
    }
    if (t === 'Câble') {
      if (form.section_mm2 == null || form.ampacite_A == null)
        return toast.error('Section (mm²) et Ampacité (A) sont requises pour un câble.'), false;
    }
    return true;
  };

  // ne garder que les champs utiles & non vides
  const buildPayload = () => {
    const t = form.type_equipement;
    const payload: Record<string, any> = {
      categorie: mapCategorie(t),
      reference: form.reference.trim(),
      marque: form.marque.trim() || undefined,
      modele: form.modele.trim(),
      nom_commercial: form.nom_commercial.trim() || undefined,
      prix_unitaire: Number(form.prix_unitaire),
      devise: form.devise || 'MGA',
      disponible: true,
    };

    // mapping par type -> champs requis/optionnels
    if (t === 'Panneau solaire') {
      payload.puissance_W = form.puissance_W;
      if (form.tension_nominale_V != null) payload.tension_nominale_V = form.tension_nominale_V;
      if (form.vmp_V != null) payload.vmp_V = form.vmp_V;
      if (form.voc_V != null) payload.voc_V = form.voc_V;
    }
    if (t === 'Batterie') {
      payload.capacite_Ah = form.capacite_Ah;
      payload.tension_nominale_V = form.tension_nominale_V;
    }
    if (t === 'Régulateur') {
      payload.type_regulateur = form.type_regulateur;
      payload.courant_A = form.courant_A;
      if (form.pv_voc_max_V != null) payload.pv_voc_max_V = form.pv_voc_max_V;
      if (form.mppt_v_min_V != null) payload.mppt_v_min_V = form.mppt_v_min_V;
      if (form.mppt_v_max_V != null) payload.mppt_v_max_V = form.mppt_v_max_V;
    }
    if (t === 'Onduleur') {
      payload.puissance_W = form.puissance_W;
      if (form.puissance_surgeb_W != null) payload.puissance_surgeb_W = form.puissance_surgeb_W;
      if (form.entree_dc_V.trim()) payload.entree_dc_V = form.entree_dc_V.trim();
    }
    if (t === 'Câble') {
      payload.section_mm2 = form.section_mm2;
      payload.ampacite_A = form.ampacite_A;
    }

    // supprimer les undefined/null
    Object.keys(payload).forEach((k) => {
      if (payload[k] === null || payload[k] === '') delete payload[k];
    });
    return payload;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = buildPayload();

      const res = await fetchWithAuth(`${API}/equipements/`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const created = await res.json();
      onCreated(created);
      toast.success('Équipement ajouté avec succès');

      // reset minimal
      setForm((p) => ({
        ...p,
        reference: '',
        marque: '',
        modele: '',
        nom_commercial: '',
        prix_unitaire: 0,
        puissance_W: null,
        capacite_Ah: null,
        tension_nominale_V: null,
        vmp_V: null,
        voc_V: null,
        type_regulateur: 'MPPT',
        courant_A: null,
        pv_voc_max_V: null,
        mppt_v_min_V: null,
        mppt_v_max_V: null,
        puissance_surgeb_W: null,
        entree_dc_V: '',
        section_mm2: null,
        ampacite_A: null,
      }));
      onClose();
    } catch (err: any) {
      toast.error(`Erreur : ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black/30 p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl space-y-4">
          <Dialog.Title className="text-lg font-semibold">Ajouter un équipement</Dialog.Title>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={form.type_equipement}
                onChange={(e) => handleChange('type_equipement', e.target.value as EquipType)}
                className="border p-2 rounded w-full"
              >
                {EQUIPMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Catégorie envoyée : {mapCategorie(form.type_equipement)}</p>
            </div>

            {/* Identité */}
            <div>
              <label className="block text-sm font-medium mb-1">Référence (SKU)</label>
              <input
                value={form.reference}
                onChange={(e) => handleChange('reference', e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Ex: PV-200-ABC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Modèle</label>
              <input
                value={form.modele}
                onChange={(e) => handleChange('modele', e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Ex: 200W Mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom commercial (optionnel)</label>
              <input
                value={form.nom_commercial}
                onChange={(e) => handleChange('nom_commercial', e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Ex: Panneau 200W Haute perf."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Marque (optionnel)</label>
              <input
                value={form.marque}
                onChange={(e) => handleChange('marque', e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Ex: SunBrand"
              />
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-medium mb-1">Prix unitaire (MGA)</label>
              <input
                type="number"
                min={0}
                value={form.prix_unitaire}
                onChange={(e) => handleChange('prix_unitaire', Number(e.target.value) || 0)}
                className="border p-2 rounded w-full"
              />
            </div>

            {/* Champs par type */}
            {show.panneau && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Puissance (W)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.puissance_W ?? ''}
                    onChange={(e) => handleChange('puissance_W', numOrNull(e.target.value))}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tension nominale (V) (optionnel)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.tension_nominale_V ?? ''}
                    onChange={(e) => handleChange('tension_nominale_V', numOrNull(e.target.value))}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vmp (V) (optionnel)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.vmp_V ?? ''}
                    onChange={(e) => handleChange('vmp_V', numOrNull(e.target.value))}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Voc (V) (optionnel)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.voc_V ?? ''}
                    onChange={(e) => handleChange('voc_V', numOrNull(e.target.value))}
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
                    value={form.capacite_Ah ?? ''}
                    onChange={(e) => handleChange('capacite_Ah', numOrNull(e.target.value))}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tension nominale (V)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.tension_nominale_V ?? ''}
                    onChange={(e) => handleChange('tension_nominale_V', numOrNull(e.target.value))}
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
                    onChange={(e) => handleChange('type_regulateur', e.target.value)}
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
                    value={form.courant_A ?? ''}
                    onChange={(e) => handleChange('courant_A', numOrNull(e.target.value))}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Voc PV max (V) (optionnel)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.pv_voc_max_V ?? ''}
                    onChange={(e) => handleChange('pv_voc_max_V', numOrNull(e.target.value))}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Plage MPPT min (V) (optionnel)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.mppt_v_min_V ?? ''}
                    onChange={(e) => handleChange('mppt_v_min_V', numOrNull(e.target.value))}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Plage MPPT max (V) (optionnel)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.mppt_v_max_V ?? ''}
                    onChange={(e) => handleChange('mppt_v_max_V', numOrNull(e.target.value))}
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
                    value={form.puissance_W ?? ''}
                    onChange={(e) => handleChange('puissance_W', numOrNull(e.target.value))}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Surge (W) (optionnel)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.puissance_surgeb_W ?? ''}
                    onChange={(e) => handleChange('puissance_surgeb_W', numOrNull(e.target.value))}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Entrée DC (ex: 12/24)</label>
                  <input
                    value={form.entree_dc_V}
                    onChange={(e) => handleChange('entree_dc_V', e.target.value)}
                    className="border p-2 rounded w-full"
                    placeholder="12 / 24 / 48"
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
                    value={form.section_mm2 ?? ''}
                    onChange={(e) => handleChange('section_mm2', numOrNull(e.target.value))}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ampacité (A)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.ampacite_A ?? ''}
                    onChange={(e) => handleChange('ampacite_A', numOrNull(e.target.value))}
                    className="border p-2 rounded w-full"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50" disabled={saving}>
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <Loader className="w-4 h-4 animate-spin" />}
              Ajouter
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
