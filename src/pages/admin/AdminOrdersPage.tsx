import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus } from '../../types';
import {
  Clock,
  ChefHat,
  BellRing,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Volume2,
  VolumeX,
  AlertTriangle,
  User,
  Filter,
  DollarSign
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Item out of stock');

  const prevOrderCountRef = useRef<number>(0);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data: Order[] = await res.json();
        // Check if new order arrived
        if (prevOrderCountRef.current > 0 && data.length > prevOrderCountRef.current && soundEnabled) {
          playOrderSound();
        }
        prevOrderCountRef.current = data.length;
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const playOrderSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio context might be restricted
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3500); // 3.5s refresh for live kitchen
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: 'PAID' | 'PENDING') => {
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    try {
      const res = await fetch(`/api/orders/${cancelModalOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
          cancellationReason: cancelReason
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === cancelModalOrder.id ? updated : o)));
        setCancelModalOrder(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeOrders = orders.filter((o) => o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED');
  const displayedOrders =
    filterStatus === 'ACTIVE'
      ? activeOrders
      : filterStatus === 'ALL'
      ? orders
      : orders.filter((o) => o.orderStatus === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="font-heading text-2xl font-extrabold text-slate-900">
              Kitchen Display System (KDS)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeOrders.length} active tickets waiting in preparation queue
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sound alert toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              soundEnabled ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {soundEnabled ? 'Audio Alerts ON' : 'Audio Muted'}
          </button>

          {/* Refresh */}
          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'ACTIVE', label: `🔥 Active Queue (${activeOrders.length})` },
          { id: 'ORDER_PLACED', label: 'Placed' },
          { id: 'CONFIRMED', label: 'Confirmed' },
          { id: 'PREPARING', label: 'Cooking' },
          { id: 'READY', label: 'Ready for Pickup' },
          { id: 'COMPLETED', label: 'Completed' },
          { id: 'ALL', label: `All (${orders.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              filterStatus === tab.id
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Grid / Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <ChefHat className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-heading font-bold text-slate-800 text-lg">No orders in this queue</h3>
          <p className="text-xs text-slate-500">
            Incoming orders from SRM students will immediately populate here with audio notifications.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedOrders.map((order) => {
            const isReady = order.orderStatus === 'READY';
            const isPreparing = order.orderStatus === 'PREPARING';
            const isConfirmed = order.orderStatus === 'CONFIRMED';
            const isPlaced = order.orderStatus === 'ORDER_PLACED';

            return (
              <div
                key={order.id}
                id={`kds-order-${order.id}`}
                className={`bg-white rounded-3xl border-2 shadow-sm flex flex-col justify-between overflow-hidden transition-all ${
                  isReady
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : isPreparing
                    ? 'border-amber-400'
                    : isPlaced
                    ? 'border-blue-400 animate-pulse'
                    : 'border-slate-200'
                }`}
              >
                {/* Card Header with Token */}
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-400 text-slate-950 font-heading font-black text-2xl px-3 py-1 rounded-xl shadow-xs">
                      #{order.tokenNumber}
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-slate-200">
                        {order.studentName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {order.studentCollegeId || 'STUDENT'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4 space-y-3 flex-1">
                  <div className="space-y-2">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex items-start justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                        <div className="flex items-start gap-2">
                          <span className={`w-2 h-2 rounded-full mt-1 ${it.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                          <div>
                            <span className="font-heading font-extrabold text-slate-900 text-sm">
                              {it.quantity}x {it.nameEnglish}
                            </span>
                            <span className="text-[11px] text-slate-500 block">({it.nameTamil})</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-700">₹{it.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  {/* Kitchen Special Instructions */}
                  {order.notes && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 font-medium">
                      📝 <strong>Note:</strong> {order.notes}
                    </div>
                  )}

                  {/* Payment Details */}
                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                    <span>
                      Payment: <strong className="text-slate-800">{order.paymentMethod}</strong>
                    </span>
                    {order.paymentStatus === 'PAID' ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        ✓ PAID
                      </span>
                    ) : (
                      <button
                        onClick={() => updatePaymentStatus(order.id, 'PAID')}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                        title="Click to mark paid upon counter cash collection"
                      >
                        ⚡ Mark Paid
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Transition Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {isPlaced && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                        className="col-span-2 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Accept & Confirm
                      </button>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                        className="col-span-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <ChefHat className="w-4 h-4" /> Start Cooking
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'READY')}
                        className="col-span-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs animate-pulse"
                      >
                        <BellRing className="w-4 h-4" /> Call Token (Ready)
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                        className="col-span-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Handed to Student
                      </button>
                    )}
                  </div>

                  {order.orderStatus !== 'COMPLETED' && order.orderStatus !== 'CANCELLED' && (
                    <button
                      onClick={() => setCancelModalOrder(order)}
                      className="w-full text-center text-[11px] text-red-600 hover:text-red-800 font-semibold py-1 cursor-pointer"
                    >
                      Cancel Order Ticket
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-base text-slate-900">
              Cancel Order #{cancelModalOrder.tokenNumber}?
            </h3>
            <p className="text-xs text-slate-500">
              Please specify the reason for cancelling {cancelModalOrder.studentName}'s order:
            </p>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="Item out of stock">Item out of stock</option>
              <option value="Kitchen closing time">Kitchen closing time</option>
              <option value="Payment not received">Payment not received at counter</option>
              <option value="Student requested cancellation">Student requested cancellation</option>
            </select>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
