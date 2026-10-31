import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  Product,
  CartItem,
  OrderPricing,
  Order,
  ShoppingListItem,
  NavigationTarget,
  CheckoutCounterId,
  CashierInfo,
  SupermarketFloor,
  ElevatorState
} from '../types';
import { soundManager } from '../audio/soundManager';

interface Settings {
  soundEnabled: boolean;
  ambientEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  mouseSensitivity: number;
  headBob: boolean;
  shadows: boolean;
}

export const CASHIERS: Record<CheckoutCounterId, CashierInfo> = {
  1: {
    id: 1,
    name: 'Priya Sharma',
    title: 'Senior Express Cashier',
    laneName: 'COUNTER 01 - EXPRESS (1-10 ITEMS)',
    avatarColor: '#10b981',
    voiceGreeting: 'Welcome to Counter 01! Ready to scan your fresh items.'
  },
  2: {
    id: 2,
    name: 'Rahul Verma',
    title: 'Lead Cashier & Supervisor',
    laneName: 'COUNTER 02 - REGULAR CHECKOUT',
    avatarColor: '#0284c7',
    voiceGreeting: 'Hello there! Welcome to Counter 02. Let me help you ring these up.'
  },
  3: {
    id: 3,
    name: 'Ananya Iyer',
    title: 'Priority & Digital Checkout',
    laneName: 'COUNTER 03 - CARDS & DIGITAL UPI',
    avatarColor: '#8b5cf6',
    voiceGreeting: 'Welcome to Counter 03! Fast digital payments & cards supported.'
  }
};

