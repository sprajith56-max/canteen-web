import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { TodayMenuPage } from './pages/TodayMenuPage';
import { FullMenuPage } from './pages/FullMenuPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminMenuPage } from './pages/admin/AdminMenuPage';
import { AdminDailyMenuPage } from './pages/admin/AdminDailyMenuPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminHistoryPage } from './pages/admin/AdminHistoryPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { MenuItem } from './types';
import { INITIAL_MENU_ITEMS } from './data/defaultMenu';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, isAdmin, quickLogin } = useAuth();
  const { toastMessage } = useCart();

  // Simple client-side routing
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [orderIdParam, setOrderIdParam] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Fetch full master menu
  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu/items');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMenuItems(data);
        }
      }
    } catch (e) {
      console.error('Failed to load menu items', e);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const navigate = (path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (path.includes('?id=')) {
      const parts = path.split('?id=');
      const base = parts[0];
      const id = parts[1].split('&')[0];
      setOrderIdParam(id);
      setCurrentRoute(base);
    } else {
      setOrderIdParam(undefined);
      setCurrentRoute(path);
    }
  };

  // Sync Admin tab from route and auto-elevate admin session when visiting admin dashboard
  useEffect(() => {
    if (currentRoute.startsWith('/admin')) {
      if (!isAdmin && currentRoute !== '/admin/login') {
        quickLogin('admin');
      }

      if (currentRoute === '/admin' || currentRoute === '/admin/dashboard') {
        setAdminTab('dashboard');
      } else if (currentRoute === '/admin/orders' || currentRoute === '/admin/live-orders') {
        setAdminTab('live-orders');
      } else if (currentRoute === '/admin/menu' || currentRoute === '/admin/menu-catalog') {
        setAdminTab('menu-catalog');
      } else if (currentRoute === '/admin/daily' || currentRoute === '/admin/daily-menu') {
        setAdminTab('daily-menu');
      } else if (currentRoute === '/admin/students') {
        setAdminTab('students');
      } else if (currentRoute === '/admin/history') {
        setAdminTab('history');
      } else if (currentRoute === '/admin/settings') {
        setAdminTab('settings');
      }
    }
  }, [currentRoute, isAdmin]);

  // Determine if on Admin route
  const isAdminRoute = currentRoute.startsWith('/admin');

  if (isAdminRoute) {
    // Only display login screen if specifically at /admin/login AND not admin
    if (currentRoute === '/admin/login' && !isAdmin) {
      return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
          <LoginPage navigate={navigate} isAdminLogin={true} />
        </div>
      );
    }

    return (
      <AdminLayout currentTab={adminTab} setTab={setAdminTab} navigate={navigate}>
        {adminTab === 'dashboard' && <AdminDashboard setTab={setAdminTab} />}
        {adminTab === 'live-orders' && <AdminOrdersPage />}
        {adminTab === 'menu-catalog' && (
          <AdminMenuPage menuItems={menuItems} onRefresh={fetchMenu} />
        )}
        {adminTab === 'daily-menu' && <AdminDailyMenuPage allMenuItems={menuItems} />}
        {adminTab === 'students' && <AdminStudentsPage />}
        {adminTab === 'history' && <AdminHistoryPage />}
        {adminTab === 'settings' && <AdminSettingsPage />}
      </AdminLayout>
    );
  }

  // Student Views
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-sans">
      <Navbar
        currentRoute={currentRoute}
        navigate={navigate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentRoute === '/' && <HomePage navigate={navigate} menuItems={menuItems} />}
        {currentRoute === '/today-menu' && (
          <TodayMenuPage initialItems={menuItems} searchQuery={searchQuery} />
        )}
        {currentRoute === '/menu' && (
          <FullMenuPage menuItems={menuItems} searchQuery={searchQuery} />
        )}
        {currentRoute === '/cart' && <CartPage navigate={navigate} />}
        {currentRoute === '/checkout' && <CheckoutPage navigate={navigate} />}
        {currentRoute === '/orders' && (
          <OrderTrackingPage navigate={navigate} orderIdParam={orderIdParam} />
        )}
        {currentRoute === '/history' && <OrderHistoryPage navigate={navigate} />}
        {currentRoute === '/profile' && <ProfilePage navigate={navigate} />}
        {currentRoute === '/about' && <AboutPage />}
        {currentRoute === '/contact' && <ContactPage />}
        {currentRoute === '/login' && <LoginPage navigate={navigate} />}
        {currentRoute === '/register' && <RegisterPage navigate={navigate} />}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
