import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CreditCard, Smartphone, Building, ShieldCheck, X, CheckCircle2, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../audio/soundManager';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { cart, pricing, clearCart, setCheckoutStage, setLastOrder } = useStore();
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [upiId, setUpiId] = useState<string>('customer@okhdfcbank');
  const [cardNumber, setCardNumber] = useState<string>('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('789');
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');

  if (!isOpen) return null;

  const handleCompletePayment = async (method: string) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Create Order on backend
      const createRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: pricing.total,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`
        })
      });

      const orderData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(orderData.error || 'Failed to initialize payment');
      }

      const paymentId = `pay_${method.toLowerCase()}_${Date.now()}`;

      // Simulate network processing delay for realism
      await new Promise((r) => setTimeout(r, 1200));

      // 2. Verify payment on backend
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderData.id,
          razorpay_payment_id: paymentId,
          razorpay_signature: 'test_signature_valid',
          items: cart.map((it) => ({
            id: it.product.id,
            name: it.product.name,
            price: it.product.price,
            quantity: it.quantity,
            subtotal: it.product.price * it.quantity
          })),
          pricing: pricing,
          customer: {
            name: 'Virtual Shopper',
            email: 'shopper@suprgo.store',
            phone: '+91 98765 43210'
          },
          paymentMethod: `Razorpay Test Mode (${method})`
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }

      // Success!
      soundManager.playSuccessFanfare();

      // Trigger Confetti explosion
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setLastOrder(verifyData.order);
      clearCart();
      setCheckoutStage('COMPLETED');
      onClose();

    } catch (err: any) {
      console.error('Payment error:', err);
      setErrorMessage(err.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="w-full max-w-lg glass-panel rounded-3xl border border-white/20 shadow-2xl overflow-hidden bg-slate-950/95 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Payment Gateway</h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Razorpay Test Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">Total Payable: ₹{pricing.total}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="grid grid-cols-3 p-3 gap-2 border-b border-white/10 bg-slate-900/60">
          <button
            onClick={() => setActiveTab('upi')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upi'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>UPI / QR</span>
          </button>

          <button
            onClick={() => setActiveTab('card')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'card'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Card</span>
          </button>

          <button
            onClick={() => setActiveTab('netbanking')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'netbanking'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Net Banking</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {errorMessage}
            </div>
          )}

          {/* 1. UPI Tab */}
          {activeTab === 'upi' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4 bg-slate-900 rounded-2xl border border-white/10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-white rounded-xl p-2 mb-2 flex items-center justify-center">
                    <QrCode className="w-28 h-28 text-slate-950" />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Scan with Google Pay, PhonePe, Paytm, or BHIM UPI
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Or Enter UPI Virtual Payment Address (VPA)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <button
                disabled={isProcessing}
                onClick={() => handleCompletePayment('UPI')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Authorizing UPI Payment...</span>
                ) : (
                  <span>Approve & Pay ₹{pricing.total}</span>
                )}
              </button>
            </div>
          )}

          {/* 2. Card Tab */}
          {activeTab === 'card' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valid Thru</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Test Mode Sandbox: Pre-filled with valid test card credentials.</span>
              </div>

              <button
                disabled={isProcessing}
                onClick={() => handleCompletePayment('Credit/Debit Card')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <span>Processing Card Transaction...</span> : <span>Pay ₹{pricing.total} with Card</span>}
              </button>
            </div>
          )}

          {/* 3. Net Banking Tab */}
          {activeTab === 'netbanking' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-300">Select Bank</label>
              <div className="grid grid-cols-2 gap-2">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                  <button
                    key={bank}
                    onClick={() => setSelectedBank(bank)}
                    className={`p-3 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer ${
                      selectedBank === bank
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>

              <button
                disabled={isProcessing}
                onClick={() => handleCompletePayment(`NetBanking - ${selectedBank}`)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <span>Connecting to Bank...</span> : <span>Proceed to {selectedBank} (₹{pricing.total})</span>}
              </button>
            </div>
          )}
        </div>

        {/* Footer Security Badges */}
        <div className="p-4 border-t border-white/10 bg-slate-950 flex items-center justify-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span>PCI-DSS Compliant</span>
          <span>•</span>
          <span>Razorpay Verified</span>
        </div>
      </div>
    </div>
  );
};

