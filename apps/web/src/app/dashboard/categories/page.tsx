'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Modal } from '../../../components/ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchApi(`/categories/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
        });
      } else {
        await fetchApi('/categories', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      closeModal();
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setFormData({ name: category.name, description: category.description || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await fetchApi(`/categories/${id}`, { method: 'DELETE' });
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-gray-500">Organize your products into categories.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', description: '' }); setIsModalOpen(true); }} className="gap-2">
          <Plus size={16} /> Add Category
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
            ) : categories.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-gray-500">No categories found.</TableCell></TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(category)}><Edit2 size={16} /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(category.id)}><Trash2 size={16} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Category" : "Add New Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Category Name" 
            placeholder="e.g. Beverages" 
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Description" 
            placeholder="e.g. All types of drinks"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit">{editingId ? 'Save Changes' : 'Create Category'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
