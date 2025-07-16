// app/components/AuthContext.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
// Utilisez le named import qui fonctionne chez vous
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  user_id: number;
  exp: number;
  iat: number;
}

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const AUTH_HOST = API?.replace(/\/api\/?$/, '') ?? '';

  useEffect(() => {
    if (!API) {
      console.error('NEXT_PUBLIC_API_BASE_URL non défini');
      setLoading(false);
      return;
    }
    axios.defaults.baseURL = API;

    const access = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');
    const email = localStorage.getItem('userEmail');

    if (access && refresh && email) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      try {
        // Named import jwtDecode est callable
        const { user_id } = jwtDecode<JwtPayload>(access);
        setUser({ id: user_id, email });
      } catch {
        console.error('JWT invalide au montage, purge session');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [API]);

  const login = async (email: string, password: string) => {
    if (!API) throw new Error('API non configurée');
    const { data } = await axios.post<{ access: string; refresh: string }>(
      '/token/',
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    );

    localStorage.setItem('accessToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    localStorage.setItem('userEmail', email);

    axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;

    // On décode avec jwtDecode nommé
    const { user_id } = jwtDecode<JwtPayload>(data.access);
    setUser({ id: user_id, email });

    router.push('/calculate');
  };

  const register = async (username: string, email: string, password: string) => {
    await axios.post(
      '/register/',
      { username, email, password },
      {
        baseURL: AUTH_HOST,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    router.push('/login');
  };

  const logout = () => {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
