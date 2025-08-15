// "use client";

// import Link from "next/link";
// import { useAuth } from "./AuthContext";
// import { usePermissions } from "./RouteGuard";
// import { useState } from "react";
// import { usePathname } from "next/navigation";
// import {
//   Menu, 
//   LogOut, 
//   LogIn, 
//   UserPlus, 
//   Settings, 
//   Users, 
//   History, 
//   FileText, 
//   Calculator, 
//   User,
//   Shield,
//   Crown
// } from "lucide-react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function Navbar() {
//   const { user, logout } = useAuth();
//   const permissions = usePermissions();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const pathname = usePathname();

//   const isActive = (href: string) => pathname === href;

//   const handleLogout = () => {
//     logout();
//     toast.info("Vous avez été déconnecté.");
//   };

//   // Configuration des liens avec permissions
//   const navigationLinks = [
//     {
//       href: "/calculate",
//       label: "Dimensionnement",
//       icon: <Calculator className="w-4 h-4" />,
//       show: true, // Accessible à tous les utilisateurs connectés
//     },
//     {
//       href: "/history",
//       label: "Historique",
//       icon: <History className="w-4 h-4" />,
//       show: true, // Accessible à tous les utilisateurs connectés
//     },
//     {
//       href: "/technical",
//       label: "Équipements",
//       icon: <FileText className="w-4 h-4" />,
//       show: permissions.canViewEquipments,
//     },
//     {
//       href: "/parametre_systeme",
//       label: "Configuration",
//       icon: <Settings className="w-4 h-4" />,
//       show: permissions.canViewParameters,
//       adminOnly: !permissions.canUpdateParameters, // Lecture seule si pas admin
//     },
//     {
//       href: "/user_management",
//       label: "Utilisateurs",
//       icon: <Users className="w-4 h-4" />,
//       show: permissions.canViewUsers,
//     },
//     {
//       href: "/profile",
//       label: "Profil",
//       icon: <User className="w-4 h-4" />,
//       show: true, // Accessible à tous les utilisateurs connectés
//     },
//   ];

//   // Filtrer les liens selon les permissions
//   const visibleLinks = navigationLinks.filter(link => link.show);

//   const getUserRoleBadge = () => {
//     if (permissions.isAdmin) {
//       return (
//         <span 
//           className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full"
//           title="Administrateur"
//         >
//           <Crown className="w-3 h-3" />
//           Admin
//         </span>
//       );
//     }
//     if (permissions.isModerator) {
//       return (
//         <span 
//           className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
//           title="Modérateur"
//         >
//           <Shield className="w-3 h-3" />
//           Modérateur
//         </span>
//       );
//     }
//     return (
//       <span 
//         className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full"
//         title="Utilisateur standard"
//       >
//         <User className="w-3 h-3" />
//         Utilisateur
//       </span>
//     );
//   };

//   return (
//     <>
//       <nav className="fixed top-0 w-full z-50 bg-white shadow-md">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-14">
//             {/* Logo */}
//             <Link href="/" className="font-bold text-blue-600 text-sm">
//               Calculateur Solaire
//             </Link>

//             {/* Desktop navigation */}
//             <div className="hidden md:flex items-center space-x-1">
//               {user && (
//                 <>
//                   {/* Liens de navigation */}
//                   {visibleLinks.map(({ href, label, icon, adminOnly }) => (
//                     <div key={href} className="relative">
//                       <Link
//                         href={href}
//                         className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
//                           isActive(href) 
//                             ? "bg-blue-500 text-white" 
//                             : "text-gray-700 hover:bg-blue-100"
//                         }`}
//                       >
//                         {icon}
//                         <span className="hidden lg:inline text-sm">{label}</span>
//                         {adminOnly && (
//                           <span title="Lecture seule">
//                             <Shield className="w-3 h-3 text-yellow-500" />
//                           </span>
//                         )}
//                       </Link>
//                     </div>
//                   ))}

//                   {/* Badge de rôle */}
//                   <div className="ml-2">
//                     {getUserRoleBadge()}
//                   </div>

//                   {/* Bouton de déconnexion */}
//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 font-medium hover:bg-red-100 ml-2"
//                   >
//                     <LogOut className="w-4 h-4" />
//                     <span className="hidden lg:inline text-sm">Déconnexion</span>
//                   </button>
//                 </>
//               )}

//               {/* Liens pour les non-connectés */}
//               {!user && (
//                 <div className="flex items-center gap-2">
//                   <Link
//                     href="/login"
//                     className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium"
//                   >
//                     <LogIn className="w-4 h-4" />
//                     <span>Connexion</span>
//                   </Link>
//                   <Link
//                     href="/register"
//                     className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium"
//                   >
//                     <UserPlus className="w-4 h-4" />
//                     <span>Inscription</span>
//                   </Link>
//                 </div>
//               )}
//             </div>

//             {/* Mobile menu button */}
//             <div className="md:hidden">
//               <button 
//                 onClick={() => setIsMenuOpen(!isMenuOpen)} 
//                 className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
//                 aria-label="Menu de navigation"
//               >
//                 <Menu className="w-6 h-6" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Mobile navigation */}
//         {isMenuOpen && (
//           <div className="md:hidden bg-white shadow-md border-t">
//             <div className="px-2 pt-2 pb-3 space-y-1">
//               {user && (
//                 <>
//                   {/* Badge de rôle mobile */}
//                   <div className="px-4 py-2 border-b">
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm font-medium text-gray-900">{user.email}</span>
//                       {getUserRoleBadge()}
//                     </div>
//                   </div>

//                   {/* Liens de navigation mobile */}
//                   {visibleLinks.map(({ href, label, icon, adminOnly }) => (
//                     <Link
//                       key={href}
//                       href={href}
//                       className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all ${
//                         isActive(href) 
//                           ? "bg-blue-500 text-white" 
//                           : "text-gray-700 hover:bg-blue-100"
//                       }`}
//                       onClick={() => setIsMenuOpen(false)}
//                     >
//                       {icon}
//                       <span className="text-sm">{label}</span>
//                       {adminOnly && (
//                         <span className="ml-auto" title="Lecture seule">
//                           <Shield className="w-3 h-3 text-yellow-500" />
//                         </span>
//                       )}
//                     </Link>
//                   ))}

//                   {/* Déconnexion mobile */}
//                   <button
//                     onClick={() => {
//                       handleLogout();
//                       setIsMenuOpen(false);
//                     }}
//                     className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-100 rounded-md"
//                   >
//                     <LogOut className="w-4 h-4" />
//                     <span className="text-sm">Déconnexion</span>
//                   </button>
//                 </>
//               )}

//               {/* Liens pour les non-connectés mobile */}
//               {!user && (
//                 <div className="space-y-1">
//                   <Link 
//                     href="/login" 
//                     className="flex items-center gap-3 px-4 py-2 text-blue-600 text-sm hover:bg-blue-50 rounded-md"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     <LogIn className="w-4 h-4" />
//                     <span className="text-sm">Connexion</span>
//                   </Link>
//                   <Link 
//                     href="/register" 
//                     className="flex items-center gap-3 px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 rounded-md"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     <UserPlus className="w-4 h-4" />
//                     <span className="text-sm">Inscription</span>
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* Push content below navbar */}
//       <div className="h-14" />
//     </>
//   );
// }