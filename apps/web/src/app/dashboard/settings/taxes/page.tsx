'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../../lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Button } from '../../../../components/ui/button';
import { Modal } from '../../../../components/ui/modal';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { Plus, Edit2, Trash2, Percent, DollarSign } from 'lucide-react';

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'PERCENTAGE', value: '', isActive: true });
  const [loading, setLoading] = useState(true);

  const loadTaxes = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/taxes');
      setTaxes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        value: Number(formData.value)
      };

      if (editingId) {
        await fetchApi(`/taxes/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await fetchApi('/taxes', { method: 'POST', body: JSON.stringify(payload) });
      }
      closeModal();
      loadTaxes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (tax: any) => {
    setEditingId(tax.id);
    setFormData({ name: tax.name, type: tax.type, value: tax.value, isActive: tax.isActive });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tax rule?')) return;
    try {
      await fetchApi(`/taxes/${id}`, { method: 'DELETE' });
      loadTaxes();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (tax: any) => {
    try {
      await fetchApi(`/taxes/${tax.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !tax.isActive }) });
      loadTaxes();
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', type: 'PERCENTAGE', value: '', isActive: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Taxes & Fees</h1>
          <p className="text-gray-500">Configure global tax rules and fixed convenience fees applied at checkout.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={16} /> Add Rule
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : taxes.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-gray-500">No active tax rules.</TableCell></TableRow>
            ) : (
              taxes.map(tax => (
                <TableRow key={tax.id}>
                  <TableCell className="font-bold">{tax.name}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      {tax.type === 'PERCENTAGE' ? <Percent size={14}/> : <DollarSign size={14}/>}
                      {tax.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {tax.type === 'PERCENTAGE' ? `${Number(tax.value)}%` : `$${Number(tax.value).toFixed(2)}`}
                  </TableCell>
                  <TableCell>
                    <button 
                      onClick={() => toggleActive(tax)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${tax.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {tax.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(tax)}><Edit2 size={16} /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(tax.id)}><Trash2 size={16} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Edit Rule' : 'Add New Rule'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Rule Name" 
            placeholder="e.g. CGST or Convenience Fee" 
            required 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
          <Select 
            label="Type"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
            options={[
              { label: 'Percentage (%)', value: 'PERCENTAGE' },
              { label: 'Fixed Amount ($)', value: 'FIXED' }
            ]}
          />
          <Input 
            label={formData.type === 'PERCENTAGE' ? "Percentage Value (%)" : "Fixed Amount ($)"}
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.value}
            onChange={e => setFormData({...formData, value: e.target.value})}
          />
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="activeCheckbox"
              checked={formData.isActive}
              onChange={e => setFormData({...formData, isActive: e.target.checked})}
              className="rounded border-gray-300"
            />
            <label htmlFor="activeCheckbox" className="text-sm font-medium">Activate this rule immediately</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit">{editingId ? 'Save Changes' : 'Create Rule'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
