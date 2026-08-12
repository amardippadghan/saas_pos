'use client';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../lib/api';

export function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchApi('/auth/me');
        setUser(userData);
      } catch (err) {}
    };
    loadUser();
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center">
        {/* Can add breadcrumbs or page title here dynamically based on route */}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 py-1.5 px-3 rounded-full">
          <User size={16} />
          {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
        </div>
      </div>
    </header>
  );
}
