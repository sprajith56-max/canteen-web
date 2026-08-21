import React, { useState, useEffect } from 'react';
import { AnalyticsSummary, Order } from '../../types';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChefHat,
  AlertCircle,
  ArrowUpRight,
  Flame
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface AdminDashboardProps {
  setTab: (tab: string) => void;
}

const DEFAULT_ANALYTICS: AnalyticsSummary = {
  todayRevenue: 0,
  totalRevenue: 0,
  todayOrders: 0,
  totalOrders: 0,
  activeOrders: 0,
  completedOrders: 0,
  salesByCategory: [
    { category: 'Beverages / Hot Drinks', count: 0, revenue: 0 },
    { category: 'Snacks & Evening Bites', count: 0, revenue: 0 },
    { category: 'Chaat & Street Food', count: 0, revenue: 0 },
    { category: 'Tiffin & Breakfast', count: 0, revenue: 0 },
    { category: 'Variety Rice & Meals', count: 0, revenue: 0 },
    { category: 'Biryani & Fast Food', count: 0, revenue: 0 },
    { category: 'Parotta & Sides', count: 0, revenue: 0 },
    { category: 'Fresh Juices & Coolers', count: 0, revenue: 0 }
  ],
  topSellingItems: []
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setTab }) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(DEFAULT_ANALYTICS);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setAnalytics({
          todayRevenue: data.todayRevenue ?? 0,
          totalRevenue: data.totalRevenue ?? 0,
          todayOrders: data.todayOrders ?? data.todayOrdersCount ?? 0,
          totalOrders: data.totalOrders ?? 0,
          activeOrders: data.activeOrders ?? (data.pendingOrdersCount || 0) + (data.preparingOrdersCount || 0) + (data.readyOrdersCount || 0),
          completedOrders: data.completedOrders ?? data.completedOrdersCount ?? 0,
          salesByCategory: Array.isArray(data.salesByCategory) ? data.salesByCategory : DEFAULT_ANALYTICS.salesByCategory,
          topSellingItems: Array.isArray(data.topSellingItems) ? data.topSellingItems : []
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 8000);
    return () => clearInterval(interval);
  }, []);

  const salesData = (analytics.salesByCategory || []).map((c) => ({
    name: (c.category || 'General').split('/')[0].trim(),
    revenue: c.revenue || 0,
    items: c.count || 0
  }));

  const topItems = analytics.topSellingItems || [];

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-black text-2xl text-slate-900">
              ₹{analytics.todayRevenue}
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 ml-1" /> Live
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Total collected: ₹{analytics.totalRevenue}</p>
        </div>

        {/* Metric 2: Today Orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-900">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-black text-2xl text-slate-900">
              {analytics.todayOrders}
            </span>
            <span className="text-xs font-semibold text-slate-500">tickets</span>
          </div>
          <p className="text-[11px] text-slate-400">All-time orders: {analytics.totalOrders}</p>
        </div>

        {/* Metric 3: Active in Kitchen */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Kitchen Queue</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-black text-2xl text-purple-900">
              {analytics.activeOrders}
            </span>
            <span className="text-xs font-bold text-purple-600 animate-pulse">active</span>
          </div>
          <button
            onClick={() => setTab('live-orders')}
            className="text-[11px] font-bold text-blue-900 hover:underline flex items-center gap-0.5"
          >
            Open Live KDS <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 4: Completed Orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Today</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-black text-2xl text-emerald-900">
              {analytics.completedOrders}
            </span>
            <span className="text-xs font-semibold text-emerald-600">delivered</span>
          </div>
          <p className="text-[11px] text-slate-400">Average prep: ~6 mins</p>
        </div>
      </div>

      {/* Charts & Top Selling Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Category Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Sales Breakdown by Category
              </h3>
              <p className="text-xs text-slate-500">Items ordered across meal types</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === 'revenue' ? `₹${value}` : `${value} qty`,
                    name === 'revenue' ? 'Revenue' : 'Items Sold'
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    fontSize: '12px',
                    borderColor: '#e2e8f0'
                  }}
                />
                <Bar dataKey="revenue" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Food Items */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h3 className="font-heading font-bold text-base text-slate-900">
              Campus Favourites
            </h3>
          </div>

          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto space-y-2">
            {topItems.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No sales recorded yet</p>
            ) : (
              topItems.map((item, idx) => (
                <div key={item.id || item.name || idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-heading font-extrabold text-sm text-slate-400 w-4">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-400">₹{item.price || 0} each</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 block">{item.count} orders</span>
                    <span className="text-[10px] text-emerald-600 font-bold">₹{item.revenue}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-linear-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-heading font-bold text-lg text-amber-400">
            Live Kitchen Terminal Ready
          </h4>
          <p className="text-xs text-slate-300">
            Keep the live orders screen open on the counter display for live token callouts.
          </p>
        </div>
        <button
          onClick={() => setTab('live-orders')}
          className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-heading font-extrabold text-xs transition-all shadow-md shrink-0 cursor-pointer"
        >
          OPEN KITCHEN SCREEN (KDS)
        </button>
      </div>
    </div>
  );
};
