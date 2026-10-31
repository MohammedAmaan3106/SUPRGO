import React from 'react';
import { useStore, CASHIERS } from '../../context/StoreContext';
import { ShoppingBag, Eye, ArrowRight, Plus, Minus, Trash2, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { CheckoutCounterId } from '../../types';

const COUNTER_COORDS: Record<CheckoutCounterId, [number, number]> = {
  1: [-5.5, 9.8],
  2: [0.0, 9.8],
  3: [5.5, 9.8]
};

export const CrosshairHUD: React.FC = () => {
  const {
    activeProduct,
    inspectingProduct,
    isPointerLocked,
    checkoutStage,
    setCheckoutStage,
    setActiveCounter,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    playerPosition,
    setInspectingProduct,
    pickupFlyItem,
    isUIActive,
    lockCursor,
    currentFloor,
    elevatorState,
    selectElevatorFloor,
    isNearElevator,
    cartRemovalToast,
    dismissCartToast
  } = useStore();

  // Detect which counter is closest (Ground floor only)
  let nearestCounter: CheckoutCounterId | null = null;
  let minCounterDist = 3.4;

  if (currentFloor === 0) {
    for (const [idStr, [cx, cz]] of Object.entries(COUNTER_COORDS)) {
      const cId = Number(idStr) as CheckoutCounterId;
      const dist = Math.hypot(playerPosition[0] - cx, playerPosition[2] - cz);
      if (dist < minCounterDist) {
        nearestCounter = cId;
        minCounterDist = dist;
      }
    }
  }

  const cashier = nearestCounter ? CASHIERS[nearestCounter] : null;

  // Find if targeted product is currently in cart
  const itemInCart = activeProduct
    ? cart.find((item) => item.product.id === activeProduct.id)
    : null;

  return (
    <>
      {/* Center Reticle Crosshair (only in first-person camera mode) */}
      {isPointerLocked && !isUIActive && (
        <div className="crosshair-reticle pointer-events-none">
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
              activeProduct || (nearestCounter && cart.length > 0) || isNearElevator
                ? 'scale-150 border-cyan-400 bg-cyan-400/30'
                : 'scale-100 border-white/60 bg-white/20'
            }`}
          />
        </div>
      )}

      {/* Instant Item Added Pop Animation */}
      {pickupFlyItem && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-16 z-40 pointer-events-none animate-bounce">
          <div className="glass-panel px-4 py-2 rounded-2xl border border-cyan-400/50 bg-cyan-950/90 text-cyan-300 font-bold text-xs flex items-center gap-2 shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>+{pickupFlyItem.quantity} {pickupFlyItem.product.name} Added to Trolley!</span>
          </div>
        </div>
      )}

      {/* Instant Cart Removal / Reduction Toast */}
      {cartRemovalToast && (
        <div
          onClick={dismissCartToast}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto cursor-pointer animate-slide-down"
        >
          <div className="glass-panel px-4 py-2.5 rounded-2xl border border-red-500/40 bg-slate-950/95 text-red-300 text-xs font-bold flex items-center gap-2.5 shadow-2xl">
            <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
              <Trash2 className="w-3.5 h-3.5" />
            </div>
            <span>{cartRemovalToast}</span>
          </div>
        </div>
      )}

      {/* Sleek bottom hint when cursor is unlocked in 3D shopping mode */}
      {!isPointerLocked && !isUIActive && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-fade-in hidden sm:block">
          <button
            onClick={lockCursor}
            className="glass-panel px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-cyan-500/40 bg-slate-950/90 shadow-2xl hover:scale-105 transition-all cursor-pointer group"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <div className="text-left">
              <span className="text-xs font-bold text-white">
                Mouse Cursor Active • <span className="text-cyan-400">Click 3D Scene</span> or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300 border border-slate-700">Alt</kbd> to look around
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* ========================================================
          ELEVATOR INTERACTION PROMPT & CONTROLS
          ======================================================== */}
      {(isNearElevator || elevatorState.isPlayerInside) && !isUIActive && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-slide-up">
          <div className="glass-panel px-6 py-4 rounded-3xl border border-purple-500/40 bg-slate-950/95 shadow-2xl flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black">
                {currentFloor === 1 ? '1' : 'G'}
              </div>
              <div>
                <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                  {elevatorState.isPlayerInside ? 'Inside 3D Lift Cabin' : '3D Supermarket Elevator'}
                </div>
                <div className="text-sm font-extrabold text-white">
                  {elevatorState.stage === 'MOVING'
                    ? (elevatorState.targetFloor === 1 ? 'Ascending to 1st Floor...' : 'Descending to Ground Floor...')
                    : (elevatorState.isPlayerInside ? 'Select Your Destination Floor' : 'Elevator Ready • Step in or Press [E]')}
                </div>
              </div>
            </div>

            {/* Two Clear Touch/Click Floor Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => selectElevatorFloor(0)}
                disabled={elevatorState.stage === 'MOVING'}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  currentFloor === 0
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10'
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>G | Ground Floor</span>
                {currentFloor === 0 && <Check className="w-3.5 h-3.5 ml-1" />}
              </button>

              <button
                onClick={() => selectElevatorFloor(1)}
                disabled={elevatorState.stage === 'MOVING'}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  currentFloor === 1
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10'
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>1 | 1st Floor (Fashion)</span>
                {currentFloor === 1 && <Check className="w-3.5 h-3.5 ml-1" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SHELF PRODUCT INFO CARD (With Instant Steppers & Easy Removal)
          ======================================================== */}
      {activeProduct && !inspectingProduct && !isUIActive && !(isNearElevator || elevatorState.isPlayerInside) && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-slide-up">
          <div className="glass-panel px-5 py-4 rounded-3xl flex flex-col sm:flex-row items-center gap-4 border border-cyan-500/40 shadow-2xl min-w-[340px] sm:min-w-[500px] bg-slate-950/95">
            <img
              src={activeProduct.image}
              alt={activeProduct.name}
              className="w-16 h-16 object-cover rounded-2xl border border-white/10 shrink-0 bg-slate-800"
            />
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-0.5">
                <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase">
                  {activeProduct.floor === 1 ? '1st Floor Fashion' : `Aisle 0${activeProduct.aisle}`} • {activeProduct.brand}
                </span>
                {activeProduct.discount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {activeProduct.discount}% OFF
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-sm text-white truncate mb-1">
                {activeProduct.name}
              </h3>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-base font-black text-cyan-400">
                  ₹{activeProduct.price}
                </span>
                {activeProduct.originalPrice > activeProduct.price && (
                  <span className="text-xs text-slate-500 line-through">
                    ₹{activeProduct.originalPrice}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 font-medium">
                  / {activeProduct.unit}
                </span>
              </div>
            </div>

            {/* Dynamic Actions: When in trolley vs when not in trolley */}
            <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
              {itemInCart ? (
                /* ALREADY IN TROLLEY: Provide prominent IN TROLLEY badge, Minus, Quantity, Plus, and Remove */
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase">In Trolley</span>
                    <span className="text-xs font-black text-white">{itemInCart.quantity} units (₹{itemInCart.quantity * activeProduct.price})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Instant Decrement [-] Button */}
                    <button
                      onClick={() => updateQuantity(activeProduct.id, itemInCart.quantity - 1)}
                      className="w-9 h-9 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold flex items-center justify-center border border-red-500/30 transition-all cursor-pointer active:scale-90"
                      title="Remove 1 unit"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    {/* Current Quantity */}
                    <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-center min-w-[36px]">
                      <span className="text-sm font-black text-white">{itemInCart.quantity}</span>
                    </div>

                    {/* Instant Increment [+] Button */}
                    <button
                      onClick={() => addToCart(activeProduct, 1)}
                      className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center shadow-md shadow-cyan-500/25 transition-all cursor-pointer active:scale-90"
                      title="Add 1 more unit"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {/* Instant Remove Item Completely */}
                    <button
                      onClick={() => removeFromCart(activeProduct.id)}
                      className="py-2 px-3 rounded-xl bg-white/10 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                      title="Remove entire item from trolley"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* NOT IN TROLLEY YET: Quick multi-pack selection & Add to Trolley */
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                    <button
                      onClick={() => addToCart(activeProduct, 1)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-cyan-500/20 text-white hover:text-cyan-300 font-bold text-xs transition-colors cursor-pointer border border-white/10"
                      title="Add 1 unit"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => addToCart(activeProduct, 2)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-cyan-500/20 text-white hover:text-cyan-300 font-bold text-xs transition-colors cursor-pointer border border-white/10"
                      title="Add 2 units"
                    >
                      +2
                    </button>
                    <button
                      onClick={() => addToCart(activeProduct, 5)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-cyan-500/20 text-white hover:text-cyan-300 font-bold text-xs transition-colors cursor-pointer border border-white/10"
                      title="Add 5 units"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => setInspectingProduct(activeProduct)}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
                      title="Inspect details [F]"
                    >
                      <Eye className="w-4 h-4 text-cyan-400" />
                    </button>
                  </div>

                  <button
                    onClick={() => addToCart(activeProduct, 1)}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Trolley [E]</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Near ANY of the 3 Checkout Counters Prompt */}
      {nearestCounter && cart.length > 0 && checkoutStage === 'SHOPPING' && cashier && !isUIActive && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <button
            onClick={() => {
              setActiveCounter(nearestCounter);
              setCheckoutStage('SCANNING');
            }}
            className="glass-panel px-6 py-4 rounded-3xl flex items-center gap-4 border border-emerald-500/40 bg-emerald-950/80 shadow-2xl hover:bg-emerald-900/80 transition-all cursor-pointer group animate-bounce"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="text-left">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                {cashier.laneName} • Press [E]
              </div>
              <div className="text-sm font-extrabold text-white">
                Dock Trolley & Checkout with {cashier.name} ({cart.length} items)
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-400 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </>
  );
};
