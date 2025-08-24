// front-outils-photovoltaique/app/lib/env.ts
type NonEmptyString = string & { __brand: "NonEmptyString" };

function requireEnv(name: string, raw: string | undefined, opts?: { fallback?: string; allowFallbackInDev?: boolean }): NonEmptyString {
  const isDev = process.env.NODE_ENV !== "production";

  // 1) Valeur fournie via env
  if (raw && raw.trim()) return raw as NonEmptyString;

  // 2) Fallback éventuellement autorisé en dev
  if (opts?.fallback && (opts.allowFallbackInDev && isDev)) {
    // Optionnel: console.warn pour rappeler qu'on est sur un fallback
    if (typeof window !== "undefined") {
      // côté navigateur
      console.warn(`[env] ${name} manquant — fallback utilisé: ${opts.fallback}`);
    } else {
      // côté serveur/SSR
      console.warn(`[env] ${name} manquant — fallback utilisé: ${opts.fallback}`);
    }
    return opts.fallback as NonEmptyString;
  }

  // 3) Sinon on échoue clairement (message lisible)
  throw new Error(`Variable d'environnement manquante: ${name}. 
Définis-la (ex: NEXT_PUBLIC_API_BASE_URL) dans ton .env ou via Docker Compose.`);
}

export const env = {
  // DEV : on accepte un fallback local ; PROD : on exige la variable.
  NEXT_PUBLIC_API_BASE_URL: requireEnv(
    "NEXT_PUBLIC_API_BASE_URL",
    process.env.NEXT_PUBLIC_API_BASE_URL,
    { fallback: "http://localhost:8000/api", allowFallbackInDev: true }
  ),
};
