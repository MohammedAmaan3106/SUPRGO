export interface Product {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  floor?: 0 | 1;
  aisle: number;
  rack: string;
  shelfNum: number;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  stock: number;
  rating: number;
  reviewsCount: number;
  description: string;
  nutrition: string;
  unit: string;
  barcode: string;
  modelType: string;
  color: string;
  shelfPosition: [number, number, number];
  image: string;
}

export type SupermarketFloor = 0 | 1;

export interface ElevatorState {
  cabinY: number; // 0.0 (ground) to 5.6 (first floor)
  targetFloor: SupermarketFloor;
  stage: 'IDLE' | 'CLOSING' | 'MOVING' | 'OPENING';
  doorProgress: number; // 0 (closed) to 1 (open)
  isPlayerInside: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderPricing {
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  total: number;
}

export interface Order {
  orderId: string;
  invoiceNumber: string;
  counter?: string;
  cashier?: string;
  timestamp: string;
  status: string;
  paymentMethod: string;
  paymentId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  pricing: OrderPricing;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  store: {
    storeName: string;
    storeAddress: string;
    gstin: string;
    currency: string;
    currencySymbol: string;
  };
}

export interface ShoppingListItem {
  id: string;
  name: string;
  category: string;
  targetProductId?: string;
  checked: boolean;
}

export interface NavigationTarget {
  name: string;
  position: [number, number, number];
  aisle: number;
}

export type CheckoutCounterId = 1 | 2 | 3;

export interface CashierInfo {
  id: CheckoutCounterId;
  name: string;
  title: string;
  laneName: string;
  avatarColor: string;
  voiceGreeting: string;
}
