"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAdminAuth } from "@/components/AuthContext";
import { fetchWithAdminAuth } from "@/lib/fetchWithAdminAuth";
import { Save, Edit, XCircle, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

// TipTap est chargé en client-only
const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });

// Si tu veux persister côté API, définis NEXT_PUBLIC_EDITOR_ENDPOINT dans .env
// ex: NEXT_PUBLIC_EDITOR_ENDPOINT=/cms/pages/admin-note/
const ENDPOINT = process.env.NEXT_PUBLIC_EDITOR_ENDPOINT;

export default function AdminContentPage() {
  const { admin, loading } = useAdminAuth();
  const [html, setHtml] = useState<string>("<p>Commencez à écrire…</p>");
  const [initialHtml, setInitialHtml] = useState<string>("");
  const [editing, setEditing] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<boolean>(false);

  // Chargement initial
  useEffect(() => {
    if (loading || !admin) return;
    (async () => {
      setBusy(true);
      setError(null);
      try {
        if (ENDPOINT) {
          // Essaie via API
          const res = await fetchWithAdminAuth(ENDPOINT, {}, true);
          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            const content = data?.content ?? "";
            setHtml(content || localStorage.getItem("admin.content.html") || "<p>Commencez à écrire…</p>");
            setInitialHtml(content || "");
          } else if (res.status === 404) {
            // Fallback localStorage
            const ls = localStorage.getItem("admin.content.html");
            setHtml(ls || "<p>Commencez à écrire…</p>");
            setInitialHtml(ls || "");
          } else {
            const txt = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
          }
        } else {
          // Pas d’endpoint : utilise localStorage
          const ls = localStorage.getItem("admin.content.html");
          setHtml(ls || "<p>Commencez à écrire…</p>");
          setInitialHtml(ls || "");
        }
      } catch (e:any) {
        setError(e?.message || "Erreur de chargement");
        toast.error("Erreur de chargement : " + (e?.message || "inconnue"));
      } finally {
        setBusy(false);
      }
    })();
  }, [loading, admin]);

  if (loading || (busy && !initialHtml && !html)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }
  if (!admin) return null;

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      if (ENDPOINT) {
        // PUT/PATCH selon ton API (ci-dessous en PUT avec payload canonique)
        const res = await fetchWithAdminAuth(ENDPOINT, {
          method: "PUT",
          body: JSON.stringify({ content: html }),
        }, true);
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
        }
      } else {
        // Fallback localStorage
        localStorage.setItem("admin.content.html", html);
      }
      setInitialHtml(html);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      toast.success("Contenu sauvegardé.");
      setEditing(false);
    } catch (e:any) {
      setError(e?.message || "Erreur de sauvegarde");
      toast.error("Erreur de sauvegarde : " + (e?.message || "inconnue"));
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    setHtml(initialHtml || "<p>Commencez à écrire…</p>");
    setEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contenu riche (admin)</h1>
          <p className="text-slate-600">
            Modifiez un texte riche avec TipTap. {ENDPOINT ? "Persisté via API." : "Persisté localement (localStorage)."}
          </p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={save}
                disabled={busy}
                className="inline-flex items-center gap-2 px-3 py-2 rounded bg-green-600 text-white disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
              <button
                onClick={cancel}
                disabled={busy}
                className="inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-500 text-white disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Annuler
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        {/* TipTap */}
        <TiptapEditor content={html} onChange={setHtml} editable={editing} />
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Contenu sauvegardé !</span>
        </div>
      )}
    </div>
  );
}
