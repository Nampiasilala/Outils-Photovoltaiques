import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine les classes Tailwind de façon sûre
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Obtenir les initiales à partir du nom d'utilisateur
export const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

// Couleur de badge selon le statut utilisateur
export const getStatusColor = (status: string) => {
  switch (status) {
    case "Actif":
      return "bg-green-100 text-green-700 border-green-200";
    case "Inactif":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "Suspendu":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

// Couleur de badge selon le rôle utilisateur
export const getRoleColor = (role: string) => {
  switch (role) {
    case "Admin":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "Modérateur":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Utilisateur":
      return "bg-green-100 text-green-700 border-green-200";
    case "Invité":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};
