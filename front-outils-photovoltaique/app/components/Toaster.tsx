// app/components/Toaster.tsx
"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Toaster() {
  return <ToastContainer position="top-right" autoClose={4000} newestOnTop />;
}
