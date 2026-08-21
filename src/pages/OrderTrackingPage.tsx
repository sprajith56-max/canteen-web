import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  BellRing,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  MapPin,
  FileText
} from 'lucide-react';

interface OrderTrackingPageProps {
  navigate: (route: string) => void;
  orderIdParam?: string;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ navigate, orderIdParam }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(orderIdParam || null);
  const [loading, setLoading] = useState(true);

  // Poll orders
  const fetchOrders = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/orders?studentId=${user.id}`);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data: Order[] = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
          if (!activeOrderId && data.length > 0) {
            // Select most recent active order or latest order
            const active = data.find((o) => o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED') || data[0];
            setActiveOrderId(active.id);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(fetchOrders, 4000); // 4-second real-time status update
    return () => clearInterval(timer);
  }, [user, activeOrderId]);

  if (!user) {
    navigate('/login?redirect=orders');
    return null;
  }

  const currentOrder = orders.find((o) => o.id === activeOrderId) || orders[0];

  const statusSteps: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'ORDER_PLACED', label: 'Order Placed', icon: Clock },
    { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
    { status: 'PREPARING', label: 'In Kitchen', icon: ChefHat },
    { status: 'READY', label: 'Ready for Pickup', icon: BellRing },
    { status: 'COMPLETED', label: 'Collected', icon: ShoppingBag }
  ];

  const getStepIndex = (status: OrderStatus) => {
    const map: Record<OrderStatus, number> = {
      ORDER_PLACED: 0,
      CONFIRMED: 1,
      PREPARING: 2,
      READY: 3,
      COMPLETED: 4,
      CANCELLED: -1
    };
    return map[status] ?? 0;
  };

  const activeIndex = currentOrder ? getStepIndex(currentOrder.orderStatus) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Live Order Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status updates synced with the SRM KDFC Kitchen counter
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-lg text-slate-800">No Active Orders</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You don't have any active canteen orders at the moment.
            </p>
          </div>
          <button
            onClick={() => navigate('/today-menu')}
            className="px-6 py-2.5 bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Order Food Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Tracker Card */}
          <div className="md:col-span-2 space-y-6">
            {currentOrder && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                {/* Order Header / Token Display */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Order Reference
                    </span>
                    <span className="font-heading font-extrabold text-xl text-slate-900">
                      {currentOrder.id}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Placed at {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Highlighted Token Badge */}
                  <div className="bg-linear-to-br from-amber-400 to-amber-500 text-slate-950 px-5 py-3 rounded-2xl shadow-md border border-amber-300 flex items-center gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider block text-slate-900">
                        Counter Token
                      </span>
                      <span className="font-heading font-extrabold text-3xl tracking-tight">
                        #{currentOrder.tokenNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cancelled Banner if applicable */}
                {currentOrder.orderStatus === 'CANCELLED' ? (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-bold">This order was cancelled</p>
                      <p className="text-[11px] text-red-600">
                        {currentOrder.cancellationReason || 'Please speak with the canteen counter staff for assistance.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Status Alert Highlight */}
                    {currentOrder.orderStatus === 'READY' && (
                      <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-lg animate-bounce flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BellRing className="w-5 h-5" />
                          <div>
                            <p className="font-heading font-extrabold text-sm">YOUR FOOD IS READY FOR PICKUP!</p>
                            <p className="text-xs opacity-90">Please present Token #{currentOrder.tokenNumber} at Counter 1 or 2.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stepper Progress Visualizer */}
                    <div className="py-2">
                      <div className="relative">
                        {/* Progress line */}
                        <div className="absolute top-5 inset-x-8 h-1 bg-slate-100 -z-0" />
                        <div
                          className="absolute top-5 left-8 h-1 bg-blue-900 transition-all duration-500 -z-0"
                          style={{
                            width: `${(Math.max(0, activeIndex) / (statusSteps.length - 1)) * 82}%`
                          }}
                        />

                        {/* Step circles */}
                        <div className="relative z-10 flex items-start justify-between">
                          {statusSteps.map((step, idx) => {
                            const isDone = idx <= activeIndex;
                            const isCurrent = idx === activeIndex;
                            const IconComponent = step.icon;

                            return (
                              <div key={step.status} className="flex flex-col items-center text-center w-16">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                    isCurrent
                                      ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-200 scale-110 shadow-md font-bold'
                                      : isDone
                                      ? 'bg-blue-900 text-white'
                                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                                  }`}
                                >
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <span
                                  className={`text-[11px] mt-2 font-bold leading-tight ${
                                    isCurrent
                                      ? 'text-blue-950 font-extrabold'
                                      : isDone
                                      ? 'text-slate-800'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Items in this order */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="font-heading font-bold text-xs text-slate-400 uppercase tracking-wider">
                    Dishes in this order
                  </h4>
                  <div className="space-y-2">
                    {currentOrder.items.map((oi, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${oi.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                          <span className="font-bold text-slate-900">{oi.quantity}x {oi.nameEnglish}</span>
                          <span className="text-slate-500 font-sans">({oi.nameTamil})</span>
                        </div>
                        <span className="font-bold text-slate-800">₹{oi.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600">Payment: <strong className="text-slate-900">{currentOrder.paymentMethod}</strong> ({currentOrder.paymentStatus})</span>
                    <span className="font-heading font-extrabold text-base text-blue-900">Total: ₹{currentOrder.totalAmount}</span>
                  </div>
                </div>

                {/* Pickup Instructions */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Pickup Counter Location:</p>
                    <p>SRM MCET KDFC Food Court, Ground Floor Counter 1 & 2. Please show your token screen when called.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Other Recent Orders */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Your Orders Today
            </h3>

            <div className="space-y-2">
              {orders.map((ord) => {
                const isSelected = ord.id === activeOrderId;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setActiveOrderId(ord.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-sm">
                        Token #{ord.tokenNumber}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </div>

                    <div className="mt-2 text-xs opacity-85 flex justify-between">
                      <span>{ord.items.length} items</span>
                      <span className="font-bold">₹{ord.totalAmount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
