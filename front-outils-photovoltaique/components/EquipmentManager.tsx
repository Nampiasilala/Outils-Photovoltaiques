'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit, Search, Filter, Zap, Loader, XCircle } from 'lucide-react';
import DeleteAlert from './DeleteAlert';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'react-toastify';

interface Equipment {
  id: number;
  type_equipement: string; // Correspond à 'Panneau solaire', 'Batterie', etc.
  nom: string | null; // Utilisé pour la 'Référence' comme 'Panneau PK 523 KZ'
  categorie: string; // Gardé pour le champ 'categorie' du modèle Django, même si non édité directement ici
  puissance: number | null; // Peut être null selon votre modèle Django
  tension: number | null;   // Peut être null selon votre modèle Django
  capacite: number | null;  // Peut être null selon votre modèle Django
  prix_unitaire: number; // Requis, ne peut pas être null
}

// Assurez-vous que cette variable d'environnement est définie
const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function EquipmentManager() {
  const { user, logout } = useAuth();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Les types d'équipement possibles, alignés avec TYPE_CHOICES de votre modèle Django
  const EQUIPMENT_TYPES = ['Panneau solaire', 'Batterie', 'Régulateur', 'Onduleur'];
  const [filterCategory, setFilterCategory] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fonction pour obtenir l'en-tête d'autorisation
  const authHeader = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      logout();
      throw new Error('Token manquant');
    }
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  // Chargement des équipements au montage du composant ou changement d'utilisateur
  useEffect(() => {
    if (!user) return;
    loadEquipments();
  }, [user]);

  // Fonction de chargement des équipements depuis l'API
  const loadEquipments = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API}/equipements/`, { headers: authHeader() });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setEquipments(await res.json());
    } catch (err: any) {
      toast.error("Erreur de chargement : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ajouter un nouvel équipement
  const addEquipment = async () => {
    setSaving(true);
    try {
      // Payload initial avec des valeurs par défaut, aligné avec le modèle Django
      const payload = {
        type_equipement: 'Panneau solaire', // Type par défaut
        nom: '', // Référence par défaut vide
        categorie: 'Général', // Catégorie par défaut du modèle Django
        puissance: null, // Null pour les champs optionnels
        tension: null,   // Null pour les champs optionnels
        capacite: null,  // Null pour les champs optionnels
        prix_unitaire: 0 // 0 pour le prix unitaire requis
      };
      const res = await fetchWithAuth(`${API}/equipements/`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const created = await res.json();
      // Ajoute le nouvel équipement au début du tableau
      setEquipments((e) => [created, ...e]);
      setEditingId(created.id);
      toast.success('Équipement ajouté avec succès');
    } catch (err: any) {
      toast.error("Erreur lors de la création : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour sauvegarder les modifications d'un équipement
  const saveEquipment = async (equip: Equipment) => {
    setSaving(true);
    try {
      // Préparation du payload pour s'assurer que les champs numériques vides sont envoyés comme null ou 0
      const payloadToSend = {
        ...equip,
        puissance: equip.puissance === null || isNaN(equip.puissance) ? null : equip.puissance,
        tension: equip.tension === null || isNaN(equip.tension) ? null : equip.tension,
        capacite: equip.capacite === null || isNaN(equip.capacite) ? null : equip.capacite,
        prix_unitaire: isNaN(equip.prix_unitaire) ? 0 : equip.prix_unitaire, // Prix unitaire ne peut pas être null
      };

      const res = await fetchWithAuth(`${API}/equipements/${equip.id}/`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify(payloadToSend), // Utilise le payload nettoyé
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const updated = await res.json();
      setEquipments((e) => e.map(x => x.id === equip.id ? updated : x));
      setEditingId(null);
      toast.success('Équipement mis à jour avec succès');
    } catch (err: any) {
      toast.error("Erreur lors de la mise à jour : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour supprimer un équipement
  const deleteEquipment = async (id: number) => {
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
      setEquipments((e) => e.filter(x => x.id !== id));
      toast.success('Équipement supprimé avec succès');
    } catch (err: any) {
      toast.error("Erreur lors de la suppression : " + err.message);
    }
  };

  // Filtrage des équipements (recherche par type_equipement, filtrage par type_equipement)
  const filtered = equipments.filter(e =>
    e.type_equipement.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'Tous' || e.type_equipement === filterCategory)
  );

  // Affichage du loader pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto overflow-x-auto text-sm">
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            className="pl-7 pr-2 py-1 border rounded text-sm"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            className="pl-7 pr-2 py-1 border rounded text-sm"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option>Tous</option>
            {EQUIPMENT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <button
          onClick={addEquipment}
          disabled={saving}
          className="ml-auto bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
        >
          {saving ? <Loader className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>Ajouter</span>
        </button>
      </div>

      <table className="w-full table-auto text-sm border rounded-md overflow-hidden shadow">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-2 py-1">Type</th>
            <th className="px-2 py-1">Référence</th> {/* Changé de 'Catégorie Générique' à 'Référence' */}
            <th className="px-2 py-1">Puissance \(W\)</th>
            <th className="px-2 py-1">Tension \(V\)</th>
            <th className="px-2 py-1">Capacité</th>
            <th className="px-2 py-1">Prix \(Ar\)</th>
            <th className="px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filtered.map(equip => (
            <tr key={equip.id} className="border-b">
              <td className="px-2 py-1">
                {editingId === equip.id
                  ? <select
                      value={equip.type_equipement}
                      onChange={ev => { equip.type_equipement = ev.target.value; setEquipments([...equipments]); }}
                      className="border rounded p-1"
                    >
                      {EQUIPMENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  : equip.type_equipement
                }
              </td>
              <td className="px-2 py-1">
                {editingId === equip.id
                  ? <input
                      value={equip.nom || ''} // Lie au champ 'nom' de votre modèle
                      onChange={ev => { equip.nom = ev.target.value; setEquipments([...equipments]); }}
                      className="w-full border rounded p-1"
                    />
                  : equip.nom
                }
              </td>
              <td className="px-2 py-1">
                {editingId === equip.id
                  ? <input
                      type="number"
                      value={equip.puissance === null ? '' : equip.puissance} // Affiche vide si null
                      onChange={ev => { equip.puissance = ev.target.value === '' ? null : +ev.target.value; setEquipments([...equipments]); }}
                      className="w-16 border rounded p-1"
                    />
                  : equip.puissance
                }
              </td>
              <td className="px-2 py-1">
                {editingId === equip.id
                  ? <input
                      type="number"
                      value={equip.tension === null ? '' : equip.tension} // Affiche vide si null
                      onChange={ev => { equip.tension = ev.target.value === '' ? null : +ev.target.value; setEquipments([...equipments]); }}
                      className="w-16 border rounded p-1"
                    />
                  : equip.tension
                }
              </td>
              <td className="px-2 py-1">
                {editingId === equip.id
                  ? <input
                      type="number"
                      value={equip.capacite === null ? '' : equip.capacite} // Affiche vide si null
                      onChange={ev => { equip.capacite = ev.target.value === '' ? null : +ev.target.value; setEquipments([...equipments]); }}
                      className="w-16 border rounded p-1"
                    />
                  : equip.capacite
                }
              </td>
              <td className="px-2 py-1">
                {editingId === equip.id
                  ? <input
                      type="number"
                      value={equip.prix_unitaire}
                      onChange={ev => { equip.prix_unitaire = ev.target.value === '' ? 0 : +ev.target.value; setEquipments([...equipments]); }}
                      className="w-20 border rounded p-1"
                    />
                  : equip.prix_unitaire.toLocaleString()
                }
              </td>
              <td className="px-2 py-1 space-x-1">
                {editingId === equip.id
                  ? <>
                      <button onClick={() => saveEquipment(equip)} disabled={saving} className="text-green-600"><Save size={14} /></button>
                      <button onClick={() => setEditingId(null)} className="text-red-600"><XCircle size={14} /></button>
                    </>
                  : <>
                      <button onClick={() => setEditingId(equip.id)} className="text-blue-600"><Edit size={14} /></button>
                      <DeleteAlert label="Supprimer cet équipement ?" onConfirm={() => deleteEquipment(equip.id)} />
                    </>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Zap className="mx-auto mb-2 w-6 h-6" />
          <p>Aucun équipement à afficher</p>
        </div>
      )}
    </div>
  );
}
