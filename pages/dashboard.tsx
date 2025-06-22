import React, { useMemo } from 'react';
import { trpc } from '../utils/trpc';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { RequireAuth } from '../components/RequireAuth';
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import MetricCard from '../components/MetricCard';
import { useUser } from '@clerk/nextjs';

function getMonthYear(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const COLORS = ['#2563eb', '#f59e42', '#10b981', '#ef4444', '#a21caf', '#fbbf24', '#6366f1', '#14b8a6'];

type MetricKey = 'clients' | 'orders' | 'ordersThisMonth' | 'pendingOrders' | 'totalRevenue' | 'revenueThisMonth' | 'lowStock';

function formatDateBritish(dateValue: string | Date) {
  const d = new Date(dateValue);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const DashboardContent: React.FC<{ userName: string }> = ({ userName }) => {
  // All hooks must be called unconditionally
  const clients = trpc.getClients.useQuery();
  const orders = trpc.getOrders.useQuery();
  const inventory = trpc.getInventory.useQuery();
  const payments = trpc.getPayments.useQuery();

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Orders this month
  const ordersThisMonth = orders.data?.filter(o => getMonthYear(o.created_at) === thisMonth) ?? [];
  // Pending orders
  const pendingOrders = orders.data?.filter(o => o.status.toLowerCase().includes('pending')) ?? [];
  // Total revenue (sum of payments)
  const totalRevenue = payments.data?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0;
  // Revenue this month
  const revenueThisMonth = payments.data?.filter(p => getMonthYear(p.created_at) === thisMonth).reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0;
  // Low stock items
  const lowStock = inventory.data?.filter(i => i.low_stock_alert !== null && i.quantity < i.low_stock_alert).length ?? 0;

  // Orders per month for chart
  const ordersByMonth = useMemo(() => {
    if (!orders.data) return [];
    const counts = orders.data.reduce((acc, order) => {
      const month = new Date(order.created_at).toISOString().slice(0, 7); // "YYYY-MM"
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([monthA], [monthB]) => monthA.localeCompare(monthB)) // Sort by "YYYY-MM"
      .map(([month, count]) => {
        const date = new Date(month + '-02T12:00:00Z'); // Use day 2 and UTC to be safe
        const formattedMonth = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return { name: `${formattedMonth}-${year}`, Orders: count };
      });
  }, [orders.data]);

  // Revenue per month for chart
  const revenueByMonth = useMemo(() => {
    if (!payments.data) return [];
    const revenue = payments.data.reduce((acc, payment) => {
      const month = new Date(payment.created_at).toISOString().slice(0, 7); // "YYYY-MM"
      acc[month] = (acc[month] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(revenue)
      .sort(([monthA], [monthB]) => monthA.localeCompare(monthB)) // Sort by "YYYY-MM"
      .map(([month, total]) => {
        const date = new Date(month + '-02T12:00:00Z'); // Use day 2 and UTC to be safe
        const formattedMonth = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return { name: `${formattedMonth}-${year}`, Revenue: total / 100 };
      });
  }, [payments.data]);

  // Order status breakdown for pie chart
  const orderStatusData = useMemo(() => {
    if (!orders.data) return [];
    const map: Record<string, number> = {};
    orders.data.forEach(o => {
      const status = o.status || 'Unknown';
      map[status] = (map[status] || 0) + 1;
    });
    return Object.entries(map).map(([status, value]) => ({ name: status, value }));
  }, [orders.data]);

  // Payment method breakdown for pie chart
  const paymentMethodData = useMemo(() => {
    if (!payments.data) return [];
    const map: Record<string, number> = {};
    payments.data.forEach(p => {
      const method = p.method || 'Unknown';
      map[method] = (map[method] || 0) + 1;
    });
    return Object.entries(map).map(([method, value]) => ({ name: method, value }));
  }, [payments.data]);

  // Recent activity (last 5 orders and payments)
  const recentOrders = useMemo(() => {
    if (!orders.data) return [];
    return [...orders.data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  }, [orders.data]);
  const recentPayments = useMemo(() => {
    if (!payments.data) return [];
    return [...payments.data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  }, [payments.data]);

  // Loading or error states (after all hooks)
  if (clients.isLoading || orders.isLoading || inventory.isLoading || payments.isLoading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }
  if (clients.error || orders.error || inventory.error || payments.error) {
    return <div className="p-8 text-center text-red-500">Error loading dashboard.</div>;
  }

  // Modernized metric values
  const metricValues: Record<MetricKey, number | string> = {
    clients: clients.data?.length ?? 0,
    orders: orders.data?.length ?? 0,
    ordersThisMonth: ordersThisMonth.length,
    pendingOrders: pendingOrders.length,
    totalRevenue: `₵${(totalRevenue / 100).toLocaleString('en-GB')}`,
    revenueThisMonth: `₵${(revenueThisMonth / 100).toLocaleString('en-GB')}`,
    lowStock: lowStock,
  };

  const metricCards: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    valueKey: MetricKey;
    color: string;
  }[] = [
    {
      label: 'Total Clients',
      icon: UserGroupIcon,
      valueKey: 'clients',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Total Orders',
      icon: ClipboardDocumentListIcon,
      valueKey: 'orders',
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Orders This Month',
      icon: ArrowTrendingUpIcon,
      valueKey: 'ordersThisMonth',
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      label: 'Pending Orders',
      icon: ClockIcon,
      valueKey: 'pendingOrders',
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      label: 'Total Revenue',
      icon: CurrencyDollarIcon,
      valueKey: 'totalRevenue',
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: 'Revenue This Month',
      icon: ArrowTrendingUpIcon,
      valueKey: 'revenueThisMonth',
      color: 'bg-cyan-100 text-cyan-600',
    },
    {
      label: 'Low Stock Items',
      icon: ExclamationTriangleIcon,
      valueKey: 'lowStock',
      color: 'bg-red-100 text-red-600',
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">Welcome to your Dashboard, {userName}!</h1>
      <div className="flex flex-wrap justify-center gap-6 mb-10">
        {metricCards.map(card => {
          const Icon = card.icon;
          return (
            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5">
              <MetricCard
                key={card.label}
                icon={<Icon className="h-8 w-8" />}
                value={metricValues[card.valueKey]}
                label={card.label}
                iconColor={card.color.split(' ').pop() || 'text-blue-500'}
              />
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="w-full md:w-1/2">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Orders per Month</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ordersByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="Orders" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Revenue per Month</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Order Status Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#2563eb"
                  label
                >
                  {orderStatusData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Method Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#10b981"
                  label
                >
                  {paymentMethodData.map((entry, idx) => (
                    <Cell key={`cell2-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-10 mb-8">
        <div className="w-full md:w-1/2">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 h-full">
            <h3 className="font-semibold mb-2">Recent Orders</h3>
            <ul className="divide-y">
              {recentOrders.map(order => {
                const client = clients.data?.find(c => c.id === order.client_id);
                return (
                  <li key={order.id} className="py-2 flex justify-between items-center gap-4">
                    <span>
                      Order #{order.id} ({order.status})
                      {client && (
                        <span className="ml-2 text-gray-500">for {client.name}</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{formatDateBritish(order.created_at)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 h-full">
            <h3 className="font-semibold mb-2">Recent Payments</h3>
            <ul className="divide-y">
              {recentPayments.map(payment => {
                const order = orders.data?.find(o => o.id === payment.order_id);
                const client = order ? clients.data?.find(c => c.id === order.client_id) : null;
                return (
                  <li key={payment.id} className="py-2 flex justify-between items-center gap-4">
                    <span>
                      Payment #{payment.id} (₵{(payment.amount / 100).toFixed(2)})
                      {client && (
                        <span className="ml-2 text-gray-500">for {client.name}</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{formatDateBritish(payment.created_at)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/clients" className="block rounded-lg shadow bg-white hover:bg-blue-50 transition p-6 border border-gray-200">
          <div className="text-gray-500 text-sm mb-1">Clients</div>
          <div className="text-3xl font-bold">{clients.data?.length ?? 0}</div>
          <div className="mt-2 text-blue-600 font-medium">View Clients</div>
        </Link>
        <Link href="/orders" className="block rounded-lg shadow bg-white hover:bg-blue-50 transition p-6 border border-gray-200">
          <div className="text-gray-500 text-sm mb-1">Orders</div>
          <div className="text-3xl font-bold">{orders.data?.length ?? 0}</div>
          <div className="mt-2 text-blue-600 font-medium">View Orders</div>
        </Link>
        <Link href="/inventory" className="block rounded-lg shadow bg-white hover:bg-blue-50 transition p-6 border border-gray-200">
          <div className="text-gray-500 text-sm mb-1">Inventory Items</div>
          <div className="text-3xl font-bold">{inventory.data?.length ?? 0}</div>
          <div className="mt-2 text-blue-600 font-medium">View Inventory</div>
        </Link>
        <Link href="/payments" className="block rounded-lg shadow bg-white hover:bg-blue-50 transition p-6 border border-gray-200">
          <div className="text-gray-500 text-sm mb-1">Payments</div>
          <div className="text-3xl font-bold">{payments.data?.length ?? 0}</div>
          <div className="mt-2 text-blue-600 font-medium">View Payments</div>
        </Link>
      </div>
      <div className="text-gray-600 text-center mt-8">
        Need help? Check the <Link href="/support" className="text-blue-500 underline">Efficio Guide</Link>.
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useUser();
  const userName = user?.firstName || user?.username || 'User';

  return (
    <RequireAuth>
      <DashboardContent userName={userName} />
    </RequireAuth>
  );
} 