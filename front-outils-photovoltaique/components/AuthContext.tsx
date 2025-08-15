// // app/components/AuthContext.tsx
// 'use client';
// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { jwtDecode } from 'jwt-decode';

// interface JwtPayload {
//   user_id: number;
//   exp: number;
//   iat: number;
// }

// interface AdminUser {
//   id: number;
//   email: string;
//   username?: string;
//   is_staff: boolean;
//   is_superuser: boolean;
// }

// interface AuthContextType {
//   admin: AdminUser | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   isAuthenticated: () => boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [admin, setAdmin] = useState<AdminUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const API = process.env.NEXT_PUBLIC_API_BASE_URL;

//   useEffect(() => {
//     if (!API) {
//       console.error('NEXT_PUBLIC_API_BASE_URL non défini');
//       setLoading(false);
//       return;
//     }

//     axios.defaults.baseURL = API;

//     const initAuth = async () => {
//       const access = localStorage.getItem('adminAccessToken');
//       const refresh = localStorage.getItem('adminRefreshToken');

//       if (access && refresh) {
//         try {
//           const { user_id } = jwtDecode<JwtPayload>(access);
          
//           // Vérifier que le token est encore valide et que l'utilisateur est admin
//           const response = await axios.get(`/users/${user_id}/`, {
//             headers: { Authorization: `Bearer ${access}` }
//           });
          
//           const userData = response.data;
          
//           // Vérifier que l'utilisateur est bien admin/staff
//           if (userData.is_staff || userData.is_superuser) {
//             axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
//             setAdmin({
//               id: user_id,
//               email: userData.email,
//               username: userData.username,
//               is_staff: userData.is_staff,
//               is_superuser: userData.is_superuser,
//             });
//           } else {
//             // Pas admin, on déconnecte
//             logout();
//           }
//         } catch (error) {
//           console.error('Token invalide ou utilisateur non autorisé:', error);
//           logout();
//         }
//       }
      
//       setLoading(false);
//     };

//     initAuth();
//   }, [API]);

//   const login = async (email: string, password: string) => {
//     if (!API) throw new Error('API non configurée');
    
//     try {
//       const { data } = await axios.post<{ access: string; refresh: string }>(
//         '/token/',
//         { email, password },
//         { headers: { 'Content-Type': 'application/json' } }
//       );

//       const { user_id } = jwtDecode<JwtPayload>(data.access);
      
//       // Vérifier les permissions admin
//       const userResponse = await axios.get(`/users/${user_id}/`, {
//         headers: { Authorization: `Bearer ${data.access}` }
//       });
      
//       const userData = userResponse.data;
      
//       if (!userData.is_staff && !userData.is_superuser) {
//         throw new Error('Accès refusé. Seuls les administrateurs peuvent se connecter.');
//       }

//       // Stocker les tokens avec préfixe admin
//       localStorage.setItem('adminAccessToken', data.access);
//       localStorage.setItem('adminRefreshToken', data.refresh);
      
//       axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
      
//       setAdmin({
//         id: user_id,
//         email: userData.email,
//         username: userData.username,
//         is_staff: userData.is_staff,
//         is_superuser: userData.is_superuser,
//       });

//       router.push('/admin');
//     } catch (error: any) {
//       // Nettoyer en cas d'erreur
//       logout();
//       throw error;
//     }
//   };

//   const logout = () => {
//     delete axios.defaults.headers.common['Authorization'];
//     localStorage.removeItem('adminAccessToken');
//     localStorage.removeItem('adminRefreshToken');
//     setAdmin(null);
//     router.push('/');
//   };

//   const isAuthenticated = (): boolean => {
//     return admin !== null;
//   };

//   return (
//     <AuthContext.Provider value={{ 
//       admin, 
//       loading, 
//       login, 
//       logout,
//       isAuthenticated,
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth(): AuthContextType {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
//   return ctx;
// }

// // Hook pour vérifier si on est dans l'interface admin
// export function useAdminAuth() {
//   const { admin, loading, logout } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading && !admin) {
//       router.push('/admin/login');
//     }
//   }, [admin, loading, router]);

//   return {
//     admin,
//     loading,
//     logout,
//     isAuthenticated: !!admin,
//   };
// }