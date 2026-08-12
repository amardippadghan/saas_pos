'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Modal } from '../../../components/ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Plus, Boxes } from 'lucide-react';

export default function InventoryPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal State
  const [adjustData, setAdjustData] = useState({
    productVariantId: '',
    quantityChange: '',
    type: 'ADJUSTMENT',
    reason: ''
  });

  const loadBranches = async () => {
    try {
      const data = await fetchApi('/branches');
      setBranches(data);
      if (data.length > 0) {
        setSelectedBranchId(data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadInventory = async (branchId: string) => {
    if (!branchId) return;
    try {
      setLoading(true);
      const data = await fetchApi(`/inventory?branchId=${branchId}`);
      setInventory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      loadInventory(selectedBranchId);
    }
  }, [selectedBranchId]);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({
          branchId: selectedBranchId,
          productVariantId: adjustData.productVariantId,
          quantityChange: Number(adjustData.quantityChange),
          type: adjustData.type,
          reason: adjustData.reason
        })
      });
      setIsModalOpen(false);
      setAdjustData({ productVariantId: '', quantityChange: '', type: 'ADJUSTMENT', reason: '' });
      loadInventory(selectedBranchId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-gray-500">Track and adjust stock levels across locations.</p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            options={branches.map(b => ({ label: b.name, value: b.id }))}
            className="w-64"
          />
          <Button onClick={() => setIsModalOpen(true)} className="gap-2" disabled={!selectedBranchId || inventory.length === 0}>
            <Plus size={16} /> Adjust Stock
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>In Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : !selectedBranchId ? (
              <TableRow><TableCell colSpan={4} className="text-center text-gray-500">Please select a branch.</TableCell></TableRow>
            ) : inventory.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-gray-500">No inventory records found. Products need to be added to inventory first.</TableCell></TableRow>
            ) : (
              inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.productVariant?.product?.name}</TableCell>
                  <TableCell>{item.productVariant?.name || 'Default'}</TableCell>
                  <TableCell>{item.productVariant?.sku || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.quantity <= 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {item.quantity}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Since you can only adjust existing inventory in this simple view, we populate the select with current inventory items. 
          A more robust system would let you select ANY product variant across the company to add new inventory. */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adjust Stock">
        <form onSubmit={handleAdjustStock} className="space-y-4">
          <Select 
            label="Select Product Variant"
            required
            value={adjustData.productVariantId}
            onChange={(e) => setAdjustData({...adjustData, productVariantId: e.target.value})}
            options={inventory.map(item => ({
              label: `${item.productVariant?.product?.name} - ${item.productVariant?.name} (Current: ${item.quantity})`,
              value: item.productVariantId
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
            placeholder="e.g. Found damaged stock"
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
