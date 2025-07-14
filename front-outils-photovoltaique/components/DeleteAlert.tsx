/* DeleteAlert.tsx — version stylée */
"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteAlertProps {
  label: string;
  onConfirm: () => void;
}

export default function DeleteAlert({ label, onConfirm }: DeleteAlertProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-600 hover:text-red-800 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      {/* ⬇️  Ajout de styles Tailwind */}
      <AlertDialogContent className="sm:max-w-[420px] rounded-2xl shadow-2xl border p-8 animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
        {/* Icône d’avertissement */}
        <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <AlertDialogHeader className="text-center space-y-2">
          <AlertDialogTitle className="text-lg font-semibold text-gray-900">
            {label}
          </AlertDialogTitle>
          <p className="text-gray-500 text-sm">
            Cette action est irréversible.
          </p>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="w-full">Annuler</Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={onConfirm}
            >
              Supprimer
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
