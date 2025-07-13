export const roles = ["Admin", "Utilisateur", "Modérateur", "Invité"];
export const departments = ["IT", "Marketing", "Ventes", "Support", "RH", "Finance"];
export const statuses = ["Actif", "Inactif", "Suspendu"];
export const API_BASE_URL = "http://localhost:8000/api";

export const getAuthToken = () => localStorage.getItem("authToken");

export const getHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const getInitials = (username: string) =>
  username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

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
