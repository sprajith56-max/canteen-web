import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Utensils,
  Clock,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';

interface CartPageProps {
  navigate: (route: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalAmount, totalItems } = useCart();
  const { user } = useAuth();

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="font-heading text-2xl font-extrabold text-slate-900">Your Plate is Empty</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't added any dishes yet. Check today's fresh menu for hot food and drinks!
          </p>
        </div>
        <button
          id="empty-cart-explore-btn"
          onClick={() => navigate('/today-menu')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-md"
        >
          <Utensils className="w-4 h-4" />
          Explore Today's Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/today-menu')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
              Your Food Cart
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalItems} item{totalItems > 1 ? 's' : ''} in your campus order
            </p>
          </div>
        </div>

        <button
          id="clear-cart-btn"
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cart Items List */}
        <div className="md:col-span-2 space-y-3">
          {cart.map(({ item, quantity }) => (
            <div
              key={item.id}
              id={`cart-item-${item.id}`}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4"
            >
              {/* Image & Title */}
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.imageUrl}
                  alt={item.nameEnglish}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                      }`}
                    />
                    <h3 className="font-heading font-bold text-sm text-slate-900 truncate">
                      {item.nameEnglish}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-sans truncate">{item.nameTamil}</p>
                  <p className="text-xs font-bold text-slate-700 mt-1">₹{item.price} each</p>
                </div>
              </div>

              {/* Quantity Counter & Subtotal */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                  <button
                    onClick={() => updateQuantity(item.id, quantity - 1)}
                    className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2.5 font-bold text-xs text-slate-900">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, quantity + 1)}
                    className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right w-16">
                  <span className="font-heading font-extrabold text-sm text-slate-900">
                    ₹{item.price * quantity}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Canteen Packaging / Service Fee</span>
                <span className="font-semibold text-emerald-600">₹0 (FREE)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Cess</span>
                <span className="font-semibold text-slate-900">Included</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-heading font-extrabold text-base text-slate-900">Total Payable</span>
              <span className="font-heading font-extrabold text-2xl text-blue-950">₹{totalAmount}</span>
            </div>

            {/* Checkout Button */}
            <button
              id="proceed-to-checkout-btn"
              onClick={() => {
                if (!user) {
                  navigate('/login?redirect=checkout');
                } else {
                  navigate('/checkout');
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-heading font-extrabold text-sm transition-all shadow-md"
            >
              PROCEED TO CHECKOUT
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Official SRM MCET Canteen Counter Pickup</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
