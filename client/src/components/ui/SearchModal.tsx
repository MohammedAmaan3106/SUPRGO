import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, X, MapPin, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../../types';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    products,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    setNavigationTarget,
    currentFloor,
    callElevator,
    setInspectingProduct
  } = useStore();

  const [query, setQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'produce', label: 'Produce & Fruits' },
    { id: 'dairy', label: 'Dairy & Drinks' },
    { id: 'groceries', label: 'Groceries' },
    { id: 'snacks', label: 'Snacks & Pantry' },
    { id: 'care', label: 'Household & Care' },
    { id: 'fashion', label: 'Fashion & Shoes' }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'all' ||
        p.categorySlug === selectedCategory ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchQuery =
        !query.trim() ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase());

      return matchCat && matchQuery;
    });
  }, [products, query, selectedCategory]);

  if (!isSearchOpen) return null;

  const handleNavigate = (product: Product) => {
    const prodFloor = product.floor ?? 0;
    if (prodFloor !== currentFloor) {
      setNavigationTarget({
        name: `Supermarket Lift (Take to ${prodFloor === 1 ? 'Floor 1' : 'Ground Floor'})`,
        position: [0, currentFloor === 0 ? 0 : 5.6, -9.5],
        aisle: 0
      });
      callElevator(currentFloor);
    } else {
      setNavigationTarget({
        name: product.name,
        position: product.shelfPosition,
        aisle: product.aisle
      });
    }
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-3 sm:px-4 bg-black/75 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="w-full max-w-2xl glass-panel rounded-3xl border border-white/20 shadow-2xl overflow-hidden bg-slate-950/95 flex flex-col max-h-[82vh]">
        {/* Header & Search Bar */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center gap-2.5 sm:gap-3 bg-slate-900/60">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fruits, dairy, sneakers, jeans, shampoo, snacks..."
            autoFocus
            className="flex-1 bg-transparent border-none text-white text-xs sm:text-sm outline-none placeholder:text-slate-500 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-3 sm:px-4 py-2 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto bg-slate-900/40 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Results Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No products found matching &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filteredProducts.map((prod) => {
              const inCartItem = cart.find((c) => c.product.id === prod.id);
              const isFashion = prod.floor === 1 || prod.categorySlug === 'fashion';

              return (
                <div
                  key={prod.id}
                  className="glass-card p-2.5 sm:p-3 rounded-2xl flex items-center gap-3 border border-white/10 hover:border-white/20 transition-all bg-slate-900/60"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute bottom-0 inset-x-0 text-[7px] font-black text-center text-white ${
                        isFashion ? 'bg-purple-600/90' : 'bg-cyan-600/90'
                      }`}
                    >
                      {isFashion ? 'F1' : 'G'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                        {prod.brand}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        &bull; {isFashion ? '1st Floor Fashion' : `Aisle ${prod.aisle}`}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{prod.name}</h4>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xs font-black text-white">₹{prod.price}</span>
                      <span className="text-[10px] text-slate-400">/ {prod.unit}</span>
                    </div>
                  </div>

                  {/* Actions: Add / Stepper / Navigate */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {inCartItem ? (
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-cyan-500/30">
                        <button
                          onClick={() => updateQuantity(prod.id, inCartItem.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-4 text-center text-xs font-bold text-white">
                          {inCartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(prod.id, inCartItem.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(prod, 1)}
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Add to Trolley"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Add</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleNavigate(prod)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-white/10 transition-colors cursor-pointer"
                      title="Guide me to this item"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
