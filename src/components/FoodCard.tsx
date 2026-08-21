import React, { useState } from 'react';
import { MenuItem } from '../types';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Check, Clock, Sparkles } from 'lucide-react';

interface FoodCardProps {
  item: MenuItem;
  onEdit?: (item: MenuItem) => void;
  isAdmin?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onEdit, isAdmin = false }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const [imgError, setImgError] = useState(false);

  const cartEntry = cart.find((ci) => ci.item.id === item.id);
  const qty = cartEntry ? cartEntry.quantity : 0;

  const fallbackImage = item.isVeg
    ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
    : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      id={`food-card-${item.id}`}
      className={`group relative flex flex-col bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-lg ${
        !item.isAvailable
          ? 'border-slate-200 opacity-75 bg-slate-50/70'
          : item.isSpecial
          ? 'border-amber-300 ring-1 ring-amber-400/30'
          : 'border-slate-200/90 hover:border-blue-300'
      }`}
    >
      {/* Food Image Container */}
      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100">
        <img
          src={imgError ? fallbackImage : item.imageUrl || fallbackImage}
          alt={item.nameEnglish}
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            !item.isAvailable ? 'grayscale contrast-75' : ''
          }`}
          loading="lazy"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          {/* Veg / Non-Veg Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold backdrop-blur-md shadow-xs border ${
              item.isVeg
                ? 'bg-white/95 text-emerald-700 border-emerald-300'
                : 'bg-white/95 text-red-700 border-red-300'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            />
            {item.isVeg ? 'VEG' : 'NON-VEG'}
          </div>

          {/* Today's Special / Out of Stock Badge */}
          <div className="flex items-center gap-1">
            {item.isSpecial && item.isAvailable && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-amber-400 text-slate-950 shadow-xs border border-amber-300">
                <Sparkles className="w-3 h-3 text-slate-900" />
                SPECIAL
              </span>
            )}
            {!item.isAvailable && (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-900/90 text-white shadow-xs">
                OUT OF STOCK
              </span>
            )}
          </div>
        </div>

        {/* Preparation Time Tag */}
        <div className="absolute bottom-2 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-950/75 text-white backdrop-blur-xs">
          <Clock className="w-3 h-3 text-amber-400" />
          {item.preparationTimeMinutes || 5} mins
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category Tag */}
          <span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded-sm">
            {item.category}
          </span>

          {/* Item Names (Tamil & English) */}
          <div className="mt-1.5">
            <h3 className="font-heading text-lg font-bold text-slate-900 leading-tight group-hover:text-blue-900 transition-colors">
              {item.nameEnglish}
            </h3>
            <p className="text-xs font-semibold text-slate-500 font-sans tracking-wide mt-0.5">
              {item.nameTamil}
            </p>
          </div>

          {/* Short Description */}
          {item.description && (
            <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Price and Add to Cart Section */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Price</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-bold text-slate-800">₹</span>
              <span className="font-heading text-2xl font-extrabold text-slate-950">
                {item.price}
              </span>
            </div>
          </div>

          {/* Action Button */}
          {isAdmin ? (
            <button
              id={`edit-food-${item.id}`}
              onClick={() => onEdit && onEdit(item)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Edit Item
            </button>
          ) : !item.isAvailable ? (
            <button
              disabled
              className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : qty > 0 ? (
            <div className="flex items-center bg-blue-900 text-white rounded-xl overflow-hidden shadow-xs">
              <button
                id={`decrease-cart-${item.id}`}
                onClick={() => updateQuantity(item.id, qty - 1)}
                className="p-2 hover:bg-blue-800 active:scale-95 transition-transform"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 font-bold text-xs">{qty}</span>
              <button
                id={`increase-cart-${item.id}`}
                onClick={() => updateQuantity(item.id, qty + 1)}
                className="p-2 hover:bg-blue-800 active:scale-95 transition-transform"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id={`add-to-cart-${item.id}`}
              onClick={() => addToCart(item, 1)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-bold text-xs transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
