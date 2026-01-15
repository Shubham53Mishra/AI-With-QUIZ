'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/auth/login');
          return;
        }
        const data = await response.json();
        const user = data.user;
        // Redirect admins away from user pages
        if (user.role === 'admin' || user.role === 'assistant admin') {
          router.push('/admin');
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  // Show loading while checking auth
  if (isAuthChecking) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  // Don't render if not authenticated (router will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return children;
}
