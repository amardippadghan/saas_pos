import { FormEvent, useState, useEffect } from 'react';
import { Banknote, Printer, Loader2 } from 'lucide-react';
import { Modal } from '../../../../components/ui/modal';
import { Button } from '../../../../components/ui/button';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../../../lib/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  handleCheckout: (e: FormEvent) => void;
  checkoutLoading: boolean;
  receipt: any;
  closeReceipt: () => void;
  // Razorpay props
  cartItems: { productVariantId: string; quantity: number }[];
  branchId: string;
  customerId?: string;
  onRazorpaySuccess: (receipt: any) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutModal({
  isOpen, onClose, grandTotal,
  paymentMethod, setPaymentMethod,
  handleCheckout, checkoutLoading,
  receipt, closeReceipt,
  cartItems, branchId, customerId,
  onRazorpaySuccess
}: CheckoutModalProps) {
  const router = useRouter();
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [razorpayError, setRazorpayError] = useState('');

  // On mount, check if Razorpay is enabled for this organization
  useEffect(() => {
    const checkRazorpay = async () => {
      try {
        const config = await fetchApi('/payments/razorpay/config');
        if (config.enabled) {
          setRazorpayEnabled(true);
        }
      } catch {
        // Razorpay not configured, that's fine
      }
    };
    checkRazorpay();
  }, []);

  // Load Razorpay checkout.js script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayCheckout = async (e: FormEvent) => {
    e.preventDefault();
    setRazorpayLoading(true);
    setRazorpayError('');

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setRazorpayError('Failed to load Razorpay. Please check your internet connection.');
        setRazorpayLoading(false);
        return;
      }

      // 2. Create order on our backend
      const orderData = await fetchApi('/payments/razorpay/create-order', {
        method: 'POST',
        body: JSON.stringify({
          branchId,
          customerId: customerId || undefined,
          items: cartItems,
        }),
      });

      // 3. Open Razorpay popup
      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency,
        name: 'POS Checkout',
        description: 'Purchase Payment',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          // 4. On successful payment, verify and place order
          try {
            const result = await fetchApi('/payments/razorpay/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                branchId,
                customerId: customerId || undefined,
                items: cartItems,
              }),
            });
            onRazorpaySuccess(result.receipt);
          } catch (err: any) {
            setRazorpayError(err.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setRazorpayLoading(false);
          },
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setRazorpayError(`Payment failed: ₹{response.error.description}`);
        setRazorpayLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setRazorpayError(err.message || 'Failed to initiate payment');
      setRazorpayLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'RAZORPAY') {
      handleRazorpayCheckout(e);
    } else {
      handleCheckout(e);
    }
  };

  const isProcessing = checkoutLoading || razorpayLoading;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout">
      {!receipt ? (
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="text-center space-y-2 mb-6">
            <p className="text-gray-500">Total Amount Due</p>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white">₹{grandTotal.toFixed(2)}</p>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Payment Method</label>
            <div className={`grid ₹{razorpayEnabled ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
              <button 
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl gap-2 transition-all ₹{paymentMethod === 'CASH' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
              >
                <Banknote size={24} />
                <span className="font-bold">Cash</span>
              </button>

              {razorpayEnabled && (
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl gap-2 transition-all ₹{paymentMethod === 'RAZORPAY' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 9.76L14.16 22H9.73L13.58 15.22L10.28 4H14.25L16.47 12.18L22 9.76Z" fill="currentColor"/>
                    <path d="M7.32 4H3L9.12 22H13.44L7.32 4Z" fill="currentColor" opacity="0.7"/>
                  </svg>
                  <span className="font-bold">Razorpay</span>
                </button>
              )}
            </div>
          </div>

          {razorpayError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{razorpayError}</p>
            </div>
          )}

          <Button type="submit" className="w-full h-12 text-lg" disabled={isProcessing}>
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </span>
            ) : paymentMethod === 'RAZORPAY' ? (
              'Pay with Razorpay'
            ) : (
              'Complete Payment'
            )}
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
          
          <div className="space-y-3">
            <Button 
              onClick={() => router.push(`/dashboard/orders/${receipt.saleId}/receipt`)} 
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <Printer size={18} className="mr-2" /> 
              Print / Download Receipt
            </Button>
            <Button onClick={closeReceipt} className="w-full" variant="outline">Start New Sale</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
