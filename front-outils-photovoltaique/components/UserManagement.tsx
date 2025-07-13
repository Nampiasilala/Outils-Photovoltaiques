"use client";

import { useState, useEffect } from "react";
import {
  User as UserIcon,
  Mail,
  Shield,
  Activity,
  Pencil,
  Trash2,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  Eye,
  Calendar,
  X,
  CheckCircle,
  AlertCircle,
  Save,
  Building,
} from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  department: string | null;
  lastLogin: string | null;
  joinDate: string;
  avatar?: string;
}

interface UserFormData {
  username: string;
  email: string;
  role: string;
  department: string;
  status: string;
}

const roles = ["Admin", "Utilisateur", "Modérateur", "Invité"];
const departments = ["IT", "Marketing", "Ventes", "Support", "RH", "Finance"];
const statuses = ["Actif", "Inactif", "Suspendu"];

const API_BASE_URL = "http://localhost:8000/api";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("Tous");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    role: "Utilisateur",
    department: "IT",
    status: "Actif",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as 'success' | 'error' | 'info',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const getAuthToken = () => localStorage.getItem('authToken');

  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.map((user: any) => ({
          ...user,
          joinDate: user.date_joined,
          lastLogin: user.last_login,
        })));
      } else {
        throw new Error('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast("Erreur lors du chargement des utilisateurs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "Tous" || user.role === filterRole;
    const matchesStatus = filterStatus === "Tous" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Actif").length;
  const inactiveUsers = users.filter((u) => u.status === "Inactif").length;
  const adminUsers = users.filter((u) => u.role === "Admin").length;

  const resetForm = () => {
    setFormData({ username: "", email: "", role: "Utilisateur", department: "IT", status: "Actif" });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (user: User) => {
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department ?? "",
      status: user.status,
    });
    setEditingUser(user);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setEditingUser(null);
    setSelectedUser(null);
    resetForm();
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addUser = async () => {
    if (!formData.username.trim()) {
      showToast("Le nom est requis", "error");
      return;
    }
    if (!isValidEmail(formData.email)) {
      showToast("Email invalide", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers(prev => [...prev, newUser]);
        setShowAddModal(false);
        resetForm();
        showToast("Utilisateur ajouté avec succès", "success");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de l'ajout");
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast("Erreur lors de l'ajout de l'utilisateur", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const updateUser = async () => {
    if (!editingUser) return;

    if (!formData.username.trim()) {
      showToast("Le nom est requis", "error");
      return;
    }
    if (!isValidEmail(formData.email)) {
      showToast("Email invalide", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${editingUser.id}/`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev =>
          prev.map(user =>
            user.id === editingUser.id ? updatedUser : user
          )
        );
        setEditingUser(null);
        resetForm();
        showToast("Utilisateur modifié avec succès", "success");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast("Erreur lors de la modification de l'utilisateur", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (response.ok) {
        setUsers(prev => prev.filter(user => user.id !== id));
        setShowDeleteConfirm(null);
        showToast("Utilisateur supprimé avec succès", "info");
      } else {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast("Erreur lors de la suppression de l'utilisateur", "error");
    }
  };

  const toggleUserStatus = async (id: number) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const newStatus = user.status === "Actif" ? "Inactif" : "Actif";

    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setUsers(prev =>
          prev.map(u =>
            u.id === id ? { ...u, status: newStatus } : u
          )
        );
        showToast("Statut utilisateur modifié", "success");
      } else {
        throw new Error("Erreur lors du changement de statut");
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast("Erreur lors du changement de statut", "error");
    }
  };

  const refreshData = () => {
    fetchUsers();
    showToast("Données actualisées", "info");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Actif": return "bg-green-100 text-green-700 border-green-200";
      case "Inactif": return "bg-gray-100 text-gray-700 border-gray-200";
      case "Suspendu": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Modérateur": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Utilisateur": return "bg-green-100 text-green-700 border-green-200";
      case "Invité": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getInitials = (username: string) => username.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
            <div className={`p-4 rounded-lg shadow-lg border flex items-center space-x-3 ${
              toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestion des Utilisateurs
                </h1>
                <p className="text-gray-600">
                  Gérez les comptes et permissions utilisateurs
                </p>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter un utilisateur</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Utilisateurs actifs</p>
                  <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Utilisateurs inactifs</p>
                  <p className="text-2xl font-bold text-gray-600">{inactiveUsers}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <UserX className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Administrateurs</p>
                  <p className="text-2xl font-bold text-purple-600">{adminUsers}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="Tous">Tous les rôles</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="Tous">Tous les statuts</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? "s" : ""} trouvé{filteredUsers.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-700 bg-gray-50 border-b-2 border-gray-200">
                  <th className="py-4 px-4 font-semibold">Utilisateur</th>
                  <th className="py-4 px-4 font-semibold">Rôle</th>
                  <th className="py-4 px-4 font-semibold">Département</th>
                  <th className="py-4 px-4 font-semibold">Statut</th>
                  <th className="py-4 px-4 font-semibold">Dernière connexion</th>
                  <th className="py-4 px-4 font-semibold">Date d'inscription</th>
                  <th className="py-4 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(user.username)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.username}</div>
                          <div className="text-gray-500 text-xs flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700">{user.department}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {/* <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </div> */}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-600">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                          title={user.status === "Actif" ? "Désactiver" : "Activer"}
                        >
                          {user.status === "Actif" ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(user.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterRole !== "Tous" || filterStatus !== "Tous"
                  ? "Aucun utilisateur trouvé"
                  : "Aucun utilisateur"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterRole !== "Tous" || filterStatus !== "Tous"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par ajouter votre premier utilisateur"}
              </p>
              {!searchTerm && filterRole === "Tous" && filterStatus === "Tous" && (
                <button
                  onClick={openAddModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un utilisateur</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Ajouter/Modifier Utilisateur */}
        {(showAddModal || editingUser) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
                </h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom complet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@exemple.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rôle
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Département
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={editingUser ? updateUser : addUser}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingUser ? "Modifier" : "Ajouter"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Détails Utilisateur */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Détails de l'utilisateur
                </h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Avatar et nom */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {getInitials(selectedUser.username)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedUser.username}
                    </h3>
                    <p className="text-gray-600 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                {/* Informations */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rôle</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Département</span>
                    <span className="text-gray-900 flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {selectedUser.department}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Statut</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Dernière connexion</span>
                    {/* <span className="text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(selectedUser.lastLogin).toLocaleDateString()}
                    </span> */}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Date d'inscription</span>
                    <span className="text-gray-900">
                      {new Date(selectedUser.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      openEditModal(selectedUser);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => {
                      toggleUserStatus(selectedUser.id);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    {selectedUser.status === "Actif" ? (
                      <UserX className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                    <span>
                      {selectedUser.status === "Actif" ? "Désactiver" : "Activer"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Confirmation Suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Confirmer la suppression
                </h2>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-gray-600 text-center">
                  Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => deleteUser(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>);}