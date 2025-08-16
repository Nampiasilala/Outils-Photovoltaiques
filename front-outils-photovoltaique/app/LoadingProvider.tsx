// app/LoadingProvider.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Sun } from "lucide-react";

type Item = { id: string; label?: string };
type Ctx = {
  isBusy: boolean;
  items: Item[];
  show: (label?: string, id?: string) => string;
  hide: (id: string) => void;
  wrap<T>(fn: () => Promise<T>, label?: string, id?: string): Promise<T>;
};

const LoadingCtx = createContext<Ctx | null>(null);

/** Choisis le style global du loader : "sun" | "dots" | "ring" */
const LOADER_VARIANT: "sun" | "dots" | "ring" = "sun";

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);

  const show = useCallback((label?: string, id?: string) => {
    const token = id || Math.random().toString(36).slice(2);
    setItems((arr) => [...arr, { id: token, label }]);
    return token;
  }, []);

  const hide = useCallback((id: string) => {
    setItems((arr) => arr.filter((x) => x.id !== id));
  }, []);

  const wrap = useCallback(async <T,>(fn: () => Promise<T>, label?: string, id?: string) => {
    const token = show(label, id);
    try {
      return await fn();
    } finally {
      hide(token);
    }
  }, [show, hide]);

  const value = useMemo(
    () => ({ isBusy: items.length > 0, items, show, hide, wrap }),
    [items, show, hide, wrap]
  );

  return (
    <LoadingCtx.Provider value={value}>
      {children}
      <GlobalOverlay />
    </LoadingCtx.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingCtx);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
}

/* -------------------- Spinners jolis & réutilisables -------------------- */

type SpinnerProps = {
  className?: string;
  size?: number;           // px
  variant?: "sun" | "dots" | "ring";
  label?: string;
};

export function Spinner({ className = "", size = 20, variant = LOADER_VARIANT }: SpinnerProps) {
  if (variant === "dots") return <DotsSpinner size={size} className={className} />;
  if (variant === "ring") return <RingSpinner size={size} className={className} />;
  return <SunSpinner size={size} className={className} />; // "sun" par défaut
}

/** Style "soleil" : anneau conique qui tourne + soleil qui pulse */
function SunSpinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  const ring = {
    background:
      "conic-gradient(from 0deg, rgb(59 130 246) 0% 25%, rgb(203 213 225) 25% 100%)", // bleu -> gris
    WebkitMask:
      "radial-gradient(farthest-side, transparent calc(100% - 4px), black 0)", // crée l'anneau
    mask:
      "radial-gradient(farthest-side, transparent calc(100% - 4px), black 0)",
  } as React.CSSProperties;

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="absolute inset-0 rounded-full animate-spin"
        style={ring}
      />
      <Sun
        className="relative text-amber-500"
        style={{ width: size * 0.6, height: size * 0.6, filter: "drop-shadow(0 0 4px rgba(245, 158, 11, .35))" }}
      />
      <style jsx>{`
        :global(svg.text-amber-500) {
          animation: pulseGlow 1.4s ease-in-out infinite;
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(0.95); opacity: .9; }
          50%      { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </span>
  );
}

/** Style "dots" : 3 points qui pulsent */
function DotsSpinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  const dot = { width: size * 0.25, height: size * 0.25, borderRadius: 9999 } as React.CSSProperties;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={dot}
          className="bg-blue-600"
        >
          <style jsx>{`
            span:nth-child(${i + 1}) {
              animation: dotPulse 1.2s ease-in-out ${i * 0.15}s infinite;
              display: inline-block;
            }
            @keyframes dotPulse {
              0%, 80%, 100% { transform: scale(0.6); opacity: .5; }
              40%          { transform: scale(1);   opacity: 1;  }
            }
          `}</style>
        </span>
      ))}
    </span>
  );
}

/** Style "ring" soigné (border-top colorée + ombre légère) */
function RingSpinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  const s = { width: size, height: size, borderWidth: Math.max(2, Math.round(size / 10)) } as React.CSSProperties;
  return (
    <span
      className={`inline-block rounded-full border-slate-300 border-t-blue-600 animate-spin shadow-[0_0_0_1px_rgba(0,0,0,0.02)_inset] ${className}`}
      style={s}
      aria-hidden="true"
    />
  );
}

/* ---------------------- Overlay plein écran ---------------------- */

function GlobalOverlay() {
  const { isBusy, items } = useLoading();
  if (!isBusy) return null;
  const label = items[items.length - 1]?.label || "Chargement…";

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="pointer-events-auto bg-white/90 border border-slate-200 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
        <Spinner variant={LOADER_VARIANT} size={22} />
        <span className="text-sm font-medium text-slate-800">{label}</span>
      </div>
    </div>
  );
}
