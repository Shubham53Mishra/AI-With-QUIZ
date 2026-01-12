'use client';

import { useState } from 'react';
import Button from './Button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 sm:w-8 h-7 sm:h-8 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm sm:text-lg">Q</span>
            </div>
            <span className="text-lg sm:text-xl font-bold bg-linear-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent hidden sm:inline">
              Quiz Creator
            </span>
          </div>

          {/* Menu - Desktop */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition font-medium text-sm lg:text-base">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition font-medium text-sm lg:text-base">
              Pricing
            </a>
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition font-medium text-sm lg:text-base">
              About
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="secondary" size="sm">
              Sign in
            </Button>
            <Button variant="primary" size="sm">
              Get started
            </Button>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 pb-4">
            <div className="space-y-3 pt-4">
              <a 
                href="#features" 
                className="block text-gray-600 hover:text-gray-900 transition font-medium text-sm px-4 py-2 rounded hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Features
              </a>
              <a 
                href="#pricing" 
                className="block text-gray-600 hover:text-gray-900 transition font-medium text-sm px-4 py-2 rounded hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="#about" 
                className="block text-gray-600 hover:text-gray-900 transition font-medium text-sm px-4 py-2 rounded hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                About
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
