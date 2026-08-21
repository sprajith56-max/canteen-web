import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { History, Download, Search, Filter, Calendar } from 'lucide-react';

export const AdminHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/orders');
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setOrders(data);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.studentName.toLowerCase().includes(search.toLowerCase()) ||
      String(o.tokenNumber).includes(search);
    return matchStatus && matchSearch;
  });

  const exportCSV = () => {
    const headers = ['Order ID', 'Token', 'Student Name', 'College ID', 'Total Amount', 'Status', 'Payment Mode', 'Date'];
    const rows = filtered.map((o) => [
      o.id,
      o.tokenNumber,
      `"${o.studentName}"`,
      o.studentCollegeId,
      o.totalAmount,
      o.orderStatus,
      o.paymentMethod,
      new Date(o.createdAt).toLocaleString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SRM_KDFC_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900">
            Sales & Order History Log
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete transaction record of all campus canteen sales
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-heading font-bold text-xs transition-all shadow-xs"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, Token #, or Student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="READY">Ready</option>
            <option value="PREPARING">Preparing</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Ref ID / Token</th>
                <th className="p-4">Student</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <span className="font-mono font-bold text-slate-900 block">{order.id}</span>
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Token #{order.tokenNumber}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-heading font-bold text-slate-900">{order.studentName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{order.studentCollegeId}</p>
                  </td>
                  <td className="p-4 text-slate-700">
                    <p className="line-clamp-1 max-w-xs">
                      {order.items.map((i) => `${i.quantity}x ${i.nameEnglish}`).join(', ')}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="font-heading font-extrabold text-sm text-slate-900">
                      ₹{order.totalAmount}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-700 font-medium">{order.paymentMethod}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        order.orderStatus === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-800'
                          : order.orderStatus === 'CANCELLED'
                          ? 'bg-red-50 text-red-800'
                          : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-mono text-[11px]">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
