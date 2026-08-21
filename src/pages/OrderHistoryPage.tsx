import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Order, OrderStatus } from '../types';
import {
  History,
  Search,
  Filter,
  Repeat,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight
} from 'lucide-react';

interface OrderHistoryPageProps {
  navigate: (route: string) => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/orders?studentId=${user.id}`);
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
  }, [user]);

  if (!user) {
    navigate('/login?redirect=history');
    return null;
  }

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const matchSearch =
      !searchId ||
      o.id.toLowerCase().includes(searchId.toLowerCase()) ||
      o.items.some((i) => i.nameEnglish.toLowerCase().includes(searchId.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const handleOrderAgain = (order: Order) => {
    order.items.forEach((oi) => {
      // Re-create a minimal menuItem to add to cart
      addToCart(
        {
          id: oi.itemId,
          code: 'KDFC',
          nameTamil: oi.nameTamil,
          nameEnglish: oi.nameEnglish,
          category: oi.category,
          price: oi.price,
          isVeg: oi.isVeg,
          description: '',
          imageUrl: oi.imageUrl,
          isAvailable: true,
          preparationTimeMinutes: 5
        },
        oi.quantity
      );
    });
    navigate('/cart');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 font-bold text-xs mb-2">
            <History className="w-3.5 h-3.5 text-blue-800" />
            STUDENT ORDER ARCHIVE
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Order History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your past canteen meals, receipts, and order tokens
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID or Dish..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['ALL', 'COMPLETED', 'PREPARING', 'CONFIRMED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === st
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-heading font-bold text-slate-800 text-base">No orders found</h3>
          <p className="text-xs text-slate-500">No past orders match your selected filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-blue-200 transition-colors"
            >
              {/* Top Row: ID, Date, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono font-bold text-xs text-slate-800">
                    {order.id}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md">
                    Token #{order.tokenNumber}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                      order.orderStatus === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-1.5 text-xs text-slate-700">
                {order.items.map((oi, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>
                      {oi.quantity}x {oi.nameEnglish} ({oi.nameTamil})
                    </span>
                    <span className="font-semibold text-slate-900">₹{oi.subtotal}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Paid</span>
                  <span className="font-heading font-extrabold text-lg text-slate-900">
                    ₹{order.totalAmount}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/orders?id=${order.id}`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    Track Status
                  </button>
                  <button
                    onClick={() => handleOrderAgain(order)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-all shadow-xs"
                  >
                    <Repeat className="w-3 h-3" />
                    Order Again
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
