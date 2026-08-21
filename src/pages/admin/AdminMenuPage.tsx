import React, { useState } from 'react';
import { MenuItem, FoodCategory } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Filter,
  Save,
  AlertCircle
} from 'lucide-react';

interface AdminMenuPageProps {
  menuItems: MenuItem[];
  onRefresh: () => void;
}

export const AdminMenuPage: React.FC<AdminMenuPageProps> = ({ menuItems, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const categories: FoodCategory[] = [
    'Beverages / Hot Drinks',
    'Snacks & Evening Bites',
    'Chaat & Street Food',
    'Tiffin & Breakfast',
    'Variety Rice & Meals',
    'Biryani & Fast Food',
    'Parotta & Sides',
    'Fresh Juices & Coolers'
  ];

  const filtered = menuItems.filter((i) => {
    const matchSearch =
      !search ||
      i.nameEnglish.toLowerCase().includes(search.toLowerCase()) ||
      i.nameTamil.includes(search) ||
      i.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'ALL' || i.category === selectedCat;
    return matchSearch && matchCat;
  });

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const updated = { ...item, isAvailable: !item.isAvailable };
      const res = await fetch(`/api/menu/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSpecial = async (item: MenuItem) => {
    try {
      const updated = { ...item, isSpecial: !item.isSpecial };
      const res = await fetch(`/api/menu/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      if (isCreatingNew) {
        const res = await fetch('/api/menu/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem)
        });
        if (res.ok) {
          setEditingItem(null);
          setIsCreatingNew(false);
          onRefresh();
        }
      } else {
        const res = await fetch(`/api/menu/items/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem)
        });
        if (res.ok) {
          setEditingItem(null);
          onRefresh();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this dish from the menu?')) return;
    try {
      const res = await fetch(`/api/menu/items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openNewItemModal = () => {
    setIsCreatingNew(true);
    setEditingItem({
      id: '',
      code: `KDFC-${menuItems.length + 1}`,
      nameTamil: '',
      nameEnglish: '',
      category: 'Tiffin & Breakfast',
      price: 30,
      isVeg: true,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      preparationTimeMinutes: 5,
      isSpecial: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900">
            Menu Catalog Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official SRM KDFC Menu database ({menuItems.length} active dishes)
          </p>
        </div>

        <button
          onClick={openNewItemModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-heading font-extrabold text-xs transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add New Dish
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dish by English or Tamil name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Categories ({menuItems.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Dish</th>
                <th className="p-4">Category</th>
                <th className="p-4">Diet</th>
                <th className="p-4">Official Price</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4">Today Special</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Dish Name */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.nameEnglish}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div>
                        <p className="font-heading font-bold text-slate-900 text-sm">{item.nameEnglish}</p>
                        <p className="text-[11px] text-slate-500">{item.nameTamil}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4 text-slate-600 font-medium">{item.category}</td>

                  {/* Diet */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.isVeg ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                      {item.isVeg ? 'VEG' : 'NON-VEG'}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="p-4">
                    <span className="font-heading font-extrabold text-sm text-slate-900">
                      ₹{item.price}
                    </span>
                  </td>

                  {/* Available Switch */}
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.isAvailable ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </td>

                  {/* Special Switch */}
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleSpecial(item)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                        item.isSpecial
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {item.isSpecial ? 'Special' : 'Regular'}
                    </button>
                  </td>

                  {/* Edit / Delete */}
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsCreatingNew(false);
                          setEditingItem(item);
                        }}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-900 hover:bg-blue-100 transition-colors"
                        title="Edit Dish Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                {isCreatingNew ? 'Add New Canteen Dish' : `Edit "${editingItem.nameEnglish}"`}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">English Name *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.nameEnglish}
                    onChange={(e) => setEditingItem({ ...editingItem, nameEnglish: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tamil Name (தமிழ்) *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.nameTamil}
                    onChange={(e) => setEditingItem({ ...editingItem, nameTamil: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category *</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as FoodCategory })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Image URL</label>
                <input
                  type="url"
                  value={editingItem.imageUrl}
                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isVeg}
                    onChange={(e) => setEditingItem({ ...editingItem, isVeg: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span className="font-bold text-slate-700">Vegetarian Dish</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isAvailable}
                    onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                    className="rounded text-blue-900"
                  />
                  <span className="font-bold text-slate-700">Available In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isSpecial}
                    onChange={(e) => setEditingItem({ ...editingItem, isSpecial: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span className="font-bold text-slate-700">Chef Special</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 text-white font-bold flex items-center gap-2 shadow-xs"
                >
                  <Save className="w-4 h-4" /> Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
