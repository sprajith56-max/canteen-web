import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Order } from '../types';
import {
  User as UserIcon,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  LogOut,
  ShoppingBag,
  Shield,
  CheckCircle2,
  Edit2,
  Save
} from 'lucide-react';

interface ProfilePageProps {
  navigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
  const { user, logout, updateProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=profile');
      return;
    }
    setName(user.name);
    setPhone(user.phone || '');

    const fetchUserStats = async () => {
      try {
        const res = await fetch(`/api/orders?studentId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUserStats();
  }, [user]);

  if (!user) return null;

  const totalSpent = orders
    .filter((o) => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/auth/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      });
      if (res.ok) {
        const updated = await res.json();
        updateProfile(updated);
        setIsEditing(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-900 text-amber-400 font-heading font-black text-2xl flex items-center justify-center shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900">
                  {user.name}
                </h1>
                <span className="bg-blue-100 text-blue-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  {user.role}
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                ID: {user.studentId || 'SRM2026CS104'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={logout}
              className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Profile updated successfully!
          </div>
        )}

        {/* Edit Form or Info View */}
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                placeholder="+91 94432 00000"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 text-white rounded-xl font-bold flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> College Email
              </span>
              <p className="font-semibold text-slate-900">{user.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Contact Phone
              </span>
              <p className="font-semibold text-slate-900">{user.phone || 'Not added'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Campus Entity
              </span>
              <p className="font-semibold text-slate-900">SRM MCET Student Portal</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Registered Date
              </span>
              <p className="font-semibold text-slate-900">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {/* Student Canteen Stats */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <span className="font-heading font-extrabold text-2xl text-blue-900">{orders.length}</span>
            <span className="text-[11px] font-bold text-slate-600 block mt-0.5">Total Orders</span>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
            <span className="font-heading font-extrabold text-2xl text-amber-900">₹{totalSpent}</span>
            <span className="text-[11px] font-bold text-slate-600 block mt-0.5">Total Spent</span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <span className="font-heading font-extrabold text-2xl text-emerald-900">
              {orders.filter((o) => o.orderStatus === 'COMPLETED').length}
            </span>
            <span className="text-[11px] font-bold text-slate-600 block mt-0.5">Meals Collected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
