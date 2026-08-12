'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { Button } from '../../../components/ui/button';
import { ShoppingCart, Plus, Minus, X, CreditCard, Banknote } from 'lucide-react';

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/products');
      setProducts(data);
    } catch (err) {
      console.error('Error loading products', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any, variant: any) => {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.variantId === variant.id);
      if (existing) {
        return currentCart.map((item) =>
          item.variantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...currentCart,
        {
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          variantName: variant.name,
          price: Number(variant.sellingPrice),
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.variantId === variantId) {
            const newQuantity = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (variantId: string) => {
    setCart((currentCart) => currentCart.filter((item) => item.variantId !== variantId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax example
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const payload = {
        items: cart.map(item => ({
          productVariantId: item.variantId,
          quantity: item.quantity
        })),
        taxAmount: tax,
        discountAmount: 0,
        paymentMethod
      };

      await fetchApi('/sales', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setCart([]);
      alert('Sale completed successfully!');
    } catch (err) {
      console.error('Error completing sale', err);
      alert('Failed to complete sale');
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Products Grid */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Products</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border dark:border-gray-800 rounded-lg p-4 hover:border-blue-500 transition-colors">
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <div className="space-y-2">
                  {product.variants?.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => addToCart(product, variant)}
                      className="w-full text-left p-2 text-sm bg-gray-50 dark:bg-gray-800 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex justify-between items-center"
                    >
                      <span>{variant.name || 'Default'}</span>
                      <span className="font-medium">${Number(variant.sellingPrice).toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 flex flex-col">
        <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart size={24} /> Current Order
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.variantId} className="flex justify-between items-start border-b dark:border-gray-800 pb-4">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-xs text-gray-500">{item.variantName || 'Default'}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => updateQuantity(item.variantId, -1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.variantId, 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="text-right flex flex-col justify-between items-end h-full">
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.variantId)} className="text-red-500 hover:text-red-700 p-1 mt-2">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t dark:border-gray-800">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button
              variant={paymentMethod === 'CASH' ? 'primary' : 'outline'}
              className="gap-2"
              onClick={() => setPaymentMethod('CASH')}
            >
              <Banknote size={16} /> Cash
            </Button>
            <Button
              variant={paymentMethod === 'CARD' ? 'primary' : 'outline'}
              className="gap-2"
              onClick={() => setPaymentMethod('CARD')}
            >
              <CreditCard size={16} /> Card
            </Button>
          </div>

          <Button
            className="w-full h-12 text-lg"
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            Complete Sale
          </Button>
        </div>
      </div>
    </div>
  );
}