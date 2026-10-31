import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    pricing,
    updateQuantity,
    removeFromCart,
    clearCart,
    setCheckoutStage,
    setNavigationTarget,
    currentFloor
  } = useStore();

  if (!isCartOpen) return null;

  const totalItems = cart.reduce((acc, it) => acc + it.quantity, 0);

  const handleProceedToBilling = () => {
    setIsCartOpen(false);
    // Guide player to Checkout Counter 1 on Ground floor
    setNavigationTarget({
      name: 'Checkout Counter 1 (Ground Floor)',
      position: [-5.5, 0, 9.8],
      aisle: 0
    });
    setCheckoutStage('SCANNING');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-end bg-black/70 backdrop-blur-xs animate-fade-in pointer-events-auto">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={() => setIsCartOpen(false)} />

      {/* Responsive Slide-out / Bottom-sheet Drawer */}
      <div className="w-full sm:max-w-md h-[90vh] sm:h-full glass-panel border-t sm:border-t-0 sm:border-l border-white/15 rounded-t-3xl sm:rounded-none flex flex-col shadow-2xl animate-slide-up sm:animate-slide-left bg-slate-950/95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <img
              src="/suprgo-logo-transparent.png"
              alt="SuprGo"
              className="h-9 w-auto object-contain drop-shadow"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">Live Trolley</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Synced with 3D Basket &bull; Live Checkout
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10"
            title="Close Trolley"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Floor Context Banner */}
        <div className="px-5 py-2 bg-slate-900/40 border-b border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            Current Location: {currentFloor === 1 ? '1st Floor (Fashion & Apparel)' : 'Ground Floor (Groceries & Staples)'}
          </span>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-400/80 hover:text-red-300 transition-colors cursor-pointer text-[10px] font-bold hover:underline"
            >
              Empty All
            </button>
          )}
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mb-4 text-slate-500 shadow-inner">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Your Trolley is Empty</h3>
              <p className="text-xs text-slate-400 max-w-[260px] mb-5 leading-relaxed">
                Walk through Ground Floor grocery aisles or take the Lift to 1st Floor Fashion boutique to pick products.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30 transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            cart.map(({ product, quantity }) => {
              const isFashion = product.floor === 1 || product.categorySlug === 'fashion';
              return (
                <div
                  key={product.id}
                  className="glass-card p-3 rounded-2xl flex items-center gap-3 border border-white/10 hover:border-white/20 transition-all bg-slate-900/70 group"
                >
                  <div className="relative w-14 h-14 rounded-xl bg-slate-800 border border-white/10 shrink-0 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span
                      className={`absolute bottom-0 left-0 right-0 text-[8px] font-black text-center py-0.2 text-white ${
                        isFashion ? 'bg-purple-600/90' : 'bg-cyan-700/90'
                      }`}
                    >
                      {isFashion ? 'F1 • Fashion' : 'G • Grocery'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider truncate">
                        {product.brand}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate leading-tight mt-0.5">
                      {product.name}
                    </h4>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xs font-extrabold text-white">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-[10px] text-slate-500 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">/ {product.unit}</span>
                    </div>
                  </div>

                  {/* Quantity Stepper Controls (Large touch targets for mobile thumb) */}
                  <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-white/15 shrink-0">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer font-bold"
                      title={quantity === 1 ? 'Remove from trolley' : 'Decrease quantity'}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black text-white w-5 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer font-bold"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* One-tap Trash Removal Button */}
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all cursor-pointer shrink-0"
                    title="Remove item from trolley"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Price breakdown and Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/95 space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{pricing.subtotal}</span>
              </div>
              {pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Retail Savings
                  </span>
                  <span>-₹{pricing.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Taxes & GST (CGST 9% + SGST 9%)</span>
                <span>₹{pricing.cgst + pricing.sgst}</span>
              </div>
              <div className="w-full h-px bg-white/10 my-1" />
              <div className="flex justify-between text-base font-black text-white">
                <span>Grand Total</span>
                <span className="text-cyan-400">₹{pricing.total}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToBilling}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <span>Proceed to Checkout Counter</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                Lanes 01 (Priya), 02 (Rahul), 03 (Ananya)
              </span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Instant Digital Bill</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
