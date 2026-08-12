'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Modal } from '../../../components/ui/modal';
import { ShoppingCart, Search, Plus, Minus, X, CreditCard, Banknote, Smartphone } from 'lucide-react';

interface CartItem {
  variantId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function POSPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
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
      const [branchesData, productsData, taxesData, customersData] = await Promise.all([
        fetchApi('/branches'),
        fetchApi('/products'),
        fetchApi('/taxes'),
        fetchApi('/customers')
      ]);
      setBranches(branchesData);
      setProducts(productsData);
      setTaxes(taxesData.filter((t: any) => t.isActive));
      setCustomers(customersData);
      
      if (branchesData.length > 0) {
        setSelectedBranchId(branchesData[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

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
    <div className="h-[calc(100vh-8rem)] flex gap-6 overflow-hidden">
      {/* LEFT PANE: Product Grid */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none text-black dark:text-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={selectedBranchId}
            onChange={e => setSelectedBranchId(e.target.value)}
            options={branches.map(b => ({ label: b.name, value: b.id }))}
            className="w-48"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
          {filteredProducts.map(product => (
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
        </div>
      </div>

      {/* RIGHT PANE: The Cart */}
      <div className="w-96 flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 overflow-hidden shrink-0">
        <div className="p-4 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart size={20} /> Current Sale
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <ShoppingCart size={48} className="opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.variantId} className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm pr-4 leading-tight">{item.name}</span>
                  <button onClick={() => removeFromCart(item.variantId)} className="text-gray-400 hover:text-red-500">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600">${item.price.toFixed(2)}</span>
                  <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-md border dark:border-gray-700 p-1">
                    <button onClick={() => updateQuantity(item.variantId, -1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><Minus size={14}/></button>
                    <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.variantId, 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><Plus size={14}/></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800 space-y-3">
          <div className="mb-4">
            <Select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              options={[{ label: 'Walk-in Customer (Guest)', value: '' }, ...customers.map(c => ({ label: c.name, value: c.id }))]}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          {taxBreakdown.map(tax => (
            <div key={tax.id} className="flex justify-between text-sm">
              <span className="text-gray-500">{tax.name} {tax.type === 'PERCENTAGE' ? `(${tax.value}%)` : ''}</span>
              <span className="font-medium">+${tax.calculatedAmount.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between text-xl font-bold pt-2 border-t dark:border-gray-700">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
          
          <Button 
            className="w-full h-14 text-lg font-bold mt-4" 
            disabled={cart.length === 0 || !selectedBranchId}
            onClick={() => setIsCheckoutOpen(true)}
          >
            Charge ${grandTotal.toFixed(2)}
          </Button>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="Checkout">
        {!receipt ? (
          <form onSubmit={handleCheckout} className="space-y-6">
            <div className="text-center space-y-2 mb-6">
              <p className="text-gray-500">Total Amount Due</p>
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white">${grandTotal.toFixed(2)}</p>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl gap-2 transition-all ${paymentMethod === 'CASH' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                >
                  <Banknote size={24} />
                  <span className="font-bold">Cash</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl gap-2 transition-all ${paymentMethod === 'CARD' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                >
                  <CreditCard size={24} />
                  <span className="font-bold">Card</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl gap-2 transition-all ${paymentMethod === 'UPI' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                >
                  <Smartphone size={24} />
                  <span className="font-bold">UPI</span>
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg" disabled={checkoutLoading}>
              {checkoutLoading ? 'Processing...' : 'Complete Payment'}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-6 py-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold">Payment Successful</h3>
              <p className="text-gray-500 mt-2">Receipt No: <span className="font-mono font-bold text-gray-900 dark:text-white">{receipt.receiptNumber}</span></p>
            </div>
            <Button onClick={closeReceipt} className="w-full">Start New Sale</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
