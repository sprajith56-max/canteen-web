import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SRMLogo } from '../../components/SRMLogo';
import { CanteenSettings } from '../../types';
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  ShoppingBag,
  Users,
  History,
  Settings,
  LogOut,
  Bell,
  ChefHat,
  ArrowLeft,
  ExternalLink,
  Menu as MenuIcon,
  X as CloseIcon
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  setTab: (tab: string) => void;
  navigate: (route: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  setTab,
  navigate,
  children
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<CanteenSettings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error('Failed to load settings in admin layout', err));
  }, []);

  const menuNav = [
    { id: 'dashboard', label: 'Dashboard & Metrics', icon: LayoutDashboard },
    { id: 'live-orders', label: 'Live Kitchen Orders (KDS)', icon: ShoppingBag, badge: 'LIVE' },
    { id: 'menu-catalog', label: 'Menu Catalog (57 Items)', icon: UtensilsCrossed },
    { id: 'daily-menu', label: 'Daily Menu Planner', icon: CalendarDays },
    { id: 'students', label: 'Student Accounts', icon: Users },
    { id: 'history', label: 'Sales & Order Logs', icon: History },
    { id: 'settings', label: 'Canteen Settings', icon: Settings }
  ];

  const handleTabClick = (tabId: string) => {
    setTab(tabId);
    setMobileMenuOpen(false);
  };

  const isCounterOpen = settings?.canteenStatus !== 'CLOSED';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top App Bar for Admin */}
      <div className="md:hidden bg-slate-950 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <SRMLogo size="sm" showText={false} />
          <div>
            <span className="font-heading font-extrabold text-white text-xs block">
              SRM KDFC CANTEEN
            </span>
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
              ADMIN DESK
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:flex md:w-64 bg-slate-950 text-slate-300 shrink-0 border-r border-slate-800 flex-col justify-between z-40`}
      >
        <div className="p-4 sm:p-5 space-y-6">
          {/* Logo (Desktop) */}
          <div className="hidden md:flex items-center gap-3 pb-4 border-b border-slate-800">
            <SRMLogo size="sm" showText={false} />
            <div>
              <h2 className="font-heading font-extrabold text-white text-sm">
                SRM KDFC CANTEEN
              </h2>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                ADMIN & KITCHEN DESK
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-tab-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                        isActive
                          ? 'bg-slate-950 text-amber-400'
                          : 'bg-emerald-500 text-white animate-pulse'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Student View</span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors font-bold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Staff ({user?.username || 'admin'})</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <span className="font-heading font-extrabold text-slate-900 text-sm sm:text-base">
                KDFC Kitchen Operations Portal
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline ml-2">
                (SRM MCET Central Food Court)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div
              className={`font-bold px-3 py-1 rounded-full border ${
                isCounterOpen
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              ● Counter Status: {isCounterOpen ? 'OPEN' : 'CLOSED'}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'AD'}
              </div>
              <span className="text-xs font-bold text-slate-700 hidden lg:inline">
                {user?.name || 'Administrator'}
              </span>
            </div>
          </div>
        </header>

        {/* Tab Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
