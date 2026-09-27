'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../../../lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '../../../../../components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">Loading PDF Viewer...</div> }
);

import ReceiptPDF from '../../../../../components/pdf/ReceiptPDF';
import InvoicePDF from '../../../../../components/pdf/InvoicePDF';

export default function ReceiptPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [format, setFormat] = useState<'receipt' | 'invoice'>('receipt');

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

  if (loading) return <div className="p-8 text-gray-500">Loading receipt details...</div>;
  if (!sale) return <div className="p-8 text-red-500">Sale not found.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Receipt Preview</h1>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              format === 'receipt' 
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            onClick={() => setFormat('receipt')}
          >
            Thermal Receipt
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              format === 'invoice' 
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            onClick={() => setFormat('invoice')}
          >
            A4 Invoice
          </button>
        </div>
      </div>

      <div className="flex-1 border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
        <PDFViewer className="w-full h-full border-none">
          {format === 'receipt' ? <ReceiptPDF sale={sale} /> : <InvoicePDF sale={sale} />}
        </PDFViewer>
      </div>
    </div>
  );
}
