import React, { useState, useEffect } from 'react';
import { MenuItem, FoodCategory } from '../types';
import { FoodCard } from '../components/FoodCard';
import {
  Calendar,
  Sparkles,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Layers
} from 'lucide-react';

interface TodayMenuPageProps {
  initialItems: MenuItem[];
  searchQuery: string;
}

export const TodayMenuPage: React.FC<TodayMenuPageProps> = ({ initialItems, searchQuery }) => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [vegFilter, setVegFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [dayNotes, setDayNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchDayMenu = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/menu/today?date=${selectedDate}`);
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            setItems(data.items);
            setDayNotes(data.notes || '');
          } else {
            setItems(initialItems);
          }
        } else {
          setItems(initialItems);
        }
      } catch (e) {
        console.error(e);
        setItems(initialItems);
      } finally {
        setLoading(false);
      }
    };
    fetchDayMenu();
  }, [selectedDate, initialItems]);

  // Categories list
  const categories: string[] = ['ALL', ...Array.from(new Set<string>(items.map((i) => i.category)))];

  // Filtered list
  const filtered = items.filter((item) => {
    // Search query
    const matchSearch =
      !searchQuery ||
      item.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameTamil.includes(searchQuery) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Category
    const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

    // Veg / Non-Veg
    const matchVeg =
      vegFilter === 'ALL' ? true : vegFilter === 'VEG' ? item.isVeg : !item.isVeg;

    // Availability
    const matchAvail = onlyAvailable ? item.isAvailable : true;

    return matchSearch && matchCategory && matchVeg && matchAvail;
  });

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 font-bold text-xs mb-2">
            <Calendar className="w-3.5 h-3.5 text-blue-800" />
            LIVE DAILY CANTEEN BOARD
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Today's Menu
          </h1>
          <p className="text-sm font-semibold text-amber-600 mt-0.5">
            {formattedDate} {selectedDate === todayStr ? '(Current Active Day)' : ''}
          </p>
          {dayNotes && (
            <p className="text-xs text-slate-600 bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 mt-3 max-w-xl">
              📢 <strong>Canteen Notice:</strong> {dayNotes}
            </p>
          )}
        </div>

        {/* Date Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[-1, 0, 1, 2].map((offset) => {
            const d = new Date();
            d.setDate(d.getDate() + offset);
            const dateVal = d.toISOString().split('T')[0];
            const isSelected = selectedDate === dateVal;
            const label =
              offset === -1
                ? 'Yesterday'
                : offset === 0
                ? 'Today'
                : offset === 1
                ? 'Tomorrow'
                : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

            return (
              <button
                key={dateVal}
                onClick={() => setSelectedDate(dateVal)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat === 'ALL' ? '🍽️ All Items' : cat}
            </button>
          ))}
        </div>

        {/* Secondary Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Dietary:
            </span>
            <button
              onClick={() => setVegFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                vegFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setVegFilter('VEG')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                vegFilter === 'VEG' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              🟢 Pure Veg
            </button>
            <button
              onClick={() => setVegFilter('NON_VEG')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                vegFilter === 'NON_VEG' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-800'
              }`}
            >
              🔴 Non-Veg
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded text-blue-900 focus:ring-blue-800"
            />
            <span>Show Available Only</span>
          </label>
        </div>
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-heading font-bold text-slate-800 text-lg">No dishes found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or dietary filters to find dishes available in the canteen.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setVegFilter('ALL');
              setOnlyAvailable(false);
            }}
            className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
