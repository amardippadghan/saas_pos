'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../../lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, ReceiptText, Calendar, Building, User, Printer } from 'lucide-react';
import { Card } from '../../../../components/ui/card';

export default function OrderViewPage() {
  const params = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    const loadSale = async () => {
      try {
        setLoading(true);
        const data = await fetchApi(`/sales/${params.id}`);
        setSale(data);
      } catch (err) {
        console.error(err);
        router.push('/dashboard/orders');
      } finally {
        setLoading(false);
      }
    };
    loadSale();
  }, [params.id, router]);

  if (loading) return <div className="p-8 text-gray-500">Loading order details...</div>;
  if (!sale) return null;

  const receiptNumber = sale.receipts?.[0]?.receiptNumber || sale.id.slice(0, 8);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ReceiptText className="text-blue-500" /> Order {receiptNumber}
            </h1>
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 mt-1 inline-block">
              {sale.status}
            </span>
          </div>
        </div>
        <Button className="gap-2" variant="outline" onClick={() => window.print()}>
          <Printer size={16} /> Print Receipt
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg border-b pb-2 dark:border-gray-800 mb-4">Order Items</h3>
            
            <div className="space-y-4">
              {sale.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b dark:border-gray-800 last:border-0">
                  <div>
                    <p className="font-medium">{item.productVariant?.product?.name}</p>
                    {item.productVariant?.name !== 'Default' && (
                      <p className="text-xs text-gray-500">{item.productVariant?.name} (SKU: {item.productVariant?.sku})</p>
                    )}
                    <p className="text-xs text-gray-500">{item.quantity} x ${Number(item.unitPrice).toFixed(2)}</p>
                  </div>
                  <div className="font-bold">${Number(item.subtotal).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg border-b pb-2 dark:border-gray-800 mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${Number(sale.subtotal).toFixed(2)}</span>
              </div>
              
              {sale.taxBreakdown && Array.isArray(sale.taxBreakdown) && sale.taxBreakdown.map((tax: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{tax.name} {tax.type === 'PERCENTAGE' ? `(${tax.value}%)` : ''}</span>
                  <span>+${Number(tax.amountCalculated).toFixed(2)}</span>
                </div>
              ))}
              {(!sale.taxBreakdown || sale.taxBreakdown.length === 0) && (
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Taxes/Fees</span>
                  <span>${Number(sale.taxAmount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Discount</span>
                <span className="text-red-500">-${Number(sale.discountAmount).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xl font-bold pt-4 border-t dark:border-gray-800 mt-4">
                <span>Grand Total</span>
                <span>${Number(sale.grandTotal).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t dark:border-gray-800">
              <h4 className="text-sm font-semibold mb-2">Payment Methods</h4>
              {sale.payments?.map((payment: any) => (
                <div key={payment.id} className="flex justify-between text-sm">
                  <span className="font-medium">{payment.method}</span>
                  <span>${Number(payment.amount).toFixed(2)} ({payment.status})</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-sm text-gray-500 mb-4 uppercase tracking-wider">Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="text-gray-400 mt-0.5 shrink-0" size={16} />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-gray-500">{new Date(sale.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building className="text-gray-400 mt-0.5 shrink-0" size={16} />
                <div>
                  <p className="text-sm font-medium">Branch</p>
                  <p className="text-sm text-blue-500 cursor-pointer hover:underline" onClick={() => router.push(`/dashboard/branches/${sale.branchId}`)}>
                    {sale.branch?.name || 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="text-gray-400 mt-0.5 shrink-0" size={16} />
                <div>
                  <p className="text-sm font-medium">Customer</p>
                  {sale.customer ? (
                    <p className="text-sm text-blue-500 cursor-pointer hover:underline" onClick={() => router.push(`/dashboard/customers/${sale.customerId}`)}>
                      {sale.customer.name}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Walk-in Customer</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
