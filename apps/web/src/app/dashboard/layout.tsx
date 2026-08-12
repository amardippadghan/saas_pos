'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await fetchApi('/auth/me');
        setUser(userData);
      } catch (err) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  if (!user) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          <h1 className="text-lg font-bold">POS SaaS</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-800">Dashboard</a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-400">Products</a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-400">Sales</a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800 text-gray-400">Customers</a>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={async () => {
              try {
                await fetchApi('/auth/logout', { method: 'POST' });
              } catch (e) {
                // Ignore errors on logout
              }
              localStorage.removeItem('organization_id');
              router.push('/login');
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b flex items-center px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Welcome, {user.firstName}</h2>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
