// Code mis à jour dans AddEquipmentModal.tsx

'use client';

import { Dialog } from '@headlessui/react';
import { useState } from 'react';
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

export default function AddEquipmentModal({ isOpen, onClose, onCreated, authHeader, API }: Props) {
  const [form, setForm] = useState({
    type_equipement: 'Panneau solaire',
    modele: '',
    nom: '',
    categorie: 'Général',
    puissance: null as number | null,
    tension: null as number | null,
    capacite: null as number | null,
    prix_unitaire: 0,
  });

  const [saving, setSaving] = useState(false);
  const EQUIPMENT_TYPES = ['Panneau solaire', 'Batterie', 'Régulateur', 'Onduleur'];

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateFields = () => {
    const { type_equipement, modele, prix_unitaire, puissance, tension, capacite } = form;

    if (!modele.trim()) {
      toast.error('Le modèle est requis.');
      return false;
    }
    if (prix_unitaire <= 0) {
      toast.error('Prix unitaire invalide.');
      return false;
    }
    if (puissance === null && tension === null && capacite === null) {
      toast.error('Fournissez au moins une valeur technique.');
      return false;
    }
    if (type_equipement === 'Batterie' && (tension === null || capacite === null)) {
      toast.error('Les batteries doivent avoir une tension et une capacité.');
      return false;
    }
    if (type_equipement === 'Panneau solaire' && (puissance === null || tension === null)) {
      toast.error('Les panneaux solaires requièrent une puissance et une tension.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;
    setSaving(true);
    try {
      const res = await fetchWithAuth(`${API}/equipements/`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ ...form, nom: '' }),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const created = await res.json();
      onCreated(created);
      toast.success('Équipement ajouté');
      onClose();
    } catch (err: any) {
      toast.error("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black/30 p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
          <Dialog.Title className="text-lg font-semibold">Ajouter un équipement</Dialog.Title>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type_equipement}
                onChange={(e) => handleChange('type_equipement', e.target.value)}
                className="border p-2 rounded w-full"
              >
                {EQUIPMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
              <input
                type="text"
                value={form.modele}
                onChange={(e) => handleChange('modele', e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Puissance (W)</label>
              <input
                type="number"
                value={form.puissance ?? ''}
                onChange={(e) => handleChange('puissance', e.target.value === '' ? null : +e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tension (V)</label>
              <input
                type="number"
                value={form.tension ?? ''}
                onChange={(e) => handleChange('tension', e.target.value === '' ? null : +e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
              <input
                type="number"
                value={form.capacite ?? ''}
                onChange={(e) => handleChange('capacite', e.target.value === '' ? null : +e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (Ar)</label>
              <input
                type="number"
                value={form.prix_unitaire}
                onChange={(e) => handleChange('prix_unitaire', +e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
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
