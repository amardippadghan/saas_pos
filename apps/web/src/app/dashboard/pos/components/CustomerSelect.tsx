import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { fetchApi } from '../../../../lib/api';

interface CustomerSelectProps {
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
}

export default function CustomerSelect({ selectedCustomerId, setSelectedCustomerId }: CustomerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCustomers('');
  }, []);

  const fetchCustomers = async (query: string) => {
    setLoading(true);
    try {
      const data = await fetchApi(`/customers${query ? `?search=${encodeURIComponent(query)}` : ''}`);
      setCustomers(data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (isOpen) {
      searchTimeout.current = setTimeout(() => {
        fetchCustomers(search);
      }, 300);
    }
    
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const displayLabel = selectedCustomerId === '' ? 'Walk-in Customer (Guest)' : selectedCustomer?.name || 'Select Customer...';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="p-2 border-b dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          
          <ul className="max-h-60 overflow-auto py-1 text-sm">
            <li 
              className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedCustomerId === '' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}
              onClick={() => {
                setSelectedCustomerId('');
                setIsOpen(false);
                setSearch('');
              }}
            >
              <span>Walk-in Customer (Guest)</span>
              {selectedCustomerId === '' && <Check size={14} />}
            </li>
            
            {loading ? (
              <li className="px-3 py-4 text-center text-gray-500">Loading customers...</li>
            ) : customers.length === 0 ? (
              <li className="px-3 py-4 text-center text-gray-500">No customers found</li>
            ) : (
              customers.map(c => (
                <li 
                  key={c.id}
                  className={`flex flex-col px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedCustomerId === c.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                  onClick={() => {
                    setSelectedCustomerId(c.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${selectedCustomerId === c.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {c.name}
                    </span>
                    {selectedCustomerId === c.id && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                  </div>
                  {(c.email || c.phone) && (
                    <span className="text-xs text-gray-500 mt-0.5">
                      {c.email} {c.email && c.phone && '•'} {c.phone}
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
