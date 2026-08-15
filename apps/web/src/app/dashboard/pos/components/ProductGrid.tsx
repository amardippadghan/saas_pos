import { RefObject } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';

interface ProductGridProps {
  search: string;
  setSearch: (val: string) => void;
  branches: any[];
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  categories: any[];
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  products: any[];
  addToCart: (product: any, variant: any) => void;
  hasNextPage: boolean;
  isLoadingProducts: boolean;
  observerTarget: RefObject<HTMLDivElement | null>;
}

export default function ProductGrid({
  search, setSearch,
  branches, selectedBranchId, setSelectedBranchId,
  categories, selectedCategoryId, setSelectedCategoryId,
  products, addToCart,
  hasNextPage, isLoadingProducts, observerTarget
}: ProductGridProps) {
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 overflow-hidden min-h-[600px] lg:min-h-0">
      <div className="p-4 border-b dark:border-gray-800 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            <Input 
              type="text" 
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none text-black dark:text-white text-lg transition-all shadow-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48 shrink-0">
            <Select
              value={selectedBranchId}
              onChange={e => setSelectedBranchId(e.target.value)}
              options={branches.map(b => ({ label: b.name, value: b.id }))}
              className="h-12"
            />
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all ${
              selectedCategoryId === 'all' 
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            All Items
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all ${
                selectedCategoryId === cat.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
        {products.map(product => (
          product.variants?.map((variant: any) => (
            <button 
              key={variant.id}
              onClick={() => addToCart(product, variant)}
              className="flex flex-col text-left p-4 border dark:border-gray-800 rounded-xl hover:border-blue-500 hover:shadow-md transition-all bg-gray-50 dark:bg-gray-800 h-32"
            >
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">{product.category?.name || 'Item'}</span>
              <span className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">{product.name}</span>
              {variant.name !== 'Default' && (
                <span className="text-sm text-gray-500 mt-1">{variant.name}</span>
              )}
              <div className="mt-auto pt-2 flex justify-between items-center w-full">
                <span className="font-bold text-lg text-gray-900 dark:text-white">${Number(variant.sellingPrice).toFixed(2)}</span>
                <Plus className="text-gray-400" size={16} />
              </div>
            </button>
          ))
        ))}
        
        {hasNextPage && (
          <div ref={observerTarget} className="col-span-full h-20 flex items-center justify-center">
            {isLoadingProducts && <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
          </div>
        )}
      </div>
    </div>
  );
}
