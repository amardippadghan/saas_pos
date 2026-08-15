'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { fetchApi } from '../../../lib/api';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';

const CheckoutModal = dynamic(() => import('./components/CheckoutModal'), {
  ssr: false,
});

interface CartItem {
  variantId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function POSPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [branchesData, taxesData, categoriesData] = await Promise.all([
        fetchApi('/branches'),
        fetchApi('/taxes'),
        fetchApi('/categories').catch(() => [])
      ]);
      setBranches(branchesData);
      setTaxes(taxesData.filter((t: any) => t.isActive));
      setCategories(categoriesData);
      
      if (branchesData.length > 0) {
        setSelectedBranchId(branchesData[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = useCallback(async (reset = false) => {
    if (isLoadingProducts || (!hasNextPage && !reset)) return;
    
    setIsLoadingProducts(true);
    const currentCursor = reset ? null : cursor;
    
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedCategoryId !== 'all') queryParams.append('categoryId', selectedCategoryId);
      if (currentCursor) queryParams.append('cursor', currentCursor);
      queryParams.append('limit', '20');

      const data = await fetchApi(`/products?${queryParams.toString()}`);
      
      if (reset) {
        setProducts(data.data || []);
      } else {
        setProducts(prev => [...prev, ...(data.data || [])]);
      }
      
      setCursor(data.nextCursor);
      setHasNextPage(!!data.nextCursor);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [search, selectedCategoryId, cursor, hasNextPage, isLoadingProducts]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      setIsLoadingProducts(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedCategoryId !== 'all') queryParams.append('categoryId', selectedCategoryId);
      queryParams.append('limit', '20');
      
      fetchApi(`/products?${queryParams.toString()}`).then(data => {
        setProducts(data.data || []);
        setCursor(data.nextCursor);
        setHasNextPage(!!data.nextCursor);
        setIsLoadingProducts(false);
      }).catch(() => setIsLoadingProducts(false));
      
    }, 300);
    return () => clearTimeout(searchTimeout.current!);
  }, [search, selectedCategoryId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isLoadingProducts) {
          fetchProducts(false);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchProducts, hasNextPage, isLoadingProducts]);

  const addToCart = (product: any, variant: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.variantId === variant.id);
      if (existing) {
        return prev.map(item => item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        variantId: variant.id,
        name: `${product.name} - ${variant.name}`,
        price: Number(variant.sellingPrice),
        quantity: 1
      }];
    });
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.variantId === variantId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const taxBreakdown = taxes.map(tax => {
    let amount = 0;
    if (tax.type === 'PERCENTAGE') {
      amount = (subtotal * Number(tax.value)) / 100;
    } else {
      amount = Number(tax.value);
    }
    return { ...tax, calculatedAmount: amount };
  });

  const totalTaxAmount = taxBreakdown.reduce((acc, tax) => acc + tax.calculatedAmount, 0);
  const grandTotal = subtotal + totalTaxAmount;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutLoading(true);
    try {
      const res = await fetchApi('/sales/checkout', {
        method: 'POST',
        body: JSON.stringify({
          branchId: selectedBranchId,
          customerId: selectedCustomerId || undefined,
          paymentMethod,
          items: cart.map(item => ({
            productVariantId: item.variantId,
            quantity: item.quantity
          }))
        })
      });
      setReceipt(res.receipt);
      setCart([]);
    } catch (err) {
      console.error('Checkout failed', err);
      alert('Checkout Failed. Check console.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const closeReceipt = () => {
    setIsCheckoutOpen(false);
    setReceipt(null);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0">
      <ProductGrid 
        search={search}
        setSearch={setSearch}
        branches={branches}
        selectedBranchId={selectedBranchId}
        setSelectedBranchId={setSelectedBranchId}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        products={products}
        addToCart={addToCart}
        hasNextPage={hasNextPage}
        isLoadingProducts={isLoadingProducts}
        observerTarget={observerTarget}
      />

      <Cart 
        cart={cart}
        selectedCustomerId={selectedCustomerId}
        setSelectedCustomerId={setSelectedCustomerId}
        selectedBranchId={selectedBranchId}
        subtotal={subtotal}
        taxBreakdown={taxBreakdown}
        grandTotal={grandTotal}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        setIsCheckoutOpen={setIsCheckoutOpen}
      />

      {isCheckoutOpen && (
        <CheckoutModal 
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          grandTotal={grandTotal}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          handleCheckout={handleCheckout}
          checkoutLoading={checkoutLoading}
          receipt={receipt}
          closeReceipt={closeReceipt}
        />
      )}
    </div>
  );
}
