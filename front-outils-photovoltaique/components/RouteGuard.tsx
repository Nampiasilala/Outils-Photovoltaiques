// // app/components/RouteGuard.tsx
// 'use client';

// import { useAuth } from './AuthContext';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';
// import { toast } from 'react-toastify';
// import { AlertCircle, Shield } from 'lucide-react';

// interface RouteGuardProps {
//   children: React.ReactNode;
//   requireAuth?: boolean;
//   requireAdmin?: boolean;
//   requireModerator?: boolean;
//   requirePermissions?: string[];
//   fallbackPath?: string;
// }

// export default function RouteGuard({
//   children,
//   requireAuth = true,
//   requireAdmin = false,
//   requireModerator = false,
//   requirePermissions = [],
//   fallbackPath = '/login'
// }: RouteGuardProps) {
//   const { user, loading, isAdmin, isModerator, hasPermission } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (loading) return;

//     // Vérification de l'authentification
//     if (requireAuth && !user) {
//       toast.error(
//         <div className="flex items-center gap-3">
//           <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
//           <span className="text-sm text-red-700">
//             Vous devez être connecté pour accéder à cette page.
//           </span>
//         </div>,
//         { icon: false }
//       );
//       router.push(fallbackPath);
//       return;
//     }

//     if (!user) return;

//     // Vérification des permissions administrateur
//     if (requireAdmin && !isAdmin()) {
//       toast.error(
//         <div className="flex items-center gap-3">
//           <Shield className="w-5 h-5 text-red-500 flex-shrink-0" />
//           <span className="text-sm text-red-700">
//             Accès refusé. Permissions administrateur requises.
//           </span>
//         </div>,
//         { icon: false }
//       );
//       router.push('/calculate');
//       return;
//     }

//     // Vérification des permissions modérateur
//     if (requireModerator && !isModerator()) {
//       toast.error(
//         <div className="flex items-center gap-3">
//           <Shield className="w-5 h-5 text-red-500 flex-shrink-0" />
//           <span className="text-sm text-red-700">
//             Accès refusé. Permissions modérateur requises.
//           </span>
//         </div>,
//         { icon: false }
//       );
//       router.push('/calculate');
//       return;
//     }

//     // Vérification des permissions spécifiques
//     if (requirePermissions.length > 0) {
//       const hasAllPermissions = requirePermissions.every(permission => hasPermission(permission));
      
//       if (!hasAllPermissions) {
//         toast.error(
//           <div className="flex items-center gap-3">
//             <Shield className="w-5 h-5 text-red-500 flex-shrink-0" />
//             <span className="text-sm text-red-700">
//               Accès refusé. Permissions insuffisantes.
//             </span>
//           </div>,
//           { icon: false }
//         );
//         router.push('/calculate');
//         return;
//       }
//     }
//   }, [user, loading, requireAuth, requireAdmin, requireModerator, requirePermissions, router, isAdmin, isModerator, hasPermission]);

//   // Affichage du loader pendant la vérification
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Vérification des autorisations...</p>
//         </div>
//       </div>
//     );
//   }

//   // Si non authentifié et auth requise, ne pas afficher le contenu
//   if (requireAuth && !user) {
//     return null;
//   }

//   // Si les permissions ne sont pas suffisantes, ne pas afficher le contenu
//   if (user) {
//     if (requireAdmin && !isAdmin()) return null;
//     if (requireModerator && !isModerator()) return null;
//     if (requirePermissions.length > 0) {
//       const hasAllPermissions = requirePermissions.every(permission => hasPermission(permission));
//       if (!hasAllPermissions) return null;
//     }
//   }

//   return <>{children}</>;
// }

// // Hook pour vérifier les permissions dans les composants
// export function usePermissions() {
//   const { user, isAdmin, isModerator, hasPermission, canEdit, canDelete, canManageUsers } = useAuth();

//   return {
//     user,
//     isAdmin: isAdmin(),
//     isModerator: isModerator(),
//     canEdit: canEdit(),
//     canDelete: canDelete(),
//     canManageUsers: canManageUsers(),
//     hasPermission,
//     // Permissions spécifiques pour votre app
//     canViewEquipments: true, // Tous les utilisateurs connectés
//     canCreateEquipments: isAdmin() || hasPermission('add_equipment'),
//     canUpdateEquipments: isAdmin() || hasPermission('change_equipment'),
//     canDeleteEquipments: isAdmin() || hasPermission('delete_equipment'),
//     canViewParameters: true,
//     canUpdateParameters: isAdmin() || hasPermission('change_parametresysteme'),
//     canViewUsers: isAdmin() || hasPermission('view_user'),
//     canCreateUsers: isAdmin() || hasPermission('add_user'),
//     canUpdateUsers: isAdmin() || hasPermission('change_user'),
//     canDeleteUsers: isAdmin() || hasPermission('delete_user'),
//   };
// }