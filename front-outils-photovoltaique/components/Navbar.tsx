"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState({
    menu: false,
    services: false,
  });

  const toggleMenu = () => {
    setIsOpen((prev) => ({
      ...prev,
      menu: !prev.menu,
      services: false, // Reset services submenu when toggling main menu
    }));
  };

  const toggleServices = () => {
    setIsOpen((prev) => ({
      ...prev,
      services: !prev.services,
    }));
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="mx-auto max-w-8xl px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between h-11 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-green-600 flex items-center gap-2">
              <svg
                className="w-8 h-8 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              SolarCalc
            </Link>
          </div>

          {/* Menu Desktop */}
          <div className="hidden text-sm lg:flex space-x-8 items-center">
            <Link href="/about" className="text-gray-700 hover:text-green-600 transition duration-300">
              À propos
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-green-600 transition duration-300 flex items-center">
                Services
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg mt-2 w-48">
                <Link
                  href="/services/installation"
                  className="block px-4 py-2 text-gray-700 hover:bg-green-100"
                >
                  Installation
                </Link>
                <Link
                  href="/services/consulting"
                  className="block px-4 py-2 text-gray-700 hover:bg-green-100"
                >
                  Consulting
                </Link>
              </div>
            </div>
            <Link href="/contact" className="text-gray-700 hover:text-green-600 transition duration-300">
              Contact
            </Link>
            <Link
              href="/calculate"
              className="btn btn-primary bg-green-600 text-white hover:bg-green-700"
            >
              Calculer
            </Link>
          </div>

          {/* Menu Mobile */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="btn btn-ghost text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Dropdown */}
      {isOpen.menu && (
        <div className="lg:hidden bg-white shadow-lg">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              href="/about"
              className="block text-gray-700 hover:text-green-600 px-3 py-2"
              onClick={toggleMenu}
            >
              À propos
            </Link>
            <div className="relative">
              <button
                className="text-gray-700 hover:text-green-600 px-3 py-2 flex items-center w-full text-left"
                onClick={toggleServices}
              >
                Services
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className={`pl-4 ${isOpen.services ? "block" : "hidden"}`}>
                <Link
                  href="/services/installation"
                  className="block px-3 py-2 text-gray-700 hover:bg-green-100"
                  onClick={toggleMenu}
                >
                  Installation
                </Link>
                <Link
                  href="/services/consulting"
                  className="block px-3 py-2 text-gray-700 hover:bg-green-100"
                  onClick={toggleMenu}
                >
                  Consulting
                </Link>
              </div>
            </div>
            <Link
              href="/contact"
              className="block text-gray-700 hover:text-green-600 px-3 py-2"
              onClick={toggleMenu}
            >
              Contact
            </Link>
            <Link
              href="/calculate"
              className="block btn btn-primary bg-green-600 text-white hover:bg-green-700 px-3 py-2"
              onClick={toggleMenu}
            >
              Calculer
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}