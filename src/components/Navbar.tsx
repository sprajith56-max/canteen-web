import React, { useState, useEffect } from 'react';
import { SRMLogo } from './SRMLogo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Bell,
  User as UserIcon,
  Menu as MenuIcon,
  X,
  Clock,
  LogOut,
  Shield,
  UtensilsCrossed,
  Phone,
  ChevronRight
} from 'lucide-react';
import { AppNotification } from '../types';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  navigate,
  searchQuery,
  setSearchQuery
}) => {
  const { user, isAdmin, logout, quickLogin } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const userId = user ? user.id : 'all';
        const res = await fetch(`/api/notifications?userId=${userId}`);
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data: AppNotification[] = await res.json();
          if (Array.isArray(data)) {
            setNotifications(data);
            setUnreadCount(data.filter((n) => !n.isRead).length);
          }
        }
      } catch (e) {
        // silent catch
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const markAllAsRead = async () => {
    try {
      if (user) {
        await fetch('/api/notifications/read-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { label: 'Home', route: '/' },
    { label: "Today's Menu", route: '/today-menu' },
    { label: 'Full Menu', route: '/menu' },
    { label: 'My Orders', route: '/orders', authRequired: true },
    { label: 'Order History', route: '/history', authRequired: true },
    { label: 'About', route: '/about' },
    { label: 'Contact', route: '/contact' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-xs">
      {/* TOP BAR: Dark Navy, 38px height */}
      <div className="bg-[#0b1b3d] text-slate-200 h-[38px] flex items-center border-b border-blue-950/40">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 flex items-center justify-between text-xs tracking-wide">
          {/* Left info */}
          <div className="flex items-center gap-2 font-medium text-slate-200 truncate">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="truncate">
              SRM MCET KDFC • Fresh Meals, Snacks & Hot Filter Drinks
            </span>
          </div>

          {/* Right timing & admin portal */}
          <div className="hidden sm:flex items-center gap-4 text-slate-300 font-medium text-xs shrink-0">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>7:30 AM – 7:30 PM</span>
            </div>
            <span className="text-slate-600">|</span>
            <button
              id="top-admin-portal-link"
              onClick={async () => {
                if (!isAdmin) {
                  await quickLogin('admin');
                }
                navigate('/admin/dashboard');
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR: Height 78–84px (80px), Background White */}
      <div className="bg-white border-b border-slate-200/90">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 h-[80px] flex items-center justify-between gap-4">
          {/* LEFT BRAND AREA: Fixed width ~260-280px, strictly horizontally aligned */}
          <div
            id="brand-logo-btn"
            onClick={() => navigate('/')}
            className="w-[260px] shrink-0 cursor-pointer flex items-center"
          >
            <SRMLogo showText={true} />
          </div>

          {/* CENTER NAVIGATION: Immediately to the right of brand area */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center">
            {navLinks.map((item) => {
              if (item.authRequired && !user) return null;
              const isActive = currentRoute === item.route;
              const isTodayMenu = item.route === '/today-menu';

              // Distinct active states as requested:
              // Home active: Blue background with white text, rounded 8px
              // Today's menu active: Subtle yellow/cream active highlight
              let linkClasses = 'px-3.5 py-2 rounded-lg text-[14.5px] font-semibold whitespace-nowrap transition-colors ';
              if (isActive) {
                if (item.route === '/') {
                  linkClasses += 'bg-[#003882] text-white shadow-xs';
                } else if (isTodayMenu) {
                  linkClasses += 'bg-amber-100 text-amber-950 font-bold border border-amber-300/80';
                } else {
                  linkClasses += 'bg-slate-100 text-[#003882] font-bold';
                }
              } else {
                linkClasses += 'text-slate-700 hover:text-[#003882] hover:bg-slate-50';
              }

              return (
                <button
                  key={item.route}
                  id={`nav-${item.route.replace('/', '') || 'home'}`}
                  onClick={() => navigate(item.route)}
                  className={linkClasses}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* RIGHT ACTION AREA: Notification, Compact Yellow Cart, Profile/Login */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Notification Icon */}
            <div className="relative">
              <button
                id="notifications-toggle-btn"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-heading font-bold text-sm text-slate-900">Notifications</h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[#003882] font-semibold hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-400">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (n.link) navigate(n.link);
                            setNotificationsOpen(false);
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.isRead ? 'bg-amber-50/50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Compact Yellow Cart Button: 🛒 Cart 0 */}
            <button
              id="cart-nav-btn"
              onClick={() => navigate('/cart')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span>Cart</span>
              <span className="bg-slate-950 text-amber-300 text-xs px-1.5 py-0.2 rounded-md font-extrabold ml-0.5">
                {totalItems}
              </span>
            </button>

            {/* Profile / Login */}
            {user ? (
              <div className="relative group">
                <button
                  id="user-profile-btn"
                  onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/profile')}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#003882] text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>
              </div>
            ) : (
              <button
                id="login-nav-btn"
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-lg bg-[#003882] hover:bg-[#002a63] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 lg:hidden rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {navLinks.map((item) => {
              if (item.authRequired && !user) return null;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => {
                    navigate(item.route);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-lg text-left text-sm font-semibold transition-colors ${
                    isActive ? 'bg-[#003882] text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Hours: 7:30 AM – 7:30 PM</span>
            <button
              onClick={async () => {
                if (!isAdmin) {
                  await quickLogin('admin');
                }
                navigate('/admin/dashboard');
                setMobileMenuOpen(false);
              }}
              className="text-[#003882] font-bold cursor-pointer"
            >
              Admin Portal →
            </button>
          </div>

          {user && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Logged in as {user.name}</span>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-600 font-bold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

