import React, { useState } from 'react';
import { MenuItem } from '../types';
import { FoodCard } from '../components/FoodCard';
import { Filter, ArrowUpDown, Sparkles, BookOpen } from 'lucide-react';

interface FullMenuPageProps {
  menuItems: MenuItem[];
  searchQuery: string;
}

export const FullMenuPage: React.FC<FullMenuPageProps> = ({ menuItems, searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [vegFilter, setVegFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [sortBy, setSortBy] = useState<'RECOMMENDED' | 'PRICE_LOW' | 'PRICE_HIGH' | 'POPULAR'>('RECOMMENDED');

  const categories: string[] = ['ALL', ...Array.from(new Set<string>(menuItems.map((i) => i.category)))];

  const processed = menuItems.filter((item) => {
    const matchSearch =
      !searchQuery ||
      item.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameTamil.includes(searchQuery) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchVeg =
      vegFilter === 'ALL' ? true : vegFilter === 'VEG' ? item.isVeg : !item.isVeg;

    return matchSearch && matchCat && matchVeg;
  });

  // Sorting
  const sorted = [...processed].sort((a, b) => {
    if (sortBy === 'PRICE_LOW') return a.price - b.price;
    if (sortBy === 'PRICE_HIGH') return b.price - a.price;
    if (sortBy === 'POPULAR') return (b.orderCount || 0) - (a.orderCount || 0);
    return (b.isSpecial ? 1 : 0) - (a.isSpecial ? 1 : 0);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 font-bold text-xs mb-2">
            <BookOpen className="w-3.5 h-3.5 text-blue-800" />
            OFFICIAL KDFC PRICE LIST
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Full Master Menu
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete canteen menu catalog ({menuItems.length} official items) with transparent campus rates
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <ArrowUpDown className="w-4 h-4 text-slate-500 ml-2" />
          <select
            id="menu-sort-selector"
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none pr-4 cursor-pointer"
          >
            <option value="RECOMMENDED">Sort: Recommended</option>
            <option value="PRICE_LOW">Price: Low → High</option>
            <option value="PRICE_HIGH">Price: High → Low</option>
            <option value="POPULAR">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat === 'ALL' ? '🍽️ All Dishes' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500">Dietary Filter:</span>
          <button
            onClick={() => setVegFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold ${
              vegFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            All ({menuItems.length})
          </button>
          <button
            onClick={() => setVegFilter('VEG')}
            className={`px-2.5 py-1 rounded-lg font-bold ${
              vegFilter === 'VEG' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800'
            }`}
          >
            🟢 Veg ({menuItems.filter((i) => i.isVeg).length})
          </button>
          <button
            onClick={() => setVegFilter('NON_VEG')}
            className={`px-2.5 py-1 rounded-lg font-bold ${
              vegFilter === 'NON_VEG' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-800'
            }`}
          >
            🔴 Non-Veg ({menuItems.filter((i) => !i.isVeg).length})
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sorted.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
