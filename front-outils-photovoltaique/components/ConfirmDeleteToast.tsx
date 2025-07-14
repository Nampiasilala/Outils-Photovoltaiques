"use client";

import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";

/* ⬇️ closeToast devient optionnel */
interface ConfirmDeleteToastProps {
  closeToast?: () => void;
  label?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

/* Composant rendu dans le toast */
export function ConfirmDeleteToast({
  closeToast,
  label = "Supprimer cet élément ?",
  onConfirm,
  onCancel,
}: ConfirmDeleteToastProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Trash2 className="w-6 h-6 text-red-600 flex-shrink-0" />
        <span className="font-medium text-gray-800">{label}</span>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => {
            onCancel?.();
            closeToast?.();
          }}
          className="flex-1 py-1 border rounded-lg text-gray-700 hover:bg-gray-100"
        >
          Annuler
        </button>

        <button
          onClick={() => {
            onConfirm();
            closeToast?.();
          }}
          className="flex-1 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}

/* Helper d’affichage */
export const showConfirmDelete = (
  opts: Omit<ConfirmDeleteToastProps, "closeToast">
) =>
  toast(<ConfirmDeleteToast {...opts} />, {
    closeOnClick: false,
    autoClose: false,
  });
