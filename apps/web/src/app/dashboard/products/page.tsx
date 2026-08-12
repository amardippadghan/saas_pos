'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Modal } from '../../../components/ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Plus, Edit2, Trash2, X, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [variants, setVariants] = useState<any[]>([{ name: '', sku: '', price: 0, costPrice: 0 }]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        fetchApi('/products'),
        fetchApi('/categories')
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddVariant = () => {
    setVariants([...variants, { name: '', sku: '', price: 0, costPrice: 0 }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        description,
        categoryId: categoryId || undefined,
        variants: variants.map(v => ({
          ...v,
          price: Number(v.price),
          costPrice: v.costPrice ? Number(v.costPrice) : undefined
        }))
      };

      if (editingId) {
        await fetchApi(`/products/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      closeModal();
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || '');
    setCategoryId(product.categoryId || '');
    
    if (product.variants && product.variants.length > 0) {
      setVariants(product.variants.map((v: any) => ({
        id: v.id,
        name: v.name === 'Default' ? '' : v.name,
        sku: v.sku,
        price: v.sellingPrice,
        costPrice: v.costPrice
      })));
    } else {
      setVariants([{ name: '', sku: '', price: 0, costPrice: 0 }]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setCategoryId('');
    setVariants([{ name: '', sku: '', price: 0, costPrice: 0 }]);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This will also remove its variants.')) return;
    try {
      await fetchApi(`/products/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-gray-500">Manage your product catalog and variants.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={16} /> Add Product
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-gray-500">No products found.</TableCell></TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => router.push(`/dashboard/products/${product.id}`)}>
                  <TableCell className="font-medium">
                    {product.name}
                    {product.description && <span className="block text-xs text-gray-500">{product.description}</span>}
                  </TableCell>
                  <TableCell>
                    {product.category?.name || <span className="text-gray-400 italic">Uncategorized</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.variants?.map((v: any) => (
                        <span key={v.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {v.name || 'Default'} - ${v.price}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.push(`/dashboard/products/${product.id}`)}><Eye size={16} /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(product)}><Edit2 size={16} /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(product.id)}><Trash2 size={16} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Product" : "Add New Product"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Product Name" 
              placeholder="e.g. Cotton T-Shirt" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="col-span-2"
            />
            <Select 
              label="Category"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              options={categories.map(c => ({ label: c.name, value: c.id }))}
              className="col-span-2"
            />
            <Input 
              label="Description" 
              placeholder="e.g. 100% Cotton, comfortable fit"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="col-span-2"
            />
          </div>

          <div className="mt-6 pt-6 border-t dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Product Variants</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddVariant} className="gap-1 h-8">
                <Plus size={14} /> Add Variant
              </Button>
            </div>
            
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-800 relative group">
                  {variants.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveVariant(index)}
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      label="Variant Name" 
                      placeholder="e.g. Large / Red"
                      value={variant.name}
                      onChange={e => updateVariant(index, 'name', e.target.value)}
                    />
                    <Input 
                      label="SKU" 
                      placeholder="e.g. TSHIRT-L-RED"
                      required
                      value={variant.sku}
                      onChange={e => updateVariant(index, 'sku', e.target.value)}
                    />
                    <Input 
                      label="Price ($)" 
                      type="number"
                      step="0.01"
                      required
                      value={variant.price || ''}
                      onChange={e => updateVariant(index, 'price', e.target.value)}
                    />
                    <Input 
                      label="Cost Price ($)" 
                      type="number"
                      step="0.01"
                      value={variant.costPrice || ''}
                      onChange={e => updateVariant(index, 'costPrice', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-6 border-t dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit">{editingId ? "Save Changes" : "Create Product"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
