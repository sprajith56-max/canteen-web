import React from 'react';
import { MenuItem } from '../types';
import { FoodCard } from '../components/FoodCard';
import {
  Zap,
  Clock,
  ShieldCheck,
  ArrowRight,
  UtensilsCrossed,
  Coffee,
  CheckCircle2,
  ChevronRight,
  Ticket
} from 'lucide-react';

interface HomePageProps {
  navigate: (route: string) => void;
  menuItems: MenuItem[];
}

export const HomePage: React.FC<HomePageProps> = ({ navigate, menuItems }) => {
  const specials = menuItems.filter((i) => i.isSpecial && i.isAvailable).slice(0, 4);
  const hotDrinks = menuItems.filter((i) => i.category === 'Beverages / Hot Drinks').slice(0, 4);
  const mealsAndBiryani = menuItems.filter((i) => i.category === 'Biryani & Fast Food' || i.category === 'Variety Rice & Meals').slice(0, 4);

  return (
    <div className="space-y-16 pb-8">
      {/* ================= HERO SECTION (TWO-COLUMN INSTITUTIONAL LAYOUT) ================= */}
      <section className="bg-white rounded-[24px] border border-slate-200/90 shadow-sm p-6 sm:p-10 lg:p-14 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-6">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#003882] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#003882]" />
              SRM MCET • KDFC CANTEEN
            </div>

            {/* Main Heading */}
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0b1b3d] tracking-tight leading-[1.15]">
              Fresh Food.<br />
              Fast Service.<br />
              <span className="text-[#003882] relative inline-block">
                Better Campus Life.
                <span className="absolute bottom-1 left-0 w-full h-2.5 bg-amber-400/30 -z-10 rounded-sm" />
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
              Order breakfast, lunch, hot filter drinks and evening snacks directly from the SRM MCET campus food court.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                id="hero-order-now-btn"
                onClick={() => navigate('/today-menu')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#003882] hover:bg-[#002a63] text-white font-bold text-sm sm:text-base transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <span>ORDER NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-today-menu-btn"
                onClick={() => navigate('/today-menu')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm sm:text-base transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <UtensilsCrossed className="w-4 h-4 text-slate-950" />
                <span>VIEW TODAY'S MENU</span>
              </button>
            </div>

            {/* Benefits Strip */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span>Quick Service</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-2">
                <span className="text-base">🥘</span>
                <span>Fresh Food</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-2">
                <span className="text-base">🎟</span>
                <span>Smart Token</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (LARGE PROFESSIONAL FOOD IMAGE) */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full rounded-[20px] overflow-hidden border border-slate-200 shadow-md bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=1000&q=80"
                alt="SRM KDFC Authentic Campus Meals"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-[#003882] shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Counter Open Now
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TODAY'S SPECIALS ================= */}
      {specials.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h2 className="font-heading text-2xl font-extrabold text-[#0b1b3d]">
                  Today's Chef Specials
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Handcrafted campus favourites prepared fresh at the SRM KDFC counter
              </p>
            </div>
            <button
              onClick={() => navigate('/today-menu')}
              className="text-xs sm:text-sm font-bold text-[#003882] hover:text-blue-900 flex items-center gap-1 cursor-pointer"
            >
              See All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {specials.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* ================= WHY CHOOSE KDFC CANTEEN ================= */}
      <section className="bg-white rounded-[24px] p-8 sm:p-10 border border-slate-200/90 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-extrabold text-[#003882] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Campus Dining Experience
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0b1b3d]">
            Why Choose SRM KDFC Canteen?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Engineered for fast, hygienic, and student-budget-friendly meals for SRM MCET students.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#003882] text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-[#0b1b3d] text-base">Quick Ordering</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Place orders from your phone anywhere on campus and collect directly with your digital token number.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-[#0b1b3d] text-base">Affordable Prices</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pocket-friendly student rates starting from ₹7 for Idli & Vada up to ₹100 for Special Biryani.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-[#0b1b3d] text-base">Fresh & Hygienic</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Prepared daily under strict food safety standards with quality ingredients and filtered water.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-heading font-bold text-[#0b1b3d] text-base">Live Order Tracking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time token stages from Placed → Confirmed → Cooking → Ready so you skip waiting in crowds.
            </p>
          </div>
        </div>
      </section>

      {/* ================= BIRYANI & MEALS PREVIEW ================= */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-[#0b1b3d]">
              Rice, Biryani & Meals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Wholesome lunch options, fried rice, and traditional South Indian meals
            </p>
          </div>
          <button
            onClick={() => navigate('/menu')}
            className="text-xs sm:text-sm font-bold text-[#003882] hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            Explore Menu <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mealsAndBiryani.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* ================= HOT FILTER DRINKS & CHAI ================= */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-600" />
            <h2 className="font-heading text-2xl font-extrabold text-[#0b1b3d]">
              Hot Beverages & Filter Coffee
            </h2>
          </div>
          <button
            onClick={() => navigate('/menu')}
            className="text-xs sm:text-sm font-bold text-[#003882] hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            All Drinks <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {hotDrinks.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
};

