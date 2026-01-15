'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from './Button';
import { Button as UIButton } from './ui/button';

export default function Navbar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm z-50 pb-2">
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

          {/* CTA Buttons & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg border border-blue-700">
                  <div className="flex flex-col">
                    <span className="text-xs text-blue-100 font-medium">Welcome</span>
                    <span className="text-sm font-semibold text-white">{user.name || user.email}</span>
                  </div>
                </div>
                <UIButton
                  onClick={handleLogout}
                  variant="destructive"
                  size="sm"
                  className="font-medium"
                >
                  Logout
                </UIButton>
              </div>
            ) : (
              <>
                <Button
                  as={Link}
                  href="/auth/signup"
                  variant="primary"
                  className="text-xs sm:text-sm"
                >
                  Signup
                </Button>
                <Button
                  as={Link}
                  href="/auth/login"
                  variant="outline"
                  className="text-xs sm:text-sm"
                >
                  Signin
                </Button>
              </>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Toggle menu"
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

        {/* Mobile Menu section starts here */}
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
              {user ? (
                <div className="px-4 py-3">
                  <div className="mb-3 p-3 bg-blue-600 rounded-lg border border-blue-700">
                    <p className="text-xs text-blue-100 font-medium mb-1">Welcome</p>
                    <p className="text-sm font-semibold text-white">{user.name || user.email}</p>
                  </div>
                  <UIButton
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    variant="destructive"
                    size="sm"
                    className="w-full font-medium"
                  >
                    Logout
                  </UIButton>
                </div>
              ) : (
                <>
                  <Button
                    as={Link}
                    href="/auth/signup"
                    variant="primary"
                    className="w-full text-xs sm:text-sm mt-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Signup
                  </Button>
                  <Button
                    as={Link}
                    href="/auth/login"
                    variant="outline"
                    className="w-full text-xs sm:text-sm mt-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Signin
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}