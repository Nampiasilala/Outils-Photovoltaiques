"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Toaster() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      pauseOnHover
      pauseOnFocusLoss={false}
      newestOnTop
      closeOnClick
      draggable
      className="text-sm"
      theme="light"
      
    />
  );
}
