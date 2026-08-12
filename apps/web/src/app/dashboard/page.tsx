'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchApi('/sales/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  const dayWiseSales = stats?.dayWiseSales || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-gray-500 text-sm font-medium">Today's Sales</h3>
          <p className="text-3xl font-bold mt-2">${Number(stats?.todayAmount || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-gray-500 text-sm font-medium">Today's Transactions</h3>
          <p className="text-3xl font-bold mt-2">{stats?.todayTransactions || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-gray-500 text-sm font-medium">Weekly Sales</h3>
          <p className="text-3xl font-bold mt-2">${Number(stats?.weeklyAmount || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-gray-500 text-sm font-medium">Total Customers</h3>
          <p className="text-3xl font-bold mt-2">{stats?.totalCustomers || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day-wise Sales Bar Chart */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Sales - Last 7 Days</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayWiseSales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Sales']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Day-wise Sales Trend (Line Chart) */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dayWiseSales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Sales']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
