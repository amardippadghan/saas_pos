import { FormEvent, useState } from 'react';
import { Banknote, CreditCard, Smartphone, Download } from 'lucide-react';
import { Modal } from '../../../../components/ui/modal';
import { Button } from '../../../../components/ui/button';

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
}

export default function CheckoutModal({
  isOpen, onClose, grandTotal,
  paymentMethod, setPaymentMethod,
  handleCheckout, checkoutLoading,
  receipt, closeReceipt
}: CheckoutModalProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById('receipt-content');
      if (element) {
        // @ts-ignore - html2pdf doesn't have types installed
        const html2pdf = (await import('html2pdf.js')).default;
        const opt: any = {
          margin: 0,
          filename: `Receipt-${receipt.receiptNumber}.pdf`,
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: [80, 200], orientation: 'portrait' }
        };
        await html2pdf().set(opt).from(element).save();
      }
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout">
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
          
          <div className="space-y-3">
            <Button 
              onClick={generatePDF} 
              disabled={isGeneratingPdf}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <Download size={18} className="mr-2" /> 
              {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Receipt'}
            </Button>
            <Button onClick={closeReceipt} className="w-full" variant="outline">Start New Sale</Button>
          </div>

          {/* Hidden Receipt Content for PDF */}
          <div className="absolute left-[-9999px] top-0">
            <div id="receipt-content" className="p-8 text-black bg-white font-mono text-sm" style={{ width: '80mm' }}>
              <div className="text-center mb-6">
                <h1 className="font-bold text-2xl mb-1">POS SaaS</h1>
                <p className="text-xs text-gray-500">Sales Receipt</p>
              </div>
              
              <div className="mb-4">
                <p>Receipt: {receipt.receiptNumber}</p>
                <p>Date: {new Date().toLocaleString()}</p>
              </div>

              <div className="border-b-2 border-black border-dashed pb-2 mb-2">
                <div className="flex justify-between font-bold mb-2">
                  <span>Item</span>
                  <span>Total</span>
                </div>
                {receipt.cartSnapshot?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between mb-1">
                    <span className="pr-2">{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-b-2 border-black border-dashed pb-2 mb-2 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${receipt.subtotalSnapshot?.toFixed(2)}</span>
                </div>
                {receipt.taxSnapshot?.map((tax: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span>{tax.name}:</span>
                    <span>${tax.calculatedAmount?.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total:</span>
                <span>${receipt.totalSnapshot?.toFixed(2)}</span>
              </div>

              <div className="text-center text-xs">
                <p>Thank you for your purchase!</p>
                <p>Please come again</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
