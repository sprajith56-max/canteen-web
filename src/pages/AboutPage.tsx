import React from 'react';
import { SRMLogo } from '../components/SRMLogo';
import { ShieldCheck, HeartHandshake, Utensils, Award, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs text-center space-y-4">
        <SRMLogo size="lg" className="justify-center mx-auto" />
        <div className="space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            CAMPUS DINING INITIATIVE
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">
            About SRM KDFC Canteen
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The official digital student canteen ordering and food management system designed exclusively for SRM MCET students, faculty members, and campus visitors.
          </p>
        </div>
      </div>

      {/* Mission & Purpose */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-lg text-slate-900">
            Freshness & Campus Hygiene
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every dish is cooked fresh daily in our centralized kitchen with high-quality ingredients, clean RO water, and continuous inspection. We serve authentic South Indian tiffin, meals, street chaats, and chilled juices.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-lg text-slate-900">
            Student-First Pricing
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All prices on the digital portal match the official physical price board. Starting from ₹7 for Idli & Vada up to ₹100 for Special Biryani, meals remain affordable for all students.
          </p>
        </div>
      </div>

      {/* Digital Flow Highlights */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <h2 className="font-heading text-2xl font-extrabold text-amber-400">
          How the Digital Ordering Flow Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="font-heading font-extrabold text-2xl text-amber-400">01</span>
            <h4 className="font-bold text-white text-sm">Select & Order</h4>
            <p>Browse today's live menu, pick your favourite dishes, and place your order within seconds.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="font-heading font-extrabold text-2xl text-amber-400">02</span>
            <h4 className="font-bold text-white text-sm">Kitchen Prepares</h4>
            <p>The kitchen screen receives your token immediately and begins cooking fresh food.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="font-heading font-extrabold text-2xl text-amber-400">03</span>
            <h4 className="font-bold text-white text-sm">Token Call & Pickup</h4>
            <p>Your screen alerts you when ready. Show your token at Counter 1 or 2 to collect your meal.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
