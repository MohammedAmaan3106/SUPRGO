import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Razorpay if keys are available
let razorpayInstance = null;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_SuprGoDemoKey';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'suprgo_secret_demo_123';

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('✅ Razorpay initialized with provided credentials');
  } catch (err) {
    console.warn('⚠️ Razorpay initialization warning:', err.message);
  }
}

// Routes

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'SuprGo Virtual Supermarket API',
    time: new Date().toISOString(),
    razorpayConfigured: !!process.env.RAZORPAY_KEY_ID
  });
});

// 2. Categories
app.get('/api/categories', (req, res) => {
  const categories = [
    { id: 'all', name: 'All Departments', icon: 'Store', aisle: 0 },
    { id: 'produce', name: 'Fruits & Vegetables', icon: 'Apple', aisle: 1, color: '#16a34a' },
    { id: 'dairy', name: 'Dairy & Refrigerated', icon: 'Milk', aisle: 2, color: '#2563eb' },
    { id: 'beverages', name: 'Beverages & Drinks', icon: 'GlassWater', aisle: 2, color: '#0ea5e9' },
    { id: 'groceries', name: 'Groceries & Staples', icon: 'Wheat', aisle: 3, color: '#b45309' },
    { id: 'snacks', name: 'Snacks & Packaged', icon: 'Cookie', aisle: 4, color: '#ea580c' },
    { id: 'care', name: 'Personal & Household', icon: 'Sparkles', aisle: 5, color: '#9333ea' },
    { id: 'baby', name: 'Baby Care', icon: 'Baby', aisle: 5, color: '#06b6d4' },
    { id: 'stationery', name: 'Stationery & Essentials', icon: 'BookOpen', aisle: 5, color: '#4f46e5' }
  ];
  res.json(categories);
});

// 3. Products
app.get('/api/products', (req, res) => {
  const { category, q } = req.query;
  const products = db.getProducts(category, q);
  res.json({
    count: products.length,
    products
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// 4. Create Payment Order (Razorpay)
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const amountInPaise = Math.round(amount * 100);

    // If real Razorpay instance is ready with valid keys
    if (razorpayInstance && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET !== 'suprgo_secret_demo_123') {
      const options = {
        amount: amountInPaise,
        currency,
        receipt: receipt || `rec_${Date.now()}`,
        notes: {
          store: 'SuprGo Virtual Supermarket',
          channel: '3D Web Experience'
        }
      };

      const order = await razorpayInstance.orders.create(options);
      return res.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: RAZORPAY_KEY_ID,
        isTestMode: false
      });
    }

    // Test mode fallback order
    const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return res.json({
      id: mockOrderId,
      amount: amountInPaise,
      currency,
      key: RAZORPAY_KEY_ID,
      isTestMode: true,
      message: 'Razorpay Test Mode Order Generated'
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ error: 'Failed to create payment order', details: error.message });
  }
});

// 5. Verify Payment
app.post('/api/payment/verify', (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      items,
      pricing,
      customer,
      paymentMethod = 'Razorpay'
    } = req.body;

    let isValid = false;

    // Check if live signature verification applies
    if (process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET !== 'suprgo_secret_demo_123' && razorpay_signature) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature === razorpay_signature) {
        isValid = true;
      }
    } else {
      // In test mode / sandbox
      if (razorpay_payment_id || razorpay_order_id) {
        isValid = true;
      }
    }

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature or verification failed' });
    }

    // Save order to DB
    const savedOrder = db.saveOrder({
      status: 'PAID',
      paymentMethod: paymentMethod,
      paymentId: razorpay_payment_id || `PAY_TEST_${Date.now()}`,
      items: items || [],
      pricing: pricing,
      customer: customer
    });

    return res.json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      order: savedOrder
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, error: 'Verification failed', details: error.message });
  }
});

// 6. Direct Order checkout (e.g. cash on counter / UPI scan)
app.post('/api/orders', (req, res) => {
  try {
    const { items, pricing, customer, paymentMethod } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    const order = db.saveOrder({
      status: 'PAID',
      paymentMethod: paymentMethod || 'Counter Payment',
      paymentId: `OFFLINE_${Date.now()}`,
      items,
      pricing,
      customer
    });

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// 7. Get Order Details
app.get('/api/orders/:id', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Start server
app.listen(PORT, () => {
  console.log(`🛒 SuprGo Supermarket Server running on http://localhost:${PORT}`);
});

