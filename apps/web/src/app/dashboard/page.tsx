'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../lib/api';
import { Activity, DollarSign, Users, Package, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/card';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/analytics/dashboard');
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Analytics</h1>
        <p className="text-gray-500">Real-time overview of your store's performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
              <h3 className="text-2xl font-bold mt-1">${Number(metrics?.revenue?.today || 0).toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Total Lifetime: ${Number(metrics?.revenue?.total || 0).toFixed(2)}</span>
          </div>
        </Card>

        {/* Today's Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Orders</p>
              <h3 className="text-2xl font-bold mt-1">{metrics?.orders?.today || 0}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Activity size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Total Lifetime: {metrics?.orders?.total || 0}</span>
          </div>
        </Card>

        {/* Total Customers */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Customers</p>
              <h3 className="text-2xl font-bold mt-1">{metrics?.customers || 0}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <TrendingUp size={16} className="mr-1" />
            <span>Growing database</span>
          </div>
        </Card>

        {/* Total Products */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Products</p>
              <h3 className="text-2xl font-bold mt-1">{metrics?.products || 0}</h3>
            </div>
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
              <Package size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>In your catalog</span>
          </div>
        </Card>
      </div>
      
      {/* Chart Placeholder */}
      <Card className="p-6 h-80 flex flex-col justify-center items-center text-gray-400 border-dashed">
        <Activity size={48} className="mb-4 opacity-20" />
        <p>Sales trend charts will appear here</p>
      </Card>
    </div>
  );
}
