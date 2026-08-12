'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../../lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, Package, Edit, Box } from 'lucide-react';
import { Card } from '../../../../components/ui/card';
import { Modal } from '../../../../components/ui/modal';
import { Select } from '../../../../components/ui/select';
import { Input } from '../../../../components/ui/input';

export default function ProductViewPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Inventory Adjustment State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjustData, setAdjustData] = useState({
    branchId: '',
    productVariantId: '',
    quantityChange: '',
    type: 'ADJUSTMENT',
    reason: ''
  });

  useEffect(() => {
    if (!params.id) return;
    const loadProduct = async () => {
      try {
        setLoading(true);
        const [productData, branchesData] = await Promise.all([
          fetchApi(`/products/${params.id}`),
          fetchApi(`/branches`)
        ]);
        setProduct(productData);
        setBranches(branchesData);
      } catch (err) {
        console.error(err);
        router.push('/dashboard/products');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [params.id, router]);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({
          branchId: adjustData.branchId,
          productVariantId: adjustData.productVariantId,
          quantityChange: Number(adjustData.quantityChange),
          type: adjustData.type,
          reason: adjustData.reason
        })
      });
      setIsModalOpen(false);
      setAdjustData({ branchId: '', productVariantId: '', quantityChange: '', type: 'ADJUSTMENT', reason: '' });
      // Reload product to get updated inventory
      const productData = await fetchApi(`/products/${params.id}`);
      setProduct(productData);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading product details...</div>;
  if (!product) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Package className="text-blue-500" /> {product.name}
            </h1>
            <p className="text-gray-500 text-sm">{product.category?.name || 'Uncategorized'}</p>
          </div>
        </div>
        <Button onClick={() => router.push('/dashboard/products')} className="gap-2">
          <Edit size={16} /> Edit Product
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-lg border-b pb-2 dark:border-gray-800">Description</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {product.description || <span className="italic text-gray-500">No description available.</span>}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-lg border-b pb-2 dark:border-gray-800 mb-4">Variants & Pricing</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">Variant Name</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Cost Price</th>
                  <th className="px-4 py-3 font-medium rounded-tr-lg">Selling Price</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-800">
                {product.variants?.map((v: any) => (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium">{v.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{v.sku}</td>
                    <td className="px-4 py-3 text-red-600">${Number(v.costPrice).toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold text-green-600">${Number(v.sellingPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg border-b pb-2 dark:border-gray-800 flex items-center gap-2">
              <Box size={18} /> Current Inventory
            </h3>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>Adjust Stock</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.variants?.map((v: any) => (
              <div key={v.id} className="p-4 border dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="font-bold mb-2">{v.name} (SKU: {v.sku})</div>
                {!v.inventories || v.inventories.length === 0 ? (
                  <div className="text-sm text-gray-500 italic">No stock records across any branch.</div>
                ) : (
                  <div className="space-y-2">
                    {v.inventories.map((inv: any) => (
                      <div key={inv.id} className="flex justify-between items-center text-sm">
                        <span>{inv.branch?.name}</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${inv.quantity <= 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {inv.quantity} in stock
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adjust Inventory">
        <form onSubmit={handleAdjustStock} className="space-y-4">
          <Select 
            label="Select Branch"
            required
            value={adjustData.branchId}
            onChange={(e) => setAdjustData({...adjustData, branchId: e.target.value})}
            options={branches.map(b => ({ label: b.name, value: b.id }))}
          />
          <Select 
            label="Select Variant"
            required
            value={adjustData.productVariantId}
            onChange={(e) => setAdjustData({...adjustData, productVariantId: e.target.value})}
            options={product.variants?.map((v: any) => ({
              label: `${v.name} (SKU: ${v.sku})`,
              value: v.id
            }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity Change"
              type="number"
              placeholder="-5 or 10"
              required
              value={adjustData.quantityChange}
              onChange={(e) => setAdjustData({...adjustData, quantityChange: e.target.value})}
            />
            <Select 
              label="Transaction Type"
              required
              value={adjustData.type}
              onChange={(e) => setAdjustData({...adjustData, type: e.target.value})}
              options={[
                { label: 'Adjustment', value: 'ADJUSTMENT' },
                { label: 'Opening Stock', value: 'OPENING_STOCK' },
                { label: 'Damage / Return', value: 'RETURN' }
              ]}
            />
          </div>
          <Input
            label="Reason (Optional)"
            placeholder="e.g. Received new shipment"
            value={adjustData.reason}
            onChange={(e) => setAdjustData({...adjustData, reason: e.target.value})}
          />
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Apply Adjustment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