interface StoreContextType {
  products: Product[];
  isLoading: boolean;
  cart: CartItem[];
  pricing: OrderPricing;
  activeProduct: Product | null;
  setActiveProduct: (p: Product | null) => void;
  inspectingProduct: Product | null;
  setInspectingProduct: (p: Product | null) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  shoppingList: ShoppingListItem[];
  toggleShoppingListItem: (id: string) => void;
  addShoppingListItem: (name: string) => void;
  navigationTarget: NavigationTarget | null;
  setNavigationTarget: (target: NavigationTarget | null) => void;
  clearNavigationTarget: () => void;
  checkoutStage: 'SHOPPING' | 'DOCKING' | 'SCANNING' | 'INVOICE' | 'PAYMENT' | 'COMPLETED';
  setCheckoutStage: (stage: 'SHOPPING' | 'DOCKING' | 'SCANNING' | 'INVOICE' | 'PAYMENT' | 'COMPLETED') => void;
  activeCounter: CheckoutCounterId;
  setActiveCounter: (counterId: CheckoutCounterId) => void;
  currentCashier: CashierInfo;
  cashierDialogue: string;
  setCashierDialogue: (msg: string) => void;
  scannedIndex: number;
  setScannedIndex: (idx: number | ((prev: number) => number)) => void;
  lastOrder: Order | null;
  setLastOrder: (order: Order | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isShoppingListOpen: boolean;
  setIsShoppingListOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isConvenienceCatalogOpen: boolean;
  setIsConvenienceCatalogOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isPaymentOpen: boolean;
  setIsPaymentOpen: (open: boolean) => void;
  isUIActive: boolean;
  unlockCursor: () => void;
  lockCursor: () => void;
  toggleCursor: () => void;
  playerPosition: [number, number, number];
  setPlayerPosition: (pos: [number, number, number] | ((prev: [number, number, number]) => [number, number, number])) => void;
  playerRotation: number;
  setPlayerRotation: (rot: number) => void;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  isPointerLocked: boolean;
  setIsPointerLocked: (locked: boolean) => void;
  isDoorOpen: boolean;
  setIsDoorOpen: (open: boolean) => void;
  pickupFlyItem: { product: Product; quantity: number } | null;
  setPickupFlyItem: (item: { product: Product; quantity: number } | null) => void;
  currentFloor: SupermarketFloor;
  setCurrentFloor: (floor: SupermarketFloor) => void;
  elevatorState: ElevatorState;
  selectElevatorFloor: (floor: SupermarketFloor) => void;
  callElevator: (floor: SupermarketFloor) => void;
  isNearElevator: boolean;
  cartRemovalToast: string | null;
  dismissCartToast: () => void;
  mobileMoveVector: { x: number; y: number };
  setMobileMoveVector: (vec: { x: number; y: number }) => void;
  mobileLookDelta: { x: number; y: number };
  setMobileLookDelta: (delta: { x: number; y: number }) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('suprgo_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);
  const [navigationTarget, setNavigationTarget] = useState<NavigationTarget | null>(null);
  const [checkoutStage, setCheckoutStage] = useState<'SHOPPING' | 'DOCKING' | 'SCANNING' | 'INVOICE' | 'PAYMENT' | 'COMPLETED'>('SHOPPING');
  const [activeCounter, setActiveCounter] = useState<CheckoutCounterId>(1);
  const [cashierDialogue, setCashierDialogue] = useState<string>('');
  const [scannedIndex, setScannedIndex] = useState<number>(0);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);
  const [isDoorOpen, setIsDoorOpen] = useState<boolean>(false);
  const [pickupFlyItem, setPickupFlyItem] = useState<{ product: Product; quantity: number } | null>(null);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isConvenienceCatalogOpen, setIsConvenienceCatalogOpen] = useState<boolean>(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('suprgo_onboarding_seen');
  });

  // Two Floors & 3D Interactive Elevator
  const [currentFloor, setCurrentFloor] = useState<SupermarketFloor>(0);
  const [elevatorState, setElevatorState] = useState<ElevatorState>({
    cabinY: 0.0,
    targetFloor: 0,
    stage: 'IDLE',
    doorProgress: 1.0,
    isPlayerInside: false
  });

  // Instant Cart Removal Toast & Audio Feedback
  const [cartRemovalToast, setCartRemovalToast] = useState<string | null>(null);
  const toastTimer = useRef<any>(null);

  // Mobile Virtual Joystick & Touch Camera state
  const [mobileMoveVector, setMobileMoveVector] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mobileLookDelta, setMobileLookDelta] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Player position & orientation
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 1.65, 16.0]);
  const [playerRotation, setPlayerRotation] = useState<number>(Math.PI);

  const currentCashier = useMemo(() => CASHIERS[activeCounter] || CASHIERS[1], [activeCounter]);

  // Settings
  const [settings, setSettings] = useState<Settings>({
    soundEnabled: true,
    ambientEnabled: true,
    musicEnabled: true,
    musicVolume: 0.35,
    sfxVolume: 0.8,
    ambientVolume: 0.25,
    mouseSensitivity: 1.0,
    headBob: true,
    shadows: true
  });

  // Comprehensive Initial Shopping Checklist
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([
    { id: 'item-1', name: 'Fresh Pure Whole Milk (1L)', category: 'Dairy', targetProductId: 'prod_milk', checked: false },
    { id: 'item-2', name: 'Fuji Red Apples (1kg)', category: 'Fruits', targetProductId: 'prod_apple', checked: false },
    { id: 'item-3', name: 'Levi\'s 511 Slim Fit Jeans', category: 'Fashion', targetProductId: 'fash_mens_jeans_levis', checked: false },
    { id: 'item-4', name: 'Nike Air Force 1 Sneakers', category: 'Footwear', targetProductId: 'fash_shoes_nike_af1', checked: false },
    { id: 'item-5', name: 'India Gate Basmati Rice (5kg)', category: 'Staples', targetProductId: 'prod_rice', checked: false },
    { id: 'item-6', name: 'Zara Wrap Midi Dress', category: 'Fashion', targetProductId: 'fash_womens_dress_wrap', checked: false },
    { id: 'item-7', name: 'Lay\'s Classic Salted Potato Chips', category: 'Snacks', targetProductId: 'prod_chips_lays', checked: false },
    { id: 'item-8', name: 'L\'Oreal Paris Total Repair Shampoo', category: 'Personal Care', targetProductId: 'prod_shampoo', checked: false }
  ]);

  // Fetch product catalog
  useEffect(() => {
    async function fetchProducts() {
      try {
        const API_BASE = 'https://suprgo-api.onrender.com';
        const res = await fetch(`${API_BASE}/api/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.warn('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('suprgo_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Compute live cart pricing
  const pricing: OrderPricing = useMemo(() => {
    let subtotal = 0;
    let originalTotal = 0;

    cart.forEach(item => {
      subtotal += item.product.price * item.quantity;
      originalTotal += item.product.originalPrice * item.quantity;
    });

    const discount = Math.max(0, originalTotal - subtotal);
    const cgst = Math.round(subtotal * 0.09);
    const sgst = Math.round(subtotal * 0.09);
    const total = subtotal + cgst + sgst;

    return {
      subtotal,
      discount,
      cgst,
      sgst,
      total
    };
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    soundManager.playItemPickup();
    setPickupFlyItem({ product, quantity });

    setTimeout(() => {
      soundManager.playItemDrop();
      setPickupFlyItem(null);
    }, 450);

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    setShoppingList(prev =>
      prev.map(item =>
        item.targetProductId === product.id ? { ...item, checked: true } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === productId);
      if (existing) {
        soundManager.playItemRemoved();
        setCartRemovalToast(`Removed "${existing.product.name}" from trolley`);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setCartRemovalToast(null), 2400);
      }
      return prev.filter(item => item.product.id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === productId);
      if (existing) {
        if (quantity < existing.quantity) {
          soundManager.playItemRemoved();
          setCartRemovalToast(`Reduced "${existing.product.name}" quantity to ${quantity}`);
          if (toastTimer.current) clearTimeout(toastTimer.current);
          toastTimer.current = setTimeout(() => setCartRemovalToast(null), 2000);
        } else {
          soundManager.playItemDrop();
        }
      }
      return prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const dismissCartToast = () => {
    setCartRemovalToast(null);
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleShoppingListItem = (id: string) => {
    setShoppingList(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const addShoppingListItem = (name: string) => {
    if (!name.trim()) return;
    setShoppingList(prev => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: name.trim(),
        category: 'Custom',
        checked: false
      }
    ]);
  };

  const clearNavigationTarget = () => {
    setNavigationTarget(null);
  };

  // Elevator Proximity & Player Cabin Detection
  const isNearElevator = useMemo(() => {
    // Entrance is around X = 0, Z = -10.0
    const dist = Math.hypot(playerPosition[0], playerPosition[2] - (-10.0));
    return dist < 3.4;
  }, [playerPosition]);

  // Monitor if player is physically inside elevator cabin
  useEffect(() => {
    const isInside = Math.abs(playerPosition[0]) < 1.45 && playerPosition[2] < -10.2 && playerPosition[2] > -12.9;
    setElevatorState(prev => {
      if (prev.isPlayerInside !== isInside) {
        return { ...prev, isPlayerInside: isInside };
      }
      return prev;
    });
  }, [playerPosition]);

  // Execute Elevator Floor Transition with synchronized physical animation
  const selectElevatorFloor = (targetFloor: SupermarketFloor) => {
    if (elevatorState.stage !== 'IDLE' || elevatorState.targetFloor === targetFloor) return;

    // 1. Close doors smoothly
    setElevatorState(prev => ({ ...prev, stage: 'CLOSING', targetFloor, doorProgress: 0.0 }));
    soundManager.playElevatorDoor();

    // 2. Start vertical transit after doors close
    setTimeout(() => {
      setElevatorState(prev => ({ ...prev, stage: 'MOVING' }));
      soundManager.playElevatorMotor();

      const startY = elevatorState.cabinY;
      const endY = targetFloor === 1 ? 5.6 : 0.0;
      const duration = 3200; // 3.2s vertical glide
      const startTime = performance.now();

      const animateLift = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1.0, elapsed / duration);
        // Smooth cubic ease in-out
        const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const currentY = startY + (endY - startY) * ease;

        setElevatorState(prev => ({ ...prev, cabinY: currentY }));

        // Synchronize player camera & position vertically if inside cabin
        setPlayerPosition(pos => {
          const isInside = Math.abs(pos[0]) < 1.45 && pos[2] < -10.2 && pos[2] > -12.9;
          if (isInside) {
            return [pos[0], currentY + 1.65, pos[2]];
          }
          return pos;
        });

        if (progress < 1.0) {
          requestAnimationFrame(animateLift);
        } else {
          // Arrived at floor!
          soundManager.playElevatorChime();
          soundManager.playElevatorDoor();
          setCurrentFloor(targetFloor);
          setElevatorState(prev => ({
            ...prev,
            cabinY: endY,
            stage: 'OPENING',
            doorProgress: 1.0,
            targetFloor
          }));

          setTimeout(() => {
            setElevatorState(prev => ({ ...prev, stage: 'IDLE' }));
          }, 1000);
        }
      };

      requestAnimationFrame(animateLift);
    }, 1000);
  };

  const callElevator = (targetFloor: SupermarketFloor) => {
    selectElevatorFloor(targetFloor);
  };

  const isUIActive = useMemo(() => {
    return (
      checkoutStage !== 'SHOPPING' ||
      isConvenienceCatalogOpen ||
      isCartOpen ||
      isSearchOpen ||
      isShoppingListOpen ||
      isSettingsOpen ||
      isOnboardingOpen ||
      isPaymentOpen ||
      inspectingProduct !== null
    );
  }, [
    checkoutStage,
    isConvenienceCatalogOpen,
    isCartOpen,
    isSearchOpen,
    isShoppingListOpen,
    isSettingsOpen,
    isOnboardingOpen,
    isPaymentOpen,
    inspectingProduct
  ]);

  // Automated cursor unlock: when paying bill, using catalog, or opening any modal
  useEffect(() => {
    if (isUIActive) {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      setIsPointerLocked(false);
    }
  }, [isUIActive]);

  // Keep state synchronized with native browser pointer lock events
  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsPointerLocked(Boolean(document.pointerLockElement));
    };
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, []);

  const unlockCursor = () => {
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
    setIsPointerLocked(false);
  };

  const lockCursor = () => {
    if (isUIActive) return;
    const canvas = document.querySelector('canvas') || document.querySelector('#suprgo-canvas-container');
    canvas?.requestPointerLock?.();
  };

  const toggleCursor = () => {
    if (isPointerLocked) {
      unlockCursor();
    } else {
      lockCursor();
    }
  };

  // Start soothing background music on user interaction
  useEffect(() => {
    const handleGesture = async () => {
      await soundManager.resumeAudioContext();
      if (settings.musicEnabled && settings.soundEnabled) {
        soundManager.startMusic();
      }
    };
    window.addEventListener('click', handleGesture);
    window.addEventListener('keydown', handleGesture);
    window.addEventListener('pointerdown', handleGesture);
    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('pointerdown', handleGesture);
    };
  }, [settings.musicEnabled, settings.soundEnabled]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.soundEnabled !== undefined) {
        soundManager.setMuted(!newSettings.soundEnabled);
        if (newSettings.soundEnabled && (newSettings.musicEnabled ?? prev.musicEnabled)) {
          soundManager.resumeAudioContext().then(() => soundManager.startMusic());
        } else if (!newSettings.soundEnabled) {
          soundManager.stopMusic();
        }
      }
      if (newSettings.musicEnabled !== undefined) {
        if (newSettings.musicEnabled && (newSettings.soundEnabled ?? prev.soundEnabled)) {
          soundManager.resumeAudioContext().then(() => soundManager.startMusic());
        } else {
          soundManager.stopMusic();
        }
      }
      if (newSettings.musicVolume !== undefined) {
        soundManager.setMusicVolume(newSettings.musicVolume);
      }
      if (newSettings.sfxVolume !== undefined) {
        soundManager.setSfxVolume(newSettings.sfxVolume);
      }
      if (newSettings.ambientVolume !== undefined) {
        soundManager.setAmbientVolume(newSettings.ambientVolume);
      }
      if (newSettings.ambientEnabled !== undefined) {
        if (newSettings.ambientEnabled) {
          soundManager.startAmbient();
        } else {
          soundManager.stopAmbient();
        }
      }
      return updated;
    });
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        isLoading,
        cart,
        pricing,
        activeProduct,
        setActiveProduct,
        inspectingProduct,
        setInspectingProduct,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        shoppingList,
        toggleShoppingListItem,
        addShoppingListItem,
        navigationTarget,
        setNavigationTarget,
        clearNavigationTarget,
        checkoutStage,
        setCheckoutStage,
        activeCounter,
        setActiveCounter,
        currentCashier,
        cashierDialogue,
        setCashierDialogue,
        scannedIndex,
        setScannedIndex,
        lastOrder,
        setLastOrder,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isShoppingListOpen,
        setIsShoppingListOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isConvenienceCatalogOpen,
        setIsConvenienceCatalogOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isPaymentOpen,
        setIsPaymentOpen,
        isUIActive,
        unlockCursor,
        lockCursor,
        toggleCursor,
        playerPosition,
        setPlayerPosition,
        playerRotation,
        setPlayerRotation,
        settings,
        updateSettings,
        isPointerLocked,
        setIsPointerLocked,
        isDoorOpen,
        setIsDoorOpen,
        pickupFlyItem,
        setPickupFlyItem,
        currentFloor,
        setCurrentFloor,
        elevatorState,
        selectElevatorFloor,
        callElevator,
        isNearElevator,
        cartRemovalToast,
        dismissCartToast,
        mobileMoveVector,
        setMobileMoveVector,
        mobileLookDelta,
        setMobileLookDelta
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
