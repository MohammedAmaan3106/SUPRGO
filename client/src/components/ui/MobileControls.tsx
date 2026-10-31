import React, { useState, useEffect, useRef } from 'react';
import { useStore, CASHIERS } from '../../context/StoreContext';
import {
  ShoppingBag,
  Eye,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  Layers,
  Trash2
} from 'lucide-react';
import { CheckoutCounterId } from '../../types';

export const MobileControls: React.FC = () => {
  const {
    activeProduct,
    addToCart,
    removeFromCart,
    updateQuantity,
    setInspectingProduct,
    setIsCartOpen,
    setIsSearchOpen,
    setIsConvenienceCatalogOpen,
    checkoutStage,
    setCheckoutStage,
    cart,
    playerPosition,
    setMobileMoveVector,
    setMobileLookDelta,
    currentFloor,
    elevatorState,
    selectElevatorFloor,
    isNearElevator,
    isUIActive
  } = useStore();

  const [isMobileMode, setIsMobileMode] = useState<boolean>(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickTouchId = useRef<number | null>(null);
  const joystickCenter = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera swipe touch tracking
  const lookTouchId = useRef<number | null>(null);
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const checkMobile = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isNarrow = window.innerWidth <= 1024;
      setIsMobileMode(hasTouch || isNarrow);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Near billing counter detection (Ground floor only)
  const isNearBilling = currentFloor === 0 && Math.hypot(playerPosition[0] - 0, playerPosition[2] - 9.8) < 3.4;

  const activeInCart = activeProduct
    ? cart.find((item) => item.product.id === activeProduct.id)
    : null;

  // ========================================================
  // VIRTUAL ANALOG JOYSTICK (Bottom-Left)
  // ========================================================
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (joystickTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchId.current = touch.identifier;

    if (joystickRef.current) {
      const rect = joystickRef.current.getBoundingClientRect();
      joystickCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      updateJoystick(touch.clientX, touch.clientY);
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    const dx = clientX - joystickCenter.current.x;
    const dy = clientY - joystickCenter.current.y;
    const maxRadius = 45;
    const dist = Math.hypot(dx, dy);

    if (dist <= maxRadius) {
      setKnobPos({ x: dx, y: dy });
      setMobileMoveVector({ x: dx / maxRadius, y: dy / maxRadius });
    } else {
      const angle = Math.atan2(dy, dx);
      const kx = Math.cos(angle) * maxRadius;
      const ky = Math.sin(angle) * maxRadius;
      setKnobPos({ x: kx, y: ky });
      setMobileMoveVector({ x: kx / maxRadius, y: ky / maxRadius });
    }
  };

  // ========================================================
  // TOUCH SWIPE CAMERA LOOK (Right half of the screen)
  // ========================================================
  const handleLookTouchStart = (e: React.TouchEvent) => {
    if (lookTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    // Only capture touches starting on the right half of the screen
    if (touch.clientX > window.innerWidth * 0.45) {
      lookTouchId.current = touch.identifier;
      lastLookPos.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleGlobalTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // Handle Joystick
      if (touch.identifier === joystickTouchId.current) {
        updateJoystick(touch.clientX, touch.clientY);
      }

      // Handle Camera Look
      if (touch.identifier === lookTouchId.current) {
        const dx = touch.clientX - lastLookPos.current.x;
        const dy = touch.clientY - lastLookPos.current.y;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };
        setMobileLookDelta({ x: dx, y: dy });
      }
    }
  };

  const handleGlobalTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // Release Joystick
      if (touch.identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        setKnobPos({ x: 0, y: 0 });
        setMobileMoveVector({ x: 0, y: 0 });
      }

      // Release Camera Look
      if (touch.identifier === lookTouchId.current) {
        lookTouchId.current = null;
        setMobileLookDelta({ x: 0, y: 0 });
      }
    }
  };

  if (!isMobileMode || isUIActive) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 select-none touch-none"
      onTouchMove={handleGlobalTouchMove}
      onTouchEnd={handleGlobalTouchEnd}
      onTouchCancel={handleGlobalTouchEnd}
    >
      {/* Right side Touch Look Drag Area */}
      <div
        className="absolute top-16 bottom-24 right-0 w-1/2 pointer-events-auto"
        onTouchStart={handleLookTouchStart}
      />

      {/* ========================================================
          1. ANALOG VIRTUAL JOYSTICK (Bottom-Left)
          ======================================================== */}
      <div className="absolute bottom-8 left-6 pointer-events-auto">
        <div
          ref={joystickRef}
          onTouchStart={handleJoystickTouchStart}
          className="relative w-28 h-28 rounded-full bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 flex items-center justify-center shadow-2xl active:border-cyan-400"
        >
          {/* Compass Guides */}
          <div className="absolute top-2 w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
          <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
          <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-cyan-400/50" />

          {/* Movable Knob */}
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 flex items-center justify-center transition-transform"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* ========================================================
          2. MOBILE CONTEXTUAL ACTION DOCK (Bottom-Right)
          ======================================================== */}
      <div className="absolute bottom-8 right-6 flex flex-col items-end gap-3 pointer-events-auto">
        {/* Elevator Floor Selector Panel when inside or near elevator */}
        {(isNearElevator || elevatorState.isPlayerInside) && (
          <div className="glass-panel p-2.5 rounded-2xl flex items-center gap-2 border border-purple-500/40 bg-slate-950/95 shadow-2xl animate-slide-up">
            <span className="text-[11px] font-bold text-purple-400 px-2 uppercase">Lift</span>
            <button
              onClick={() => selectElevatorFloor(0)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                currentFloor === 0
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              G Floor
            </button>
            <button
              onClick={() => selectElevatorFloor(1)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                currentFloor === 1
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              1st Floor
            </button>
          </div>
        )}

        {/* Product Stepper (+ / -) when looking at product */}
        {activeProduct && (
          <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 border border-cyan-500/40 bg-slate-950/95 shadow-2xl animate-slide-up">
            {activeInCart ? (
              <>
                <button
                  onClick={() => updateQuantity(activeProduct.id, activeInCart.quantity - 1)}
                  className="w-11 h-11 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center border border-red-500/30 active:scale-90 transition-transform"
                  title="Remove 1 unit"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="px-2 text-center min-w-[28px]">
                  <span className="text-sm font-extrabold text-white">{activeInCart.quantity}</span>
                </div>
                <button
                  onClick={() => addToCart(activeProduct, 1)}
                  className="w-11 h-11 rounded-xl bg-cyan-500 text-slate-950 font-bold flex items-center justify-center active:scale-90 transition-transform shadow-md"
                  title="Add 1 unit"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => removeFromCart(activeProduct.id)}
                  className="w-11 h-11 rounded-xl bg-white/10 text-slate-400 hover:text-red-400 flex items-center justify-center border border-white/10"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => addToCart(activeProduct, 1)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Trolley</span>
              </button>
            )}

            <button
              onClick={() => setInspectingProduct(activeProduct)}
              className="w-11 h-11 rounded-xl bg-white/10 text-cyan-400 flex items-center justify-center border border-white/10"
              title="Inspect"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Near Billing Counter Action Button */}
        {isNearBilling && cart.length > 0 && checkoutStage === 'SHOPPING' && (
          <button
            onClick={() => setCheckoutStage('SCANNING')}
            className="glass-panel px-5 py-3.5 rounded-2xl flex items-center gap-2.5 bg-emerald-950/90 border border-emerald-500/50 shadow-2xl active:scale-95 transition-transform text-white"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold">Proceed to Billing</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        )}

        {/* Mobile Quick Action Buttons Bar */}
        <div className="flex items-center gap-2">
          {/* Catalog Mode */}
          <button
            onClick={() => setIsConvenienceCatalogOpen(true)}
            className="w-12 h-12 rounded-2xl glass-panel bg-purple-950/80 border border-purple-500/30 text-purple-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            title="Catalog Mode"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-12 h-12 rounded-2xl glass-panel bg-slate-900/80 border border-white/15 text-slate-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Shopping Trolley Drawer Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-12 h-12 rounded-2xl glass-panel bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform relative"
            title="Trolley"
          >
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black px-1 flex items-center justify-center shadow-md">
                {cart.reduce((sum, it) => sum + it.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
