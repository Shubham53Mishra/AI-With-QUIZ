'use client';

import { useRouter } from 'next/navigation';

export default function AdminHeader({ user }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/auth/admin-login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md z-50">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Admin Dashboard</h1>
              <p className="text-blue-100 text-xs sm:text-sm">Manage your quiz platform</p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right">
                <p className="text-sm sm:text-base font-semibold">{user.name || user.email}</p>
                <p className="text-xs text-blue-100">
                  {user.role === 'admin' ? '👑 Admin' : '⭐ Assistant Admin'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
