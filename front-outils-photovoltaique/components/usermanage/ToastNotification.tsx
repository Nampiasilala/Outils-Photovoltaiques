"use client";

import { CheckCircle, AlertCircle } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  show: boolean;
  message: string;
  type: ToastType;
}

export default function ToastNotification({ show, message, type }: ToastProps) {
  if (!show) return null;

  const baseStyle = "p-4 rounded-lg shadow-lg border flex items-center space-x-3";
  const typeStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const icon =
    type === "success" ? (
      <CheckCircle className="w-5 h-5" />
    ) : (
      <AlertCircle className="w-5 h-5" />
    );

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className={`${baseStyle} ${typeStyles[type]}`}>{icon}<span>{message}</span></div>
    </div>
  );
}
