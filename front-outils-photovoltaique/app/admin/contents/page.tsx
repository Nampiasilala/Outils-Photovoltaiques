// app/admin/contents/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Save,
  Edit,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Zap,
  Settings,
  Globe,
  Eye,
  X,
} from "lucide-react";
import { fetchWithAdminAuth } from "@/lib/fetchWithAdminAuth";
import { toast } from "react-toastify"; // ✅ on garde toast direct
// ❌ ne PAS réimporter le CSS ici (le Toaster global le fait déjà)
import { useLoading, Spinner } from "@/LoadingProvider"; // ✅ overlay + icône

// ------------------------ Types ------------------------
interface HelpContent {
  id: number;
  key: string;
  title: string;
  body_html: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// -------------------- Champs prédéfinis --------------------
const PREDEFINED_FIELDS = [
  {
    key: "e_jour",
    title: "Consommation journalière",
    description: "Énergie consommée par jour",
    unit: "Wh",
    icon: Zap,
    color: "yellow",
    category: "Consommation",
    placeholder: "Ex: 1520",
    defaultHelp:
      "Somme de l'énergie consommée par vos appareils sur 24h.\n\nExemple : 2 ampoules de 10W pendant 5h = 2 × 10 × 5 = 100Wh\n\nAstuce : Additionnez chaque appareil (puissance × durée).",
  },
  {
    key: "p_max",
    title: "Puissance maximale",
    description: "Pic de puissance simultané",
    unit: "W",
    icon: Zap,
    color: "orange",
    category: "Consommation",
    placeholder: "Ex: 400",
    defaultHelp:
      "Puissance maximale utilisée simultanément.\n\nExemple : fer 1000W + TV 200W en même temps = 1200W\n\nImportant : Identifiez vos appareils les plus gourmands qui peuvent tourner ensemble.",
  },
  {
    key: "n_autonomie",
    title: "Jours d'autonomie",
    description: "Jours sans soleil couverts",
    unit: "jours",
    icon: Settings,
    color: "purple",
    category: "Configuration",
    placeholder: "Ex: 3",
    defaultHelp:
      "Nombre de jours sans soleil pendant lesquels le système doit continuer à fonctionner.\n\nRecommandations :\n• Région ensoleillée : 2-3 jours\n• Région tempérée : 3-5 jours\n• Région peu ensoleillée : 5-7 jours",
  },
  {
    key: "v_batterie",
    title: "Tension batterie",
    description: "Voltage du système",
    unit: "V",
    icon: Settings,
    color: "blue",
    category: "Configuration",
    placeholder: "12V, 24V ou 48V",
    defaultHelp:
      "Tension nominale du parc de batteries.\n\nOptions :\n• 12V : Petites installations (camping-car, abri)\n• 24V : Installations moyennes (maison secondaire)\n• 48V : Grandes installations (maison principale)\n\nAvantage 48V : Moins de pertes, câbles plus fins, meilleur rendement.",
  },
  {
    key: "localisation",
    title: "Localisation",
    description: "Position géographique",
    unit: "",
    icon: Globe,
    color: "green",
    category: "Environnement",
    placeholder: "Ex: Antananarivo",
    defaultHelp:
      "Votre localisation géographique pour estimer l'irradiation solaire.\n\nFacteurs importants :\n• Latitude\n• Climat local (nébulosité)\n• Altitude\n\nSélectionnez la ville la plus proche de votre installation.",
  },
  {
    key: "h_solaire",
    title: "Irradiation solaire",
    description: "Énergie solaire disponible",
    unit: "kWh/m²/j",
    icon: Globe,
    color: "amber",
    category: "Environnement",
    placeholder: "Ex: 4.5",
    defaultHelp:
      "Énergie solaire reçue par m² et par jour.\n\nValeurs typiques : 2.5 à 5.5 kWh/m²/j selon la région.\n\nNote : Cette valeur peut être remplie automatiquement selon la localisation.",
  },
] as const;

type Predef = (typeof PREDEFINED_FIELDS)[number];

// ------------------------ Utils ------------------------
function textToHtml(text: string): string {
  if (!text) return "";
  return text
    .split("\n\n")
    .filter((p) => p.trim())
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}
function htmlToText(html: string): string {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

// ---------------------- UI: FieldCard ----------------------
function FieldCard({
  field,
  helpContent,
  onEdit,
  onPreview,
}: {
  field: Predef;
  helpContent: HelpContent | null;
  onEdit: () => void;
  onPreview: () => void;
}) {
  const isConfigured = !!helpContent;
  const IconComponent = field.icon;

  const colorClasses = {
    yellow: "from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700",
    orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-700",
    purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-700",
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-700",
    green: "from-green-50 to-green-100 border-green-200 text-green-700",
    amber: "from-amber-50 to-amber-100 border-amber-200 text-amber-700",
  };

  return (
    <div>
      <div
        className={`bg-gradient-to-br ${
          colorClasses[field.color as keyof typeof colorClasses]
        } border rounded-xl p-4 hover:shadow-md transition-all`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/70 rounded-lg">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{field.title}</h3>
              <p className="text-sm opacity-75">{field.description}</p>
              {field.unit && (
                <span className="inline-block mt-1 px-2 py-1 text-xs bg-white/50 rounded">
                  {field.unit}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isConfigured ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium opacity-75">
            Clé du champ :{" "}
            <code className="bg-white/50 px-1 rounded">{field.key}</code>
          </div>

          <div className="text-xs opacity-75">
            Statut :{" "}
            {isConfigured ? (
              <span className="text-green-700 font-medium">✅ Configuré</span>
            ) : (
              <span className="text-gray-600">⚠️ Non configuré</span>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onEdit}
              className="flex-1 px-3 py-2 bg-white/80 hover:bg-white text-gray-800 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
            >
              <Edit className="w-4 h-4" />
              {isConfigured ? "Modifier" : "Configurer"}
            </button>
            {isConfigured && (
              <button
                onClick={onPreview}
                className="px-3 py-2 bg-white/80 hover:bg-white text-gray-800 rounded-lg text-sm font-medium transition-colors"
                title="Aperçu"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------- UI: EditForm ----------------------
function EditForm({
  field,
  existingContent,
  onSave,
  saving,
}: {
  field: Predef;
  existingContent: HelpContent | null;
  onSave: (
    key: string,
    title: string,
    bodyText: string,
    isActive: boolean
  ) => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(existingContent?.title || field.title);
  const [bodyText, setBodyText] = useState(() => {
    if (existingContent?.body_html)
      return htmlToText(existingContent.body_html);
    return field.defaultHelp;
  });
  const [isActive, setIsActive] = useState(existingContent?.is_active ?? true);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titre affiché
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-lg"
          placeholder={field.title}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Explication (texte simple)
        </label>
        <textarea
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tapez votre explication..."
        />
        <p className="mt-2 text-xs text-slate-500">
          Les retours à la ligne seront convertis automatiquement au format
          HTML.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="is_active" className="text-sm text-gray-700">
          Contenu actif (visible aux utilisateurs)
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => onSave(field.key, title, bodyText, isActive)}
          disabled={saving || !title.trim() || !bodyText.trim()}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Spinner className="w-4 h-4" /> {/* ✅ spinner centralisé */}
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {existingContent ? "Mettre à jour" : "Créer"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------- Page principale ----------------------
export default function AdminHelpContentsPage() {
  const [helpContents, setHelpContents] = useState<HelpContent[]>([]);
  const [editingField, setEditingField] = useState<Predef | null>(null);
  const [previewField, setPreviewField] = useState<Predef | null>(null);
  const [editingContent, setEditingContent] = useState<HelpContent | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { wrap } = useLoading(); // ✅ overlay global

  // Chargement (admin requis)
  const loadHelpContents = useCallback(async () => {
    setLoading(true);
    try {
      await wrap(async () => {
        const res = await fetchWithAdminAuth("/contenus/admin/");
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data = (await res.json()) as HelpContent[];
        setHelpContents(Array.isArray(data) ? data : []);
      }, "Chargement des contenus…");
    } catch (err: any) {
      toast.error(err?.message || "Échec du chargement");
    } finally {
      setLoading(false);
    }
  }, [wrap]);

  // Création / Mise à jour
  const saveContent = async (
    fieldKey: string,
    title: string,
    bodyText: string,
    isActive: boolean = true
  ) => {
    setSaving(true);
    try {
      await wrap(async () => {
        const existing = helpContents.find((c) => c.key === fieldKey);
        const body_html = textToHtml(bodyText);

        let res: Response;
        if (existing) {
          res = await fetchWithAdminAuth(
            `/contenus/admin/${encodeURIComponent(fieldKey)}/`,
            {
              method: "PATCH",
              body: JSON.stringify({ title, body_html, is_active: isActive }),
            }
          );
        } else {
          res = await fetchWithAdminAuth(`/contenus/admin/`, {
            method: "POST",
            body: JSON.stringify({
              key: fieldKey,
              title,
              body_html,
              is_active: isActive,
            }),
          });
        }

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          throw new Error(detail || `Erreur ${res.status}`);
        }
      }, "Sauvegarde…");

      toast.success(
        helpContents.some((c) => c.key === fieldKey)
          ? "Contenu mis à jour ✔️"
          : "Contenu créé ✔️",
        { autoClose: 2500 }
      );

      await loadHelpContents();
      setEditingField(null);
      setEditingContent(null);
    } catch (err: any) {
      toast.error(err?.message || "Échec de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // Groupage par catégorie
  const fieldsByCategory = PREDEFINED_FIELDS.reduce((acc, f) => {
    (acc[f.category] ||= []).push(f);
    return acc;
  }, {} as Record<string, Predef[]>);

  useEffect(() => {
    loadHelpContents();
  }, [loadHelpContents]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900">
          <FileText className="w-7 h-7 text-blue-600" />
          Gestion des notices
        </h1>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🎯 Aides utilisateur (admin)
          </h1>
          <p className="text-gray-600 mt-1">
            Configurez les explications affichées via l’icône ℹ️
          </p>
        </div>
        <button
          onClick={loadHelpContents}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <Spinner className="w-4 h-4" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Actualiser
        </button>
      </div>

      {/* Grilles par catégorie — 3 cartes/ligne dès md: */}
      {Object.entries(fieldsByCategory).map(([category, fields]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            {category === "Consommation" && (
              <Zap className="w-5 h-5 text-yellow-500" />
            )}
            {category === "Configuration" && (
              <Settings className="w-5 h-5 text-purple-500" />
            )}
            {category === "Environnement" && (
              <Globe className="w-5 h-5 text-green-500" />
            )}
            {category}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fields.map((field) => {
              const helpContent =
                helpContents.find((c) => c.key === field.key) || null;
              return (
                <FieldCard
                  key={field.key}
                  field={field}
                  helpContent={helpContent}
                  onEdit={() => {
                    setEditingField(field);
                    setEditingContent(helpContent);
                    setPreviewField(null);
                  }}
                  onPreview={() => {
                    setPreviewField(field);
                    setEditingField(null);
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Modale Éditeur */}
      {editingField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingContent ? "✏️ Modifier" : "➕ Configurer"} :{" "}
                  {editingField.title}
                </h2>
                <p className="text-gray-600 text-sm">
                  Clé : {editingField.key}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingField(null);
                  setEditingContent(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <EditForm
              field={editingField}
              existingContent={editingContent}
              onSave={saveContent}
              saving={saving}
            />
          </div>
        </div>
      )}

      {/* Modale Aperçu */}
      {previewField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                👁️ Aperçu : {previewField.title}
              </h2>
              <button
                onClick={() => setPreviewField(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-900 mb-2">
                  {previewField.title}{" "}
                  {previewField.unit && `(${previewField.unit})`}
                </div>
                <div
                  className="text-sm text-blue-800 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      helpContents.find((c) => c.key === previewField.key)
                        ?.body_html ||
                      textToHtml(
                        PREDEFINED_FIELDS.find(
                          (f) => f.key === previewField.key
                        )?.defaultHelp ?? ""
                      ),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
