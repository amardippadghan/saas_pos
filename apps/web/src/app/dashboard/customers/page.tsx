'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Modal } from '../../../components/ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Plus, Edit2, Trash2, Eye, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  // Pagination states
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  const loadCustomers = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCursor(null);
      } else {
        setLoadingMore(true);
      }

      const currentCursor = reset ? null : cursor;
      const cursorParam = currentCursor ? `&cursor=${currentCursor}` : '';
      const res = await fetchApi(`/customers?limit=20${cursorParam}`);
      
      const newCustomers = res.data || [];
      
      if (reset) {
        setCustomers(newCustomers);
      } else {
        setCustomers(prev => [...prev, ...newCustomers]);
      }
      
      setCursor(res.nextCursor || null);
      setHasMore(!!res.nextCursor);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadCustomers(true);
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      loadCustomers(false);
    }
  }, [inView, hasMore, loading, loadingMore, cursor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchApi(`/customers/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
        });
      } else {
        await fetchApi('/customers', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      closeModal();
      loadCustomers(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (customer: any) => {
    setEditingId(customer.id);
    setFormData({ 
      name: customer.name, 
      email: customer.email || '', 
      phone: customer.phone || '', 
      address: customer.address || '' 
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await fetchApi(`/customers/${id}`, { method: 'DELETE' });
      loadCustomers(true);
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-gray-500">Manage your customer database.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', email: '', phone: '', address: '' }); setIsModalOpen(true); }} className="gap-2">
          <Plus size={16} /> Add Customer
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600"/></TableCell></TableRow>
            ) : customers.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-8">No customers found.</TableCell></TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => router.push(`/dashboard/customers/${customer.id}`)}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.push(`/dashboard/customers/${customer.id}`)}><Eye size={16} /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(customer)}><Edit2 size={16} /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(customer.id)}><Trash2 size={16} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Infinite Scroll Trigger */}
        {!loading && hasMore && (
          <div ref={ref} className="py-6 flex justify-center">
            {loadingMore ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <span className="text-sm text-gray-400">Scroll for more...</span>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Customer" : "Add New Customer"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Full Name" 
            placeholder="e.g. John Doe" 
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Email Address" 
            type="email"
            placeholder="e.g. john@example.com"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <Input 
            label="Phone Number" 
            placeholder="e.g. +1 555-0199"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
          <Input 
            label="Address" 
            placeholder="e.g. 123 Main St"
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
          />
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit">{editingId ? 'Save Changes' : 'Create Customer'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
