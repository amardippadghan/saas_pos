'use client';
import { User, Search, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../lib/api';

export function Header() {
  const [user, setUser] = useState<any>(null);
  
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchApi('/auth/me');
        setUser(userData);
      } catch (err) {}
    };
    loadUser();

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetchApi(`/search?q=${encodeURIComponent(searchQuery)}`);
          setSearchResults(res);
          setShowResults(true);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleResultClick = (url: string) => {
    setShowResults(false);
    setSearchQuery('');
    router.push(url);
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center justify-between px-8 shadow-sm">
      <div className="flex-1 flex items-center">
        {/* Global Search Bar */}
        <div ref={searchRef} className="relative w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products, customers, orders (Press / to focus)"
              className="w-full pl-10 pr-10 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none text-black dark:text-white transition-all text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.length >= 2) setShowResults(true); }}
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={16} />
            )}
          </div>
          
          {/* Dropdown Results */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
              <div className="p-2">
                {searchResults.map((result: any, idx: number) => (
                  <button
                    key={`${result.type}-${result.id}-${idx}`}
                    onClick={() => handleResultClick(result.url)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex flex-col gap-1 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{result.title}</span>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">{result.type}</span>
                    </div>
                    <span className="text-xs text-gray-500 line-clamp-1">{result.subtitle}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {showResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl shadow-xl p-4 text-center text-gray-500 text-sm z-50">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 relative" ref={userRef}>
        <button 
          onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors py-1.5 px-3 rounded-full"
        >
          <User size={16} />
          {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
        </button>

        {isUserDropdownOpen && user && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden p-2">
            <div className="px-4 py-3 border-b dark:border-gray-800 mb-2">
              <p className="font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.role && <p className="text-xs mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full inline-block font-medium">{user.role}</p>}
            </div>
            
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
