import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Star, ShoppingBag, MapPin, CheckCircle } from 'lucide-react';

export const ProductInspectModal: React.FC = () => {
  const { inspectingProduct, setInspectingProduct, addToCart, setNavigationTarget } = useStore();
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddedToast, setIsAddedToast] = useState<boolean>(false);

  if (!inspectingProduct) return null;

  const handleAdd = () => {
    addToCart(inspectingProduct, quantity);
    setIsAddedToast(true);
    setTimeout(() => {
      setIsAddedToast(false);
      setInspectingProduct(null);
    }, 500);
  };

  const handleLocateOnShelf = () => {
    setNavigationTarget({
      name: inspectingProduct.name,
      position: inspectingProduct.shelfPosition,
      aisle: inspectingProduct.aisle
    });
    setInspectingProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-white/20 shadow-2xl overflow-hidden bg-slate-950/95 flex flex-col md:flex-row">
        <button
          onClick={() => setInspectingProduct(null)}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Media */}
        <div className="md:w-5/12 p-6 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900/60 to-slate-950/90 border-b md:border-b-0 md:border-r border-white/10">
          <div className="relative w-full aspect-square max-w-[220px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-4 bg-slate-900">
            <img
              src={inspectingProduct.image}
              alt={inspectingProduct.name}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            />
            {inspectingProduct.discount > 0 && (
              <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-red-500 text-white font-extrabold text-xs shadow-md">
                {inspectingProduct.discount}% OFF
              </span>
            )}
          </div>

          <div className="w-full text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              Aisle {inspectingProduct.aisle} • Rack {inspectingProduct.rack}
            </span>
          </div>
        </div>

        {/* Right: Specifications & Actions */}
        <div className="md:w-7/12 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="uppercase font-bold text-cyan-400 tracking-wider">
                {inspectingProduct.brand}
              </span>
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-bold text-white">{inspectingProduct.rating}</span>
                <span className="text-slate-500">({inspectingProduct.reviewsCount})</span>
              </div>
            </div>

            <h2 className="text-lg font-bold text-white mb-2 leading-snug">
              {inspectingProduct.name}
            </h2>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-black text-white">₹{inspectingProduct.price}</span>
              {inspectingProduct.originalPrice > inspectingProduct.price && (
                <span className="text-sm text-slate-400 line-through">
                  ₹{inspectingProduct.originalPrice}
                </span>
              )}
              <span className="text-xs text-slate-400 ml-1">({inspectingProduct.unit})</span>
              <span className="ml-auto text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> In Stock ({inspectingProduct.stock})
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {inspectingProduct.description}
            </p>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 mb-4 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Nutritional Highlights & Specs
              </div>
              <p className="text-slate-200">{inspectingProduct.nutrition}</p>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                Barcode: {inspectingProduct.barcode}
              </div>
            </div>

            {/* Quick quantity selection presets */}
            <div className="flex items-center gap-2 mb-3 text-xs">
              <span className="text-slate-400 text-[11px]">Presets:</span>
              {[1, 2, 5].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setQuantity(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    quantity === preset
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 border-t border-white/10 flex items-center gap-3">
            <div className="flex items-center bg-slate-900 rounded-xl border border-white/15 px-2 py-1.5">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white cursor-pointer font-bold text-sm"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-bold text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(inspectingProduct.stock, quantity + 1))}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white cursor-pointer font-bold text-sm"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAdd}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isAddedToast ? 'Added to Trolley!' : `Add ${quantity} to Trolley`}</span>
            </button>

            <button
              onClick={handleLocateOnShelf}
              title="Show Navigation Guide on Floor"
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
