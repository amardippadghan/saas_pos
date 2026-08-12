'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../../lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, MapPin, Store, Activity, Box } from 'lucide-react';
import { Card } from '../../../../components/ui/card';

export default function BranchViewPage() {
  const params = useParams();
  const router = useRouter();
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    const loadBranch = async () => {
      try {
        setLoading(true);
        const data = await fetchApi(`/branches/${params.id}`);
        setBranch(data);
      } catch (err) {
        console.error(err);
        router.push('/dashboard/branches');
      } finally {
        setLoading(false);
      }
    };
    loadBranch();
  }, [params.id, router]);

  if (loading) return <div className="p-8 text-gray-500">Loading branch details...</div>;
  if (!branch) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-full">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Store className="text-blue-500" /> {branch.name}
          </h1>
          <p className="text-gray-500 text-sm">Branch Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 col-span-1 space-y-4">
          <h3 className="font-bold text-lg border-b pb-2 dark:border-gray-800">Location</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="text-gray-400 mt-0.5 shrink-0" size={16} />
              <span>{branch.address || 'No address provided'}</span>
            </div>
            {branch.phone && (
              <div className="flex items-start gap-3 text-sm">
                <span className="text-gray-400 shrink-0 font-medium w-4">#</span>
                <span>{branch.phone}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 col-span-1 md:col-span-2">
          <h3 className="font-bold text-lg border-b pb-2 dark:border-gray-800 mb-4">Branch Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Activity size={16} /> Total Sales
              </div>
              <div className="text-3xl font-black">{branch._count?.sales || 0}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Box size={16} /> Inventory Records
              </div>
              <div className="text-3xl font-black">{branch._count?.inventories || 0}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
