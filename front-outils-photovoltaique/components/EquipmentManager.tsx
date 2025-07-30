'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit, Search, Filter, Zap, Loader, XCircle } from 'lucide-react';
import DeleteAlert from './DeleteAlert';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'react-toastify';

interface Equipment {
  id: number;
  type_equipement: string;
  categorie: string;
  puissance: number;
  tension: number;
  capacite: number;
  prix_unitaire: number;
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function EquipmentManager() {
  const { user, logout } = useAuth();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const authHeader = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { logout(); throw new Error('Token manquant'); }
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    if (!user) return;
    loadEquipments();
  }, [user]);

  const loadEquipments = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API}/equipements/`, { headers: authHeader() });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setEquipments(await res.json());
    } catch (err: any) {
      toast.error("Erreur de chargement : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addEquipment = async () => {
    setSaving(true);
    try {
      const payload = { type_equipement:'Panneau solaire', categorie:'Autres', puissance:0, tension:12, capacite:0, prix_unitaire:0 };
      const res = await fetchWithAuth(`${API}/equipements/`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(payload),
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const created = await res.json();
      setEquipments((e) => [...e, created]);
      setEditingId(created.id);
      toast.success('Équipement ajouté avec succès');
    } catch (err: any) {
      toast.error("Erreur lors de la création : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveEquipment = async (equip: Equipment) => {
    setSaving(true);
    try {
      const res = await fetchWithAuth(`${API}/equipements/${equip.id}/`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify(equip),
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const updated = await res.json();
      setEquipments((e) => e.map(x => x.id===equip.id?updated:x));
      setEditingId(null);
      toast.success('Équipement mis à jour avec succès');
    } catch (err: any) {
      toast.error("Erreur lors de la mise à jour : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteEquipment = async (id: number) => {
    
    try {
      const res = await fetchWithAuth(`${API}/equipements/${id}/`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setEquipments((e) => e.filter(x => x.id !== id));
      toast.success('Équipement supprimé avec succès');
    } catch (err: any) {
      toast.error("Erreur lors de la suppression : " + err.message);
    }
  };

  const filtered = equipments.filter(e => 
    e.type_equipement.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory==='Tous' || e.categorie===filterCategory)
  );

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
            onChange={e=>setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            className="pl-7 pr-2 py-1 border rounded text-sm"
            value={filterCategory}
            onChange={e=>setFilterCategory(e.target.value)}
          >
            <option>Tous</option>
            <option>Éclairage</option>
            <option>Électroménager</option>
            <option>Informatique</option>
            <option>Climatisation</option>
            <option>Sécurité</option>
            <option>Autres</option>
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
            <th className="px-2 py-1">Catégorie</th>
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
                {editingId===equip.id
                  ? <input
                      value={equip.type_equipement}
                      onChange={ev=>{equip.type_equipement=ev.target.value; setEquipments([...equipments]);}}
                      className="w-full border rounded p-1"
                    />
                  : equip.type_equipement
                }
              </td>
              <td className="px-2 py-1">
                {editingId===equip.id
                  ? <select
                      value={equip.categorie}
                      onChange={ev=>{equip.categorie=ev.target.value; setEquipments([...equipments]);}}
                      className="border rounded p-1"
                    >
                      <option>Éclairage</option>
                      <option>Électroménager</option>
                      <option>Informatique</option>
                      <option>Climatisation</option>
                      <option>Sécurité</option>
                      <option>Autres</option>
                    </select>
                  : equip.categorie
                }
              </td>
              <td className="px-2 py-1">
                {editingId===equip.id
                  ? <input
                      type="number"
                      value={equip.puissance}
                      onChange={ev=>{equip.puissance=+ev.target.value; setEquipments([...equipments]);}}
                      className="w-16 border rounded p-1"
                    />
                  : equip.puissance
                }
              </td>
              <td className="px-2 py-1">
                {editingId===equip.id
                  ? <input
                      type="number"
                      value={equip.tension}
                      onChange={ev=>{equip.tension=+ev.target.value; setEquipments([...equipments]);}}
                      className="w-16 border rounded p-1"
                    />
                  : equip.tension
                }
              </td>
              <td className="px-2 py-1">
                {editingId===equip.id
                  ? <input
                      type="number"
                      value={equip.capacite}
                      onChange={ev=>{equip.capacite=+ev.target.value; setEquipments([...equipments]);}}
                      className="w-16 border rounded p-1"
                    />
                  : equip.capacite
                }
              </td>
              <td className="px-2 py-1">
                {editingId===equip.id
                  ? <input
                      type="number"
                      value={equip.prix_unitaire}
                      onChange={ev=>{equip.prix_unitaire=+ev.target.value; setEquipments([...equipments]);}}
                      className="w-20 border rounded p-1"
                    />
                  : equip.prix_unitaire.toLocaleString()
                }
              </td>
              <td className="px-2 py-1 space-x-1">
                {editingId===equip.id
                  ? <>
                      <button onClick={()=>saveEquipment(equip)} disabled={saving} className="text-green-600"><Save size={14} /></button>
                      <button onClick={()=>setEditingId(null)} className="text-red-600"><XCircle size={14} /></button>
                    </>
                  : <>
                      <button onClick={()=>setEditingId(equip.id)} className="text-blue-600"><Edit size={14} /></button>
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
