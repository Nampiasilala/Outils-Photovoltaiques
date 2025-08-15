// app/lib/fetchWithAuth.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

/**
 * Tente de rafraîchir l’access token via le refresh token.
 */
async function tryRefresh(): Promise<string> {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) throw new Error('Pas de refresh token');

  const res = await fetch(`${API_BASE}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) throw new Error('Impossible de rafraîchir la session');

  const { access: newAccess } = await res.json();
  localStorage.setItem('accessToken', newAccess);
  return newAccess;
}

/**
 * Wrapper autour de fetch (client only)
 */
export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit = {},
  requiresAuth: boolean = true
) {
  const url =
    typeof input === 'string' && !/^https?:\/\//i.test(input)
      ? `${API_BASE}${input}`
      : input;

  let access = requiresAuth ? localStorage.getItem('accessToken') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(init.headers as object),
    ...(access && requiresAuth ? { Authorization: `Bearer ${access}` } : {}),
  };

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401 && requiresAuth) {
    try {
      access = await tryRefresh();
    } catch (err) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // ↳ redirige vers le login admin
      window.location.href = '/admin/login';
      throw err;
    }

    const retryHeaders = {
      'Content-Type': 'application/json',
      ...(init.headers as object),
      Authorization: `Bearer ${access}`,
    };
    res = await fetch(url, { ...init, headers: retryHeaders });
  }

  return res;
}
