'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Loader2, Filter } from 'lucide-react';

export default function SalesChart() {
  const [data, setData] = useState<{ date: string, sales: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [timeRange, setTimeRange] = useState('7d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productId, setProductId] = useState('');

  // Dropdown data
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Load dropdown options once safely handling both array and paginated {data: []} responses
    fetchApi('/categories').then(res => setCategories(Array.isArray(res) ? res : res?.data || [])).catch(() => {});
    fetchApi('/products').then(res => setProducts(Array.isArray(res) ? res : res?.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (timeRange === 'custom' && (!startDate || !endDate)) {
      return; // Wait for both dates if custom
    }
    loadChartData();
  }, [timeRange, startDate, endDate, categoryId, productId]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('timeRange', timeRange);
      params.append('tzOffset', new Date().getTimezoneOffset().toString());
      
      if (categoryId) params.append('categoryId', categoryId);
      if (productId) params.append('productId', productId);
      if (timeRange === 'custom') {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const res = await fetchApi(`/analytics/sales-chart?${params.toString()}`);
      setData(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 text-white p-3 rounded-lg shadow-xl backdrop-blur-md border border-gray-700">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-blue-400 font-bold">
            ₹{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-sm p-5 sm:p-6 mb-8 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">Sales Overview</h2>
          <p className="text-sm text-gray-500">Analyze revenue trends over time</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
            <Filter size={16} />
            <span>Filters:</span>
          </div>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="text-sm px-3 py-1.5 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="text-sm px-3 py-1.5 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm px-3 py-1.5 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Range</option>
          </select>

          {timeRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm px-3 py-1.5 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm px-3 py-1.5 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      <div className="relative h-[300px] w-full">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-lg backdrop-blur-[2px]">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        )}

        {data.length === 0 && !loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            No sales data found for the selected filters.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSales)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
