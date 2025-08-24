"use client";

import { useEffect, useState, useCallback } from "react";
import { Info, X, Loader2 } from "lucide-react";
import { env } from "@/lib/env";

type HelpContent = {
  id: number;
  key: string;
  title: string;
  body_html: string;   // contenu HTML stocké en base
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type FieldHelpProps = {
  /** clé du champ (e.g. "e_jour", "p_max", ...) */
  keyName: string;
  /** classes pour positionner l’icône à côté du label */
  className?: string;
  /** classes pour styler l’icône (taille/couleur) */
  iconClassName?: string;
  /** montrer une icône grisée même si pas de contenu (sinon rien) */
  showWhenEmpty?: boolean;
};

export default function FieldHelp({
  keyName,
  className = "ml-2 inline-flex",
  iconClassName = "w-4 h-4 text-slate-400 hover:text-slate-600",
  showWhenEmpty = false,
}: FieldHelpProps) {
  const [data, setData] = useState<HelpContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchHelp = useCallback(async () => {
    setLoading(true);
    try {
        const base = env.NEXT_PUBLIC_API_BASE_URL;      const res = await fetch(`${base}/contenus/public/by-key/${encodeURIComponent(keyName)}/`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setData(null);
        return;
      }
      const json = (await res.json()) as HelpContent;
      // on ne montre que si actif
      setData(json?.is_active ? json : null);
    } catch (err) {
      // silencieux côté public
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [keyName]);

  useEffect(() => {
    fetchHelp();
  }, [fetchHelp]);

  // Pas de contenu → optionnellement afficher une icône désactivée
  if (!loading && !data && !showWhenEmpty) return null;

  return (
    <>
      {/* Icône info (à placer à droite du label) */}
      <button
        type="button"
        aria-label="Aide"
        onClick={() => setOpen(true)}
        className={className}
        disabled={loading || (!data && !showWhenEmpty)}
      >
        {loading ? (
          <Loader2 className={`animate-spin ${iconClassName}`} />
        ) : (
          <Info className={`${iconClassName} ${!data ? "opacity-40 cursor-not-allowed" : ""}`} />
        )}
      </button>

      {/* Modale */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-xl rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-slate-900">
                {data?.title || "Aide"}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded hover:bg-slate-100"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chargement…
                </div>
              ) : data ? (
                <div
                  className="prose prose-sm max-w-none text-slate-800"
                  // contenu HTML venant du back (édité en admin)
                  dangerouslySetInnerHTML={{ __html: data.body_html }}
                />
              ) : (
                <p className="text-sm text-slate-500">
                  Aucune aide disponible pour ce champ pour le moment.
                </p>
              )}
            </div>

            <div className="px-4 py-3 border-t bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 rounded border bg-white hover:bg-slate-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
