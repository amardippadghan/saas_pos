'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { ReceiptText, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Modal } from '../../../components/ui/modal';

export default function OrdersPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);

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
                <TableRow key={sale.id}>
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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedSale(sale)}>
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={!!selectedSale} onClose={() => setSelectedSale(null)} title="Sale Details">
        {selectedSale && (
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b dark:border-gray-800 pb-4">
              <div>
                <h3 className="font-bold text-lg">{getReceiptNumber(selectedSale)}</h3>
                <p className="text-sm text-gray-500">{new Date(selectedSale.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">{selectedSale.status}</span>
                <p className="text-sm font-medium mt-1">{selectedSale.branch?.name}</p>
              </div>
            </div>

            <div className="space-y-2 border-b dark:border-gray-800 pb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${Number(selectedSale.subtotal).toFixed(2)}</span>
              </div>
              
              {selectedSale.taxBreakdown && Array.isArray(selectedSale.taxBreakdown) && selectedSale.taxBreakdown.map((tax: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{tax.name} {tax.type === 'PERCENTAGE' ? `(${tax.value}%)` : ''}</span>
                  <span>+${Number(tax.amountCalculated).toFixed(2)}</span>
                </div>
              ))}
              {(!selectedSale.taxBreakdown || selectedSale.taxBreakdown.length === 0) && (
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Taxes/Fees</span>
                  <span>${Number(selectedSale.taxAmount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Discount</span>
                <span className="text-red-500">-${Number(selectedSale.discountAmount).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-bold pt-2">
              <span>Grand Total</span>
              <span>${Number(selectedSale.grandTotal).toFixed(2)}</span>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button onClick={() => setSelectedSale(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
