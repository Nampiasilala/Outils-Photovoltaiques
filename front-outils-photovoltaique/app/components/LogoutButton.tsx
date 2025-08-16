"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { toast } from "react-toastify";

interface LogoutButtonProps {
  className?: string;
  label?: string;
  onAfterLogout?: () => void; // pour fermer le menu mobile par ex.
}

export default function LogoutButton({
  className = "",
  label = "Déconnexion",
  onAfterLogout,
}: LogoutButtonProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.info("Vous avez été déconnecté.");
    if (onAfterLogout) onAfterLogout();
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 font-medium hover:bg-red-100 ${className}`}
    >
      <LogOut className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </button>
  );
}
