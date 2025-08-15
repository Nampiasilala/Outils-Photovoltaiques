// app/components/RouteGuard.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AlertCircle, Shield } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireModerator?: boolean;          // interprété comme "staff"
  requirePermissions?: string[];       // placeholder si plus tard tu ajoutes des permissions fines
  fallbackPath?: string;               // chemin si non authentifié
}

/**
 * NOTE sur les rôles:
 * - admin = is_superuser || is_staff (tu peux durcir à is_superuser uniquement si tu veux)
 * - moderator = is_staff (non superuser)
 * - hasPermission = true si admin (à affiner quand tu auras des perms côté API)
 */
export default function RouteGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireModerator = false,
  requirePermissions = [],
  fallbackPath = "/(public)/login",
}: RouteGuardProps) {
  const { admin, loading } = useAuth();
  const router = useRouter();

  // Helpers basés sur l'objet admin de ton AuthContext
  const isAdmin = useMemo(
    () => !!admin && (admin.is_superuser || admin.is_staff),
    [admin]
  );

  const isModerator = useMemo(
    () => !!admin && admin.is_staff, // et pas forcément superuser
    [admin]
  );

  // Placeholder permission check : vrai si admin (à remplacer par une vraie liste)
  const hasPermission = (permission: string) => {
    // TODO: brancher sur les vraies permissions (si ton API les renvoie)
    return isAdmin;
  };

  useEffect(() => {
    if (loading) return;

    // Auth requise mais pas connecté
    if (requireAuth && !admin) {
      toast.error(
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">
            Vous devez être connecté pour accéder à cette page.
          </span>
        </div>,
        { icon: false }
      );
      router.push(fallbackPath);
      return;
    }

    // Si pas connecté et pas d'auth requise → pas de checks de rôles
    if (!admin) return;

    // Admin requis
    if (requireAdmin && !isAdmin) {
      toast.error(
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">
            Accès refusé. Permissions administrateur requises.
          </span>
        </div>,
        { icon: false }
      );
      router.push("/calculate");
      return;
    }

    // Modérateur requis
    if (requireModerator && !isModerator) {
      toast.error(
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">
            Accès refusé. Permissions modérateur requises.
          </span>
        </div>,
        { icon: false }
      );
      router.push("/calculate");
      return;
    }

    // Permissions spécifiques
    if (requirePermissions.length > 0) {
      const ok = requirePermissions.every((p) => hasPermission(p));
      if (!ok) {
        toast.error(
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">
              Accès refusé. Permissions insuffisantes.
            </span>
          </div>,
          { icon: false }
        );
        router.push("/calculate");
      }
    }
  }, [
    admin,
    loading,
    requireAuth,
    requireAdmin,
    requireModerator,
    requirePermissions,
    router,
    isAdmin,
    isModerator,
  ]);

  // Loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  // Si auth requise mais pas connecté → rien à rendre (une redirection a déjà été déclenchée)
  if (requireAuth && !admin) {
    return null;
  }

  // Double barrière d'affichage (au cas où) :
  if (admin) {
    if (requireAdmin && !isAdmin) return null;
    if (requireModerator && !isModerator) return null;
    if (requirePermissions.length > 0) {
      const ok = requirePermissions.every((p) => hasPermission(p));
      if (!ok) return null;
    }
  }

  return <>{children}</>;
}

/**
 * Hook "usePermissions" compatible avec ton AuthContext actuel.
 * Si plus tard tu ajoutes de vraies permissions fines, adapte hasPermission().
 */
export function usePermissions() {
  const { admin } = useAuth();

  const isAdmin = !!admin && (admin.is_superuser || admin.is_staff);
  const isModerator = !!admin && admin.is_staff;

  const hasPermission = (_perm: string) => {
    // TODO: brancher sur une vraie liste de perms dans `admin`
    return isAdmin; // pour l'instant, seuls les admins ont toutes les permissions
  };

  // Capacités génériques (placeholders)
  const canEdit = () => isAdmin;
  const canDelete = () => isAdmin;
  const canManageUsers = () => isAdmin;

  return {
    admin,
    isAdmin,
    isModerator,
    canEdit: canEdit(),
    canDelete: canDelete(),
    canManageUsers: canManageUsers(),
    hasPermission,
    // Permissions spécifiques à ton app (ajuste à volonté)
    canViewEquipments: !!admin, // tout connecté
    canCreateEquipments: isAdmin || hasPermission("add_equipment"),
    canUpdateEquipments: isAdmin || hasPermission("change_equipment"),
    canDeleteEquipments: isAdmin || hasPermission("delete_equipment"),
    canViewParameters: !!admin,
    canUpdateParameters: isAdmin || hasPermission("change_parametresysteme"),
    canViewUsers: isAdmin || hasPermission("view_user"),
    canCreateUsers: isAdmin || hasPermission("add_user"),
    canUpdateUsers: isAdmin || hasPermission("change_user"),
    canDeleteUsers: isAdmin || hasPermission("delete_user"),
  };
}
