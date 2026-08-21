import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { PaymentMethod } from '../types';
import {
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  UserCheck
} from 'lucide-react';

interface CheckoutPageProps {
  navigate: (route: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const { cart, totalAmount, totalItems, clearCart } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_COUNTER');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fallback if not logged in or cart empty
  if (!user) {
    navigate('/login?redirect=checkout');
    return null;
  }

  if (cart.length === 0) {
    navigate('/today-menu');
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const orderItems = cart.map((ci) => ({
        itemId: ci.item.id,
        nameTamil: ci.item.nameTamil,
        nameEnglish: ci.item.nameEnglish,
        category: ci.item.category,
        price: ci.item.price,
        quantity: ci.quantity,
        subtotal: ci.item.price * ci.quantity,
        isVeg: ci.item.isVeg,
        imageUrl: ci.item.imageUrl
      }));

      const payload = {
        studentId: user.id,
        studentName: user.name,
        studentCollegeId: user.studentId || 'SRM-STUDENT',
        studentEmail: user.email,
        studentPhone: user.phone || '',
        items: orderItems,
        paymentMethod,
        notes: orderNotes
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Success
      clearCart();
      navigate(`/orders?id=${data.order.id}&placed=true`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
          Order Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your student details and select counter payment method
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Student Info & Payment Details */}
        <div className="md:col-span-2 space-y-5">
          {/* Student Verification Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-blue-900 font-heading font-bold text-base border-b border-slate-100 pb-3">
              <UserCheck className="w-5 h-5" />
              <h3>Student & College Verification</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Student Name</span>
                <p className="font-bold text-slate-900">{user.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">College / Reg ID</span>
                <p className="font-bold text-blue-900 font-mono">{user.studentId || 'SRM2026'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">College Email</span>
                <p className="font-medium text-slate-700">{user.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Campus Location</span>
                <p className="font-medium text-slate-700">SRM MCET KDFC Canteen</p>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-heading font-bold text-base border-b border-slate-100 pb-3">
              <CreditCard className="w-5 h-5 text-amber-500" />
              <h3>Select Payment Mode</h3>
            </div>

            <div className="space-y-3">
              {/* Option 1: Cash at Counter */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'CASH_COUNTER'
                    ? 'border-blue-900 bg-blue-50/40'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH_COUNTER"
                  checked={paymentMethod === 'CASH_COUNTER'}
                  onChange={() => setPaymentMethod('CASH_COUNTER')}
                  className="mt-1 text-blue-900 focus:ring-blue-800"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span className="font-heading font-bold text-sm text-slate-900">
                      Cash at Counter (Pay on Pickup)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Show your token number at Counter 1 or 2 and pay exact cash when receiving your hot food.
                  </p>
                </div>
              </label>

              {/* Option 2: UPI / Online Demo */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'UPI_DEMO'
                    ? 'border-blue-900 bg-blue-50/40'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI_DEMO"
                  checked={paymentMethod === 'UPI_DEMO'}
                  onChange={() => setPaymentMethod('UPI_DEMO')}
                  className="mt-1 text-blue-900 focus:ring-blue-800"
                />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-purple-600" />
                      <span className="font-heading font-bold text-sm text-slate-900">
                        UPI Instant (GPay / PhonePe / Paytm - Demo Mode)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      DEMO GATEWAY
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Instantly verifies payment simulation for seamless contactless canteen token generation.
                  </p>
                </div>
              </label>
            </div>

            {/* UPI Simulator notice */}
            {paymentMethod === 'UPI_DEMO' && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
                <p className="font-bold">ℹ️ Note regarding UPI / Online payment:</p>
                <p className="text-[11px] text-purple-700">
                  This prototype simulates instant UPI verification with SRM MCET KDFC Merchant ID (<code className="font-mono">srmkdfc@sbi</code>) so you can test token generation right away.
                </p>
              </div>
            )}
          </div>

          {/* Kitchen Notes */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
            <label className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wider block">
              Special Kitchen Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Extra spicy, Less sugar in tea, Keep parcel ready..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
            />
          </div>
        </div>

        {/* Right Col: Review & Submit */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Order Review
            </h3>

            {/* Compact items list */}
            <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100 pr-1 text-xs">
              {cart.map(({ item, quantity }) => (
                <div key={item.id} className="pt-2 first:pt-0 flex justify-between items-center">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 truncate">
                      {quantity}x {item.nameEnglish}
                    </p>
                    <p className="text-[10px] text-slate-500">{item.nameTamil}</p>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0">₹{item.price * quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Items:</span>
                <span className="font-bold text-slate-900">{totalItems}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                <span className="font-heading font-extrabold text-sm text-slate-900">Total Amount:</span>
                <span className="font-heading font-extrabold text-2xl text-blue-900">₹{totalAmount}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              id="confirm-place-order-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-95 disabled:opacity-50 text-slate-950 font-heading font-extrabold text-sm transition-all shadow-md cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Generating Token...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  CONFIRM & PLACE ORDER
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
