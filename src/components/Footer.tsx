import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SRMLogo } from './SRMLogo';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { isAdmin, quickLogin } = useAuth();
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4">
            <SRMLogo size="md" showText={false} />
            <div>
              <h3 className="font-heading font-extrabold text-white text-lg tracking-wide">
                SRM KDFC CANTEEN
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                SRM MCET Campus Digital Ordering & Management System
              </p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fresh, hygienic food prepared daily with transparent pricing. Designed for SRM MCET students, faculty, and campus staff.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-sm tracking-wider uppercase">
              Quick Menus
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigate('/today-menu')}
                  className="hover:text-amber-400 transition-colors"
                >
                  ⚡ Today's Live Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/menu')}
                  className="hover:text-amber-400 transition-colors"
                >
                  📖 Full Master Menu (57 Items)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/orders')}
                  className="hover:text-amber-400 transition-colors"
                >
                  📦 Live Order Tracker
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/history')}
                  className="hover:text-amber-400 transition-colors"
                >
                  📋 Past Order History
                </button>
              </li>
            </ul>
          </div>

          {/* Timings & Counters */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-sm tracking-wider uppercase">
              Counter Hours
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Monday - Saturday</p>
                  <p>7:30 AM – 7:30 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>KDFC Food Court, Ground Floor, SRM MCET Campus</span>
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-white text-sm tracking-wider uppercase">
              Canteen Counter
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Counter Helpline: +91 94430 00000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>kdfc.canteen@srmmcet.edu.in</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={async () => {
                    if (!isAdmin) {
                      await quickLogin('admin');
                    }
                    navigate('/admin/dashboard');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-bold text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Staff & Kitchen Management
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SRM MCET KDFC Canteen. Official Campus Food Management.</p>
          <p className="flex items-center gap-1">
            Built for SRM MCET Students with <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
