'use client';

import { Suspense } from 'react';
import AdminPageContent from './AdminPageContent';

export default function AdminPage() {
  return (
    <Suspense fallback={
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </main>
    }>
      <AdminPageContent />
    </Suspense>
  );
}
