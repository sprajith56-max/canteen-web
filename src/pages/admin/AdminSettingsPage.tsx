import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, ShieldCheck, Clock, BellRing, QrCode, AlertCircle } from 'lucide-react';
import { CanteenSettings } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const [canteenStatus, setCanteenStatus] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [openTime, setOpenTime] = useState('07:30');
  const [closeTime, setCloseTime] = useState('19:30');
  const [upiId, setUpiId] = useState('srmkdfc@sbi');
  const [canteenNotice, setCanteenNotice] = useState('Welcome to SRM MCET KDFC Canteen! Live ordering active.');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data: CanteenSettings = await res.json();
          if (data.canteenStatus) setCanteenStatus(data.canteenStatus);
          if (data.openTime) setOpenTime(data.openTime);
          if (data.closeTime) setCloseTime(data.closeTime);
          if (data.upiId) setUpiId(data.upiId);
          if (data.canteenNotice) setCanteenNotice(data.canteenNotice);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isCanteenOpen: canteenStatus === 'OPEN',
          canteenStatus,
          openTime,
          closeTime,
          workingHours: `${openTime} - ${closeTime}`,
          upiId,
          bannerNotice: canteenNotice,
          canteenNotice
        })
      });

      if (!res.ok) {
        throw new Error('Failed to save settings to server');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      setError(err.message || 'Error saving settings');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-slate-900">
          Canteen Operations Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure live counter operating parameters, token timings, and merchant settings
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Counter Live Status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
            Counter Ordering Switch
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-slate-800">Accept Online Orders</p>
              <p className="text-[11px] text-slate-500">
                When closed, students will see a friendly counter closed banner on the homepage.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCanteenStatus(canteenStatus === 'OPEN' ? 'CLOSED' : 'OPEN')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                canteenStatus === 'OPEN'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-red-600 text-white shadow-xs'
              }`}
            >
              Counter is {canteenStatus}
            </button>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
            Campus Counter Timings
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Opening Time</label>
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Closing Time</label>
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* UPI Merchant ID */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
            UPI Merchant Configuration
          </h3>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700">SRM KDFC Virtual Payment Address (VPA)</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
            <p className="text-[11px] text-slate-400">Used for counter QR and demo online settlements.</p>
          </div>
        </div>

        {/* Canteen Notice Banner */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
            Top Broadcast Banner
          </h3>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700">Announcement text displayed on student navbar</label>
            <input
              type="text"
              value={canteenNotice}
              onChange={(e) => setCanteenNotice(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-heading font-bold text-xs transition-all shadow-md cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </form>
    </div>
  );
};
