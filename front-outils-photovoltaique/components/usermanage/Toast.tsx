"use client";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function Toast({ toast }: { toast: { show: boolean; message: string; type: "success" | "error" | "info" } }) {
  if (!toast.show) return null;
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className={`p-4 rounded-lg shadow-lg border flex items-center space-x-3 ${
        toast.type === "success"
          ? "bg-green-50 border-green-200 text-green-800"
          : toast.type === "error"
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-blue-50 border-blue-200 text-blue-800"
      }`}>
        {(toast.type === "success" || toast.type === "info") && <CheckCircle className="w-5 h-5" />}
        {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}