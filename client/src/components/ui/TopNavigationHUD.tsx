import React from 'react';
import { useStore, CASHIERS } from '../../context/StoreContext';
import {
  ShoppingCart,
  Search,
  CheckSquare,
  Settings,
  Navigation,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  Music,
  MousePointer,
  Building2,
  ArrowUpDown
} from 'lucide-react';
import { CheckoutCounterId } from '../../types';
import { soundManager } from '../../audio/soundManager';

export const TopNavigationHUD: React.FC = () => {
  const {
    cart,
    pricing,
    setIsCartOpen,
    setIsSearchOpen,
    setIsShoppingListOpen,
    setIsSettingsOpen,
    setIsConvenienceCatalogOpen,
    setIsOnboardingOpen,
    shoppingList,
    setNavigationTarget,
    settings,
    updateSettings,
    isPointerLocked,
    toggleCursor,
    currentFloor,
    callElevator,
    elevatorState
  } = useStore();

  const totalItems = cart.reduce((acc, it) => acc + it.quantity, 0);
  const checkedCount = shoppingList.filter((it) => it.checked).length;

  const navigateToCounter = (counterId: CheckoutCounterId) => {
    const coords: Record<CheckoutCounterId, [number, number, number]> = {
      1: [-5.5, 0, 9.8],
      2: [0.0, 0, 9.8],
      3: [5.5, 0, 9.8]
    };
    setNavigationTarget({
      name: `${CASHIERS[counterId].laneName} (Ground Floor)`,
      position: coords[counterId],
      aisle: 0
    });
  };

  const handleLiftGuide = () => {
    // If not near lift, set waypoint to lift shaft
    setNavigationTarget({
      name: 'Supermarket Lift',
      position: [0, currentFloor === 0 ? 0 : 5.6, -9.5],
      aisle: 0
    });
    // Also request elevator to current floor
    callElevator(currentFloor);
  };

  return (
    <header className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-40 flex items-center justify-between pointer-events-none select-none">
      {/* Official Brand Logo & Tutorial prompt */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        <div className="glass-panel px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-2xl flex items-center gap-2 border border-white/10 shadow-lg bg-slate-950/90">
          <img
            src="/suprgo-logo-transparent.png"
            alt="SuprGo - Shop Smart Live Better"
            className="h-7 sm:h-9 w-auto object-contain drop-shadow"
          />
          <div className="hidden lg:block border-l border-white/15 pl-2">
            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              2 FLOORS
            </span>
          </div>
        </div>

        {/* Floor Indicator & Lift Route Button */}
        <button
          onClick={handleLiftGuide}
          className="glass-panel px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl flex items-center gap-1.5 border border-white/10 hover:border-cyan-500/40 bg-slate-900/80 hover:bg-slate-800/80 text-white transition-all cursor-pointer shadow-md group"
          title={`Currently on ${currentFloor === 1 ? '1st Floor Fashion' : 'Ground Floor Grocery'}. Click to guide to Supermarket Lift.`}
        >
          <div className="w-5 h-5 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-black text-[10px] group-hover:bg-cyan-500/30">
            {currentFloor === 0 ? 'G' : '1'}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-[9px] text-slate-400 uppercase font-bold leading-none">Floor</div>
            <div className="text-[11px] font-bold text-white leading-tight">
              {currentFloor === 0 ? 'Grocery Mart' : 'Fashion Boutique'}
            </div>
          </div>
          <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400 opacity-70 group-hover:opacity-100" />
        </button>

        {/* Tutorial button */}
        <button
          onClick={() => setIsOnboardingOpen(true)}
          className="glass-panel p-2 sm:p-2.5 rounded-2xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
          title="How to Shop (Guide & Controls)"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      {/* Center Action Toolbar */}
      <div className="glass-panel px-2 sm:px-3 py-1.5 rounded-2xl flex items-center gap-1 sm:gap-2 border border-white/10 shadow-lg pointer-events-auto bg-slate-950/80">
        {/* Convenience Catalog Mode Button */}
        <button
          onClick={() => setIsConvenienceCatalogOpen(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition-all text-xs font-bold cursor-pointer shadow-sm active:scale-95"
          title="Browse Full 78-Item Catalog [Tab]"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden xs:inline">Catalog</span>
          <kbd className="hidden lg:inline px-1 py-0.2 rounded bg-purple-950/80 text-[10px] text-purple-200 border border-purple-500/40">
            Tab
          </kbd>
        </button>

        <div className="w-px h-4 sm:h-5 bg-white/10" />

        {/* Search button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-xs font-medium cursor-pointer"
          title="Search Products [Q]"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden lg:inline px-1 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
            Q
          </kbd>
        </button>

        <div className="hidden sm:block w-px h-5 bg-white/10" />

        {/* Shopping list button */}
        <button
          onClick={() => setIsShoppingListOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-xs font-medium cursor-pointer"
          title="Shopping Checklist [L]"
        >
          <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">List</span>
          <span className="text-[11px] font-bold text-amber-300">
            ({checkedCount}/{shoppingList.length})
          </span>
          <kbd className="hidden lg:inline px-1 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
            L
          </kbd>
        </button>

        <div className="hidden md:block w-px h-5 bg-white/10" />

        {/* Quick Checkout Route */}
        <button
          onClick={() => navigateToCounter(1)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-xs font-medium cursor-pointer"
          title="Navigate to Ground Floor Checkout Counter"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span>Checkout Lanes</span>
        </button>
      </div>

      {/* Right side: Music, Cursor Lock (Desktop), Sound, Settings, Cart */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        {/* Soothing Supermarket Music Quick Toggle */}
        <button
          onClick={async () => {
            await soundManager.resumeAudioContext();
            updateSettings({ musicEnabled: !settings.musicEnabled });
          }}
          className={`glass-panel px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer border ${
            settings.musicEnabled
              ? 'border-purple-500/40 bg-purple-950/60 text-purple-200 shadow-md shadow-purple-500/20'
              : 'border-white/10 hover:bg-white/10 text-slate-400'
          }`}
          title={settings.musicEnabled ? 'Pause Soothing Supermarket Music' : 'Play Soothing Supermarket Music'}
        >
          <Music className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${settings.musicEnabled ? 'text-purple-400 animate-pulse' : 'text-slate-400'}`} />
          {settings.musicEnabled && (
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 bg-purple-400 rounded-full animate-pulse h-3" />
              <span className="w-0.5 bg-purple-300 rounded-full animate-bounce h-2" />
              <span className="w-0.5 bg-purple-400 rounded-full animate-pulse h-3.5" />
            </div>
          )}
          <span className="hidden xl:inline text-xs font-semibold">
            {settings.musicEnabled ? 'Music Playing' : 'Music Off'}
          </span>
        </button>

        {/* Smart Cursor Control Indicator & Toggle (Desktop Only) */}
        <button
          onClick={toggleCursor}
          className={`hidden md:flex glass-panel px-2.5 py-1.5 rounded-2xl items-center gap-1.5 transition-all cursor-pointer border ${
            !isPointerLocked
              ? 'border-cyan-500/40 bg-cyan-950/50 text-cyan-300 shadow-md shadow-cyan-500/20'
              : 'border-white/10 hover:bg-white/10 text-slate-400'
          }`}
          title={isPointerLocked ? 'Click or press Alt to Free Cursor' : 'Click or press Alt to Lock 3D Camera Look'}
        >
          <MousePointer className={`w-3.5 h-3.5 ${!isPointerLocked ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span className="hidden lg:inline text-xs font-medium">
            {!isPointerLocked ? 'Cursor: Free' : 'Cursor: Look'}
          </span>
          <kbd className="hidden lg:inline px-1 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
            Alt
          </kbd>
        </button>

        {/* Master Sound SFX Toggle */}
        <button
          onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          className="hidden sm:flex glass-panel p-2 sm:p-2.5 rounded-2xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
          title={settings.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="glass-panel p-2 sm:p-2.5 rounded-2xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
          title="Store Settings & Controls [ESC]"
        >
          <Settings className="w-4 h-4 text-slate-300" />
        </button>

        {/* Cart Drawer Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="glass-panel px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl flex items-center gap-2 sm:gap-2.5 border border-cyan-500/30 hover:border-cyan-500/60 transition-all cursor-pointer bg-slate-900/80 shadow-lg group active:scale-95"
        >
          <div className="relative">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 min-w-[16px] text-[9px] font-black rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow">
                {totalItems}
              </span>
            )}
          </div>
          <div className="text-left">
            <div className="text-[9px] uppercase font-bold text-slate-400 leading-none">Trolley</div>
            <div className="text-xs font-black text-white leading-tight">₹{pricing.total}</div>
          </div>
        </button>
      </div>
    </header>
  );
};
