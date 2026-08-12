'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Store, Users, Tags, Package, LayoutDashboard, LogOut, Boxes, Calculator, Receipt, Settings } from 'lucide-react';
import { fetchApi } from '../../lib/api';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Point of Sale', href: '/dashboard/pos', icon: Calculator },
  { name: 'Orders & Sales', href: '/dashboard/orders', icon: Receipt },
  { name: 'Branches', href: '/dashboard/branches', icon: Store },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Boxes },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Categories', href: '/dashboard/categories', icon: Tags },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Taxes & Fees', href: '/dashboard/settings/taxes', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore errors on logout
    }
    localStorage.removeItem('organization_id');
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen border-r border-gray-800">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Store className="text-blue-500" /> POS SaaS
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
