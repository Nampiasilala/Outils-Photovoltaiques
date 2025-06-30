"use client";

import { useState } from "react";
import { 
  User, 
  Mail, 
  Shield, 
  Activity, 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Eye,
  Calendar,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
  lastLogin: string;
  joinDate: string;
  department: string;
}

const roles = ["Admin", "Utilisateur", "Modérateur", "Invité"];
const departments = ["IT", "Marketing", "Ventes", "Support", "RH", "Finance"];
const statuses = ["Actif", "Inactif", "Suspendu"];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    { 
      id: 1, 
      name: "John Doe", 
      email: "john.doe@email.com", 
      role: "Admin", 
      status: "Actif",
      lastLogin: "2024-01-15",
      joinDate: "2023-05-10",
      department: "IT"
    },
    { 
      id: 2, 
      name: "Jane Smith", 
      email: "jane.smith@email.com", 
      role: "Utilisateur", 
      status: "Inactif",
      lastLogin: "2024-01-10",
      joinDate: "2023-08-22",
      department: "Marketing"
    },
    { 
      id: 3, 
      name: "Alice Martin", 
      email: "alice.martin@email.com", 
      role: "Modérateur", 
      status: "Actif",
      lastLogin: "2024-01-14",
      joinDate: "2023-11-05",
      department: "Support"
    },
    { 
      id: 4, 
      name: "Bob Wilson", 
      email: "bob.wilson@email.com", 
      role: "Utilisateur", 
      status: "Suspendu",
      lastLogin: "2024-01-08",
      joinDate: "2023-07-18",
      department: "Ventes"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("Tous");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error'; message: string} | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtrage des utilisateurs
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "Tous" || user.role === filterRole;
    const matchesStatus = filterStatus === "Tous" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Statistiques
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "Actif").length;
  const inactiveUsers = users.filter(u => u.status === "Inactif").length;
  const adminUsers = users.filter(u => u.role === "Admin").length;

  const deleteUser = (id: number) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    showNotification('success', 'Utilisateur supprimé avec succès');
  };

  const toggleUserStatus = (id: number) => {
    setUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, status: user.status === "Actif" ? "Inactif" : "Actif" }
        : user
    ));
    showNotification('success', 'Statut utilisateur modifié');
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
                <p className="text-gray-600">Gérez les comptes et permissions utilisateurs</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
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
                  <User className="w-6 h-6 text-blue-600" />
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
                    <option key={role} value={role}>{role}</option>
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
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
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
                  <tr key={user.id} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
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
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-600">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
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
                          {user.status === "Actif" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
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
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterRole !== "Tous" || filterStatus !== "Tous" 
                  ? "Aucun utilisateur trouvé" 
                  : "Aucun utilisateur"
                }
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterRole !== "Tous" || filterStatus !== "Tous"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par ajouter votre premier utilisateur"
                }
              </p>
              {!searchTerm && filterRole === "Tous" && filterStatus === "Tous" && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un utilisateur</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}