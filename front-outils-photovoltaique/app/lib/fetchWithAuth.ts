// app/lib/fetchWithAuth.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

/**
 * Tente de rafraîchir l’access token via le refresh token.
 * Retourne le nouveau access token.
 */
async function tryRefresh(): Promise<string> {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) {
    throw new Error('Pas de refresh token');
  }

  const res = await fetch(`${API_BASE}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    throw new Error('Impossible de rafraîchir la session');
  }

  const { access: newAccess } = await res.json();
  localStorage.setItem('accessToken', newAccess);
  return newAccess;
}

/**
 * Wrapper autour de fetch :
 *  - préfixe automatiquement avec NEXT_PUBLIC_API_BASE_URL si URL relative
 *  - injecte Authorization: Bearer <accessToken>
 *  - sur 401, tente tryRefresh() puis réessaie une fois
 *  - si échec, purge et redirige vers /login
 */
export async function fetchWithAuth(
    input: RequestInfo,
    init: RequestInit = {},
    requiresAuth: boolean = true
) {
    // 1️⃣ Calcul de l’URL complète
    const url =
        typeof input === 'string' && !/^https?:\/\//i.test(input)
            ? `${API_BASE}${input}`
            : input;

    // 2️⃣ Récupération du token si nécessaire
    let access = requiresAuth ? localStorage.getItem('accessToken') : null;
    const headers = {
        'Content-Type': 'application/json',
        ...(init.headers as object),
        ...(access && requiresAuth ? { Authorization: `Bearer ${access}` } : {}),
    };

    // 3️⃣ Premier appel
    let res = await fetch(url, { ...init, headers });

    // 4️⃣ En cas de 401, on tente le refresh si requiresAuth est true
    if (res.status === 401 && requiresAuth) {
        try {
            access = await tryRefresh();
        } catch (err) {
            // Pas de refresh possible → on déloge l’utilisateur
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            throw err;
        }

        // 5️⃣ Réessai avec nouveau token
        const retryHeaders = {
            'Content-Type': 'application/json',
            ...(init.headers as object),
            Authorization: `Bearer ${access}`,
        };
        res = await fetch(url, { ...init, headers: retryHeaders });
    }

    return res;
}
