'use client';

import Button from './Button';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 sm:w-8 h-7 sm:h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm sm:text-lg">Q</span>
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent hidden sm:inline">
              Quiz Creator
            </span>
          </div>

          {/* Menu */}
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
            <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
              Sign in
            </Button>
            <Button variant="primary" size="sm">
              Get started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
