import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_PATH = path.join(DATA_DIR, 'store.json');
const INITIAL_PRODUCTS_PATH = path.join(__dirname, 'products.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const initialData = {
  products: [],
  orders: [],
  carts: {},
  settings: {
    storeName: "SuprGo Virtual Supermarket",
    storeAddress: "Aisle 01, Cyber Retail Mall, Bangalore 560001",
    gstin: "29AAAAA0000A1Z5",
    currency: "INR",
    currencySymbol: "₹",
    taxRate: 0.18
  }
};

function readDb() {
  try {
    let freshProducts = [];
    if (fs.existsSync(INITIAL_PRODUCTS_PATH)) {
      freshProducts = JSON.parse(fs.readFileSync(INITIAL_PRODUCTS_PATH, 'utf-8'));
    }

    if (!fs.existsSync(DB_PATH)) {
      initialData.products = freshProducts;
      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }

    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);

    // Sync if product catalog was updated or has fewer items
    if (!parsed.products || parsed.products.length < freshProducts.length) {
      parsed.products = freshProducts;
      fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    return parsed;
  } catch (err) {
    console.error("Error reading database:", err);
    return initialData;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Error writing database:", err);
    return false;
  }
}

export const db = {
  getProducts: (category, query) => {
    const store = readDb();
    let prods = store.products || [];
    if (category && category !== 'all') {
      prods = prods.filter(p => p.categorySlug === category || p.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (query) {
      const q = query.toLowerCase().trim();
      prods = prods.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return prods;
  },

  getProductById: (id) => {
    const store = readDb();
    return (store.products || []).find(p => p.id === id);
  },

  updateStock: (items) => {
    const store = readDb();
    items.forEach(item => {
      const p = store.products.find(prod => prod.id === item.id);
      if (p && p.stock !== undefined) {
        p.stock = Math.max(0, p.stock - (item.quantity || 1));
      }
    });
    writeDb(store);
  },

  saveOrder: (orderData) => {
    const store = readDb();
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 899 + 100)}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = {
      orderId: orderNumber,
      invoiceNumber: invoiceNumber,
      counter: orderData.counter || "COUNTER 01",
      cashier: orderData.cashier || "Priya",
      timestamp: new Date().toISOString(),
      status: orderData.status || "CONFIRMED",
      paymentMethod: orderData.paymentMethod || "Razorpay / UPI",
      paymentId: orderData.paymentId || `PAY_${Date.now()}`,
      items: orderData.items || [],
      pricing: orderData.pricing || {
        subtotal: 0,
        discount: 0,
        cgst: 0,
        sgst: 0,
        total: 0
      },
      customer: orderData.customer || {
        name: "Virtual Shopper",
        email: "shopper@suprgo.store",
        phone: "+91 98765 43210"
      },
      store: store.settings
    };

    store.orders = store.orders || [];
    store.orders.unshift(newOrder);

    // Update stock levels
    if (newOrder.items.length > 0) {
      newOrder.items.forEach(item => {
        const prod = store.products.find(p => p.id === item.id);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      });
    }

    writeDb(store);
    return newOrder;
  },

  getOrderById: (orderId) => {
    const store = readDb();
    return (store.orders || []).find(o => o.orderId === orderId || o.invoiceNumber === orderId);
  },

  getSettings: () => {
    const store = readDb();
    return store.settings || initialData.settings;
  }
};
