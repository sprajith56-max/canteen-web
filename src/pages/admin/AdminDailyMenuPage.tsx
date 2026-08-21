import React, { useState, useEffect } from 'react';
import { MenuItem } from '../../types';
import { Calendar, Save, CheckCircle2, AlertCircle, Sparkles, Filter } from 'lucide-react';

interface AdminDailyMenuPageProps {
  allMenuItems: MenuItem[];
}

export const AdminDailyMenuPage: React.FC<AdminDailyMenuPageProps> = ({ allMenuItems }) => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [availableItemIds, setAvailableItemIds] = useState<string[]>([]);
  const [specialItemIds, setSpecialItemIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchDaily = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/menu/today?date=${selectedDate}`);
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          const items: MenuItem[] = data.items || [];
          setAvailableItemIds(items.map((i) => i.id));
          setSpecialItemIds(items.filter((i) => i.isSpecial).map((i) => i.id));
          setNotes(data.notes || '');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDaily();
  }, [selectedDate]);

  const toggleItemAvailability = (id: string) => {
    setAvailableItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleItemSpecial = (id: string) => {
    setSpecialItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setAvailableItemIds(allMenuItems.map((i) => i.id));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/daily-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          itemIds: availableItemIds,
          specialItemIds,
          notes
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900">
            Daily Menu & Specials Planner
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Activate or deactivate dishes for specific campus calendar dates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200">
            <Calendar className="w-4 h-4 text-blue-900" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-heading font-extrabold text-xs transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Schedule
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Daily menu schedule for {selectedDate} has been published successfully!
        </div>
      )}

      {/* Canteen Announcement */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
        <label className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wider block">
          Daily Canteen Announcement / Special Notice for Students
        </label>
        <input
          type="text"
          placeholder="e.g. Special Chicken Dum Biryani available at 12:30 PM. Evening Gobi 65 Counter opens at 4:30 PM."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
        />
      </div>

      {/* Item Selector List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Active Dishes for {selectedDate}
            </h3>
            <p className="text-xs text-slate-500">
              {availableItemIds.length} of {allMenuItems.length} dishes enabled for this date
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors"
            >
              Select All 57 Items
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allMenuItems.map((item) => {
            const isSelected = availableItemIds.includes(item.id);
            const isSpecial = specialItemIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-white border-blue-200 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItemAvailability(item.id)}
                    className="w-4 h-4 text-blue-900 rounded cursor-pointer"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">
                      {item.nameEnglish}
                    </p>
                    <p className="text-[10px] text-slate-500 font-sans truncate">
                      {item.nameTamil} • ₹{item.price}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <button
                    onClick={() => toggleItemSpecial(item.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-colors ${
                      isSpecial
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    Special
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
