'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Modal } from '../../../components/ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });

  const loadBranches = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/branches');
      setBranches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchApi(`/branches/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
        });
      } else {
        await fetchApi('/branches', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      closeModal();
      loadBranches();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (branch: any) => {
    setEditingId(branch.id);
    setFormData({ name: branch.name, address: branch.address || '', phone: branch.phone || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    try {
      await fetchApi(`/branches/${id}`, { method: 'DELETE' });
      loadBranches();
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', address: '', phone: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Branches</h1>
          <p className="text-gray-500">Manage your organization's physical locations.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', address: '', phone: '' }); setIsModalOpen(true); }} className="gap-2">
          <Plus size={16} /> Add Branch
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : branches.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-gray-500">No branches found.</TableCell></TableRow>
            ) : (
              branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>{branch.address || '-'}</TableCell>
                  <TableCell>{branch.phone || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(branch)}><Edit2 size={16} /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(branch.id)}><Trash2 size={16} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Branch" : "Add New Branch"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Branch Name" 
            placeholder="e.g. Downtown Branch" 
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Address" 
            placeholder="e.g. 123 Main St"
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
          />
          <Input 
            label="Phone Number" 
            placeholder="e.g. +1 555-0199"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit">{editingId ? 'Save Changes' : 'Create Branch'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
