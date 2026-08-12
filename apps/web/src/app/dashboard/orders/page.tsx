'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { ReceiptText, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const router = useRouter();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/sales');
      setSales(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getReceiptNumber = (sale: any) => {
    if (sale.receipts && sale.receipts.length > 0) {
      return sale.receipts[0].receiptNumber;
    }
    return sale.id.slice(0, 8);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales History</h1>
          <p className="text-gray-500">View and audit past transactions.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Grand Total</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow>
            ) : sales.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-gray-500">No sales recorded yet.</TableCell></TableRow>
            ) : (
              sales.map(sale => (
                <TableRow key={sale.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => router.push(`/dashboard/orders/${sale.id}`)}>
                  <TableCell className="font-mono text-sm font-medium text-blue-600">
                    <div className="flex items-center gap-2">
                      <ReceiptText size={16} />
                      {getReceiptNumber(sale)}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{sale.branch?.name || '-'}</TableCell>
                  <TableCell>{sale.customer?.name || 'Walk-in Customer'}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      {sale.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold">${Number(sale.grandTotal).toFixed(2)}</TableCell>
                  <TableCell>
                    <div onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.push(`/dashboard/orders/${sale.id}`)}>
                        <Eye size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
