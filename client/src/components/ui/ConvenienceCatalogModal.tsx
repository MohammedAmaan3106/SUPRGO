import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingCart,
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Eye,
  ShoppingBag,
  Sparkles,
  Building2,
  ArrowUpDown
} from 'lucide-react';
import { Product } from '../../types';

export const ConvenienceCatalogModal: React.FC = () => {
  const {
    isConvenienceCatalogOpen,
    setIsConvenienceCatalogOpen,
    products,
    cart,
    pricing,
    addToCart,
    removeFromCart,
    updateQuantity,
    setNavigationTarget,
    currentFloor,
    callElevator,
    setIsCartOpen
  } = useStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [floorFilter, setFloorFilter] = useState<'all' | 0 | 1>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const categories = [
    { id: 'all', label: 'All Departments' },
    { id: 'produce', label: 'Fruits & Vegetables' },
    { id: 'dairy', label: 'Dairy & Refrigerated' },
    { id: 'beverages', label: 'Beverages' },
    { id: 'groceries', label: 'Groceries & Staples' },
    { id: 'snacks', label: 'Snacks & Packaged' },
    { id: 'care', label: 'Personal & Household' },
    { id: 'fashion', label: 'Fashion & Clothing' },
    { id: 'footwear', label: 'Sneakers & Shoes' },
    { id: 'accessories', label: 'Bags & Accessories' }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Floor filter
      if (floorFilter !== 'all' && (p.floor ?? 0) !== floorFilter) {
        return false;
      }

      // Category filter
      const matchCat =
        selectedCategory === 'all' ||
        p.categorySlug === selectedCategory ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase());

      // Search filter
      const matchQuery =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchQuery;
    });
  }, [products, searchQuery, selectedCategory, floorFilter]);

  if (!isConvenienceCatalogOpen) return null;

  const totalItems = cart.reduce((acc, it) => acc + it.quantity, 0);

  const getQty = (prodId: string) => quantities[prodId] || 1;

  const setQty = (prodId: string, q: number) => {
    setQuantities(prev => ({ ...prev, [prodId]: Math.max(1, q) }));
  };

  const handleQuickAdd = (product: Product, q: number) => {
    addToCart(product, q);
  };

  const handleLocateOnFloor = (product: Product) => {
    const prodFloor = product.floor ?? 0;
    if (prodFloor !== currentFloor) {
      // Guide player to the elevator first to reach the correct floor!
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
    setIsConvenienceCatalogOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="w-full max-w-5xl h-[92vh] sm:h-[88vh] glass-panel rounded-3xl border border-white/20 shadow-2xl overflow-hidden bg-slate-950/95 flex flex-col">
        {/* Header Bar */}
        <div className="p-3 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img
              src="/suprgo-logo-transparent.png"
              alt="SuprGo"
              className="h-8 sm:h-10 w-auto object-contain drop-shadow"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-lg font-extrabold text-white">Store Catalog & Quick Pick</h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {products.length} Products Across 2 Floors
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-400">
                Pick or remove products anytime, or click the navigation pin to locate on racks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Cart summary button */}
            <button
              onClick={() => {
                setIsConvenienceCatalogOpen(false);
                setIsCartOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-white/10 text-xs font-semibold cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-cyan-400" />
              <span>{totalItems}</span>
              <span className="text-cyan-400 font-bold">₹{pricing.total}</span>
            </button>

            <button
              onClick={() => setIsConvenienceCatalogOpen(false)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Return to 3D Supermarket"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Multi-Floor Filter Toolbar */}
        <div className="p-3 sm:p-4 border-b border-white/10 bg-slate-900/40 space-y-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 focus-within:border-cyan-400 transition-colors">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fruits, milk, jeans, sneakers, dresses, biscuits..."
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Floor Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => setFloorFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  floorFilter === 'all'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFloorFilter(0)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  floorFilter === 0
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Floor G: Grocery</span>
              </button>
              <button
                onClick={() => setFloorFilter(1)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  floorFilter === 1
                    ? 'bg-purple-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Floor 1: Fashion</span>
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 text-xs">
              No products found matching your search and category selection.
            </div>
          ) : (
            filteredProducts.map((prod) => {
              const currentQty = getQty(prod.id);
              const inCartItem = cart.find((c) => c.product.id === prod.id);
              const isFashion = prod.floor === 1 || prod.categorySlug === 'fashion';

              return (
                <div
                  key={prod.id}
                  className="glass-card p-3 rounded-2xl flex flex-col justify-between border border-white/10 hover:border-cyan-500/30 transition-all bg-slate-900/70 group"
                >
                  <div className="flex gap-3">
                    <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span
                        className={`absolute top-1 left-1 px-1.5 py-0.2 rounded font-black text-[8px] text-white ${
                          isFashion ? 'bg-purple-600/90' : 'bg-cyan-600/90'
                        }`}
                      >
                        {isFashion ? 'Floor 1' : 'Floor G'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="font-bold text-cyan-400 uppercase tracking-wider truncate">
                          {prod.brand}
                        </span>
                        <span className="flex items-center gap-1 shrink-0 text-slate-400">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {isFashion ? 'Boutique' : `Aisle ${prod.aisle}`}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-white leading-tight mb-1 line-clamp-2">
                        {prod.name}
                      </h3>

                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-white">₹{prod.price}</span>
                        {prod.originalPrice > prod.price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{prod.originalPrice}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">({prod.unit})</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity presets & Add/Remove Action Row */}
                  <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-2">
                    {/* If item is in cart, show live quantity controls + Trash */}
                    {inCartItem ? (
                      <div className="flex items-center justify-between bg-slate-950/80 p-1.5 rounded-xl border border-cyan-500/30">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-300">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>In Cart: {inCartItem.quantity}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(prod.id, inCartItem.quantity - 1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-4 text-center text-xs font-bold text-white">
                            {inCartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(prod.id, inCartItem.quantity + 1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(prod.id)}
                            className="w-6 h-6 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 flex items-center justify-center cursor-pointer ml-1"
                            title="Remove from trolley"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Quantity presets: 1, 2, 5 */
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400">Choose Quantity:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 5].map((preset) => (
                            <button
                              key={preset}
                              onClick={() => setQty(prod.id, preset)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                currentQty === preset
                                  ? 'bg-cyan-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              +{preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickAdd(prod, currentQty)}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add +{currentQty} to Trolley</span>
                      </button>

                      <button
                        onClick={() => handleLocateOnFloor(prod)}
                        title={
                          (prod.floor ?? 0) !== currentFloor
                            ? 'Take Lift to locate on shelf'
                            : 'Guide to shelf in 3D'
                        }
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-white/10 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold hidden xs:inline">Locate</span>
                      </button>
                    </div>
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
