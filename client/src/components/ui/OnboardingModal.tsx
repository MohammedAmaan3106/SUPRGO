import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, ArrowRight, Compass, ShieldCheck, Sparkles, X, Building2, Smartphone } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen } = useStore();

  if (!isOnboardingOpen) return null;

  const handleStart = () => {
    localStorage.setItem('suprgo_onboarding_seen', 'true');
    setIsOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="w-full max-w-lg glass-panel rounded-3xl border border-cyan-500/30 shadow-2xl overflow-hidden bg-slate-950/95 flex flex-col p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-3">
            <img
              src="/suprgo-logo-transparent.png"
              alt="SuprGo - Shop Smart Live Better"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow"
            />
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Welcome to SuprGo</h2>
              <p className="text-xs text-cyan-400 font-semibold">Shop Smart • Live Better &bull; 2 Floors</p>
            </div>
          </div>
          <button
            onClick={handleStart}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          Explore a realistic two-floor 3D supermarket with seamless navigation and frictionless shopping:
        </p>

        <div className="space-y-2.5 mb-5">
          {/* Two Floors & Lift */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white mb-0.5">Two Retail Floors & Working 3D Lift</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ground Floor stocks fresh produce, dairy, groceries, snacks & household staples. Take the <span className="text-cyan-300 font-bold">Supermarket Lift</span> to the 1st Floor Fashion Boutique for luxury apparel, sneakers, dresses, and accessories.
              </p>
            </div>
          </div>

          {/* Desktop & Mobile controls */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white mb-0.5">Desktop & Mobile Optimized Controls</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <span className="font-bold text-white">Laptop:</span> <span className="text-cyan-300">W, A, S, D</span> to walk, mouse to look, and <span className="text-cyan-300">[E]</span> to pick up products. Push trolley seamlessly across both floors.<br />
                <span className="font-bold text-white">Mobile:</span> Left thumb analog joystick to move, right swipe to look around, and dedicated instant Add & Remove thumb buttons.
              </p>
            </div>
          </div>

          {/* Catalog & Instant Removal */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white mb-0.5">Instant Add & Remove from Anywhere</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Adjust quantities, add items, or remove them with 1-click at the shelf, in the persistent Live Trolley, or via the <span className="text-purple-300 font-bold">Catalog [Tab]</span>.
              </p>
            </div>
          </div>

          {/* Billing Counters */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white mb-0.5">Checkout Counters 01, 02, 03</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Head to the Ground floor checkout area to dock your trolley with Priya, Rahul, or Ananya, scan barcodes on the conveyor belt, and generate an itemized GST invoice.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer transition-all active:scale-[0.98]"
        >
          <span>Enter 3D Supermarket & Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
