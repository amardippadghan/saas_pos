import { ShoppingCart, X, Minus, Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import CustomerSelect from './CustomerSelect';

interface CartItem {
  variantId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  cart: CartItem[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  selectedBranchId: string;
  subtotal: number;
  taxBreakdown: any[];
  grandTotal: number;
  updateQuantity: (variantId: string, delta: number) => void;
  removeFromCart: (variantId: string) => void;
  setIsCheckoutOpen: (val: boolean) => void;
}

export default function Cart({
  cart, selectedCustomerId, setSelectedCustomerId,
  selectedBranchId, subtotal, taxBreakdown, grandTotal,
  updateQuantity, removeFromCart, setIsCheckoutOpen
}: CartProps) {
  return (
    <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 overflow-hidden shrink-0 min-h-[400px]">
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
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-base pr-4 leading-tight text-gray-900 dark:text-white">{item.name}</span>
                <button onClick={() => removeFromCart(item.variantId)} className="text-gray-400 hover:text-red-500">
                  <X size={18} />
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
          <CustomerSelect
            selectedCustomerId={selectedCustomerId}
            setSelectedCustomerId={setSelectedCustomerId}
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
  );
}
