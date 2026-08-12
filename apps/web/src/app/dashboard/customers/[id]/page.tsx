'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../../lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, User, Phone, Mail, ShoppingBag } from 'lucide-react';
import { Card } from '../../../../components/ui/card';

export default function CustomerViewPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    const loadCustomer = async () => {
      try {
        setLoading(true);
        const data = await fetchApi(`/customers/${params.id}`);
        setCustomer(data);
      } catch (err) {
        console.error(err);
        router.push('/dashboard/customers');
      } finally {
        setLoading(false);
      }
    };
    loadCustomer();
  }, [params.id, router]);

  if (loading) return <div className="p-8 text-gray-500">Loading customer details...</div>;
  if (!customer) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-full">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <User className="text-blue-500" /> {customer.name}
          </h1>
          <p className="text-gray-500 text-sm">Customer Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 col-span-1 space-y-4">
          <h3 className="font-bold text-lg border-b pb-2 dark:border-gray-800">Contact Info</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="text-gray-400" size={16} />
              <span>{customer.email || 'No email provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="text-gray-400" size={16} />
              <span>{customer.phone || 'No phone provided'}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 col-span-1 md:col-span-2">
          <h3 className="font-bold text-lg border-b pb-2 dark:border-gray-800 flex items-center gap-2">
            <ShoppingBag size={18}/> Lifetime Order History
          </h3>
          
          <div className="mt-4 space-y-3">
            {!customer.sales || customer.sales.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No orders found for this customer.</p>
            ) : (
              customer.sales.map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between p-3 border dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors" onClick={() => router.push(`/dashboard/orders/${sale.id}`)}>
                  <div>
                    <div className="font-bold text-sm">Order #{sale.receipts?.[0]?.receiptNumber || sale.id.slice(-6)}</div>
                    <div className="text-xs text-gray-500">{new Date(sale.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${Number(sale.grandTotal).toFixed(2)}</div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">{sale.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
