// app/components/DeleteAlert.tsx
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
} from "@/ui/alert-dialog"; // Adjust the import path as necessary
import { Button } from "@/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"; // Import Loader2 for loading animation

interface DeleteAlertProps {
  label: string;
  onConfirm: () => Promise<void>; // Use Promise<void> since the action might be async
  isLoading: boolean; // Add the isLoading prop
}

export default function DeleteAlert({ label, onConfirm, isLoading }: DeleteAlertProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {/* The button that triggers the alert dialog */}
        <Button
          variant="ghost"
          size="icon"
          className="text-red-600 hover:text-red-800 hover:bg-red-100"
          disabled={isLoading} // Disable the trigger button when loading
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-[420px] rounded-2xl shadow-2xl border p-8 animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
        {/* Warning Icon */}
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

        <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
          <AlertDialogAction asChild>
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={onConfirm}
              disabled={isLoading} // Disable the action button during loading
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </AlertDialogAction>
          <AlertDialogCancel asChild>
            <Button variant="outline" className="w-full" disabled={isLoading}>
              Annuler
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}