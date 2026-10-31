import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CreditCard, ArrowRight, X, Barcode, Printer, User } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { soundManager } from '../../audio/soundManager';

interface CheckoutModalProps {
  onOpenPayment: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onOpenPayment }) => {
  const {
    checkoutStage,
    setCheckoutStage,
    activeCounter,
    currentCashier,
    cart,
    pricing,
    scannedIndex
  } = useStore();

  const [invoiceNumber] = useState<string>(() => `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);
  const [transactionId] = useState<string>(() => `TXN_${Date.now()}`);

  if (checkoutStage !== 'SCANNING' && checkoutStage !== 'INVOICE') {
    return null;
  }

  const currentDate = new Date().toLocaleString();

  const downloadReceiptPDF = () => {
    soundManager.playCashRegister();
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200]
    });

    let y = 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('SUPRGO SUPERMARKET', 40, y, { align: 'center' });
    y += 4;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('SHOP SMART • LIVE BETTER', 40, y, { align: 'center' });
    y += 4;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Aisle 01, Cyber Retail Mall, Bangalore', 40, y, { align: 'center' });
    y += 4;
    doc.text('GSTIN: 29AAAAA0000A1Z5', 40, y, { align: 'center' });
    y += 5;

    doc.line(5, y, 75, y);
    y += 4;

    doc.setFontSize(7);
    doc.text(`Receipt: ${invoiceNumber}`, 5, y);
    y += 3.5;
    doc.text(`Txn: ${transactionId}`, 5, y);
    y += 3.5;
    doc.text(`Lane: COUNTER 0${activeCounter}`, 5, y);
    y += 3.5;
    doc.text(`Cashier: ${currentCashier.name}`, 5, y);
    y += 3.5;
    doc.text(`Date: ${currentDate}`, 5, y);
    y += 4;

    doc.line(5, y, 75, y);
    y += 4;

    doc.setFont('helvetica', 'bold');
    doc.text('Item', 5, y);
    doc.text('Qty', 42, y);
    doc.text('Price', 54, y);
    doc.text('Total', 75, y, { align: 'right' });
    y += 3;
    doc.line(5, y, 75, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    cart.forEach((item) => {
      const name = item.product.name.length > 20 ? item.product.name.slice(0, 18) + '..' : item.product.name;
      doc.text(name, 5, y);
      doc.text(`${item.quantity}`, 43, y);
      doc.text(`${item.product.price}`, 54, y);
      doc.text(`${item.quantity * item.product.price}`, 75, y, { align: 'right' });
      y += 4;
    });

    doc.line(5, y, 75, y);
    y += 4;

    doc.text('Subtotal (excl. GST):', 5, y);
    doc.text(`₹${pricing.subtotal}`, 75, y, { align: 'right' });
    y += 3.5;

    if (pricing.discount > 0) {
      doc.text('Discount Savings:', 5, y);
      doc.text(`-₹${pricing.discount}`, 75, y, { align: 'right' });
      y += 3.5;
    }

    doc.text('CGST (9%):', 5, y);
    doc.text(`₹${pricing.cgst}`, 75, y, { align: 'right' });
    y += 3.5;

    doc.text('SGST (9%):', 5, y);
    doc.text(`₹${pricing.sgst}`, 75, y, { align: 'right' });
    y += 4;

    doc.line(5, y, 75, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL PAID:', 5, y);
    doc.text(`₹${pricing.total}`, 75, y, { align: 'right' });
    y += 6;

    doc.setFontSize(8);
    doc.text('||| | ||||| || |||||| | |||||', 40, y, { align: 'center' });
    y += 4;
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(`Thank you for shopping at SuprGo with ${currentCashier.name}!`, 40, y, { align: 'center' });

    doc.save(`SuprGo_Receipt_${invoiceNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="w-full max-w-xl glass-panel rounded-3xl border border-white/20 shadow-2xl overflow-hidden bg-slate-950/95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">COUNTER 0{activeCounter}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Cashier: {currentCashier.name}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {checkoutStage === 'SCANNING'
                  ? `Scanning conveyor items (${scannedIndex} / ${cart.length})...`
                  : 'Items scanned & invoice ready'}
              </p>
            </div>
          </div>
          {checkoutStage === 'INVOICE' && (
            <button
              onClick={() => setCheckoutStage('SHOPPING')}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scanning State Progress Animation */}
        {checkoutStage === 'SCANNING' ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-spin border-t-emerald-400" />
              <Barcode className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Conveyor Belt Scanning Active</h3>
            <p className="text-xs text-slate-300 max-w-sm mb-6">
              {currentCashier.name} is scanning each product across the red barcode laser beam.
            </p>

            <div className="w-full max-w-md h-3 rounded-full bg-slate-900 border border-white/10 overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${(scannedIndex / Math.max(1, cart.length)) * 100}%` }}
              />
            </div>
            <div className="text-xs text-emerald-400 font-mono">
              Scanned {scannedIndex} of {cart.length} items
            </div>
          </div>
        ) : (
          /* Itemized Invoice Receipt */
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 font-mono text-xs space-y-3">
              <div className="text-center border-b border-dashed border-white/10 pb-3">
                <img
                  src="/suprgo-logo-transparent.png"
                  alt="SuprGo"
                  className="h-11 w-auto mx-auto object-contain mb-1.5 drop-shadow"
                />
                <div className="font-extrabold text-white text-sm tracking-wide">
                  SUPRGO SUPERMARKET
                </div>
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  Shop Smart • Live Better
                </div>
                <div className="text-[10px] text-slate-400">Cyber Retail Mall, Bangalore 560001</div>
                <div className="text-[10px] text-slate-400">GSTIN: 29AAAAA0000A1Z5</div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Invoice: {invoiceNumber}</span>
                <span>Counter 0{activeCounter} ({currentCashier.name})</span>
              </div>

              <div className="space-y-1.5 border-t border-b border-dashed border-white/10 py-3 font-sans text-xs">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between items-center text-slate-200">
                    <div className="truncate flex-1 pr-2">
                      <span className="font-medium text-white">{product.name}</span>
                      <span className="text-slate-400 text-[11px] ml-1">
                        (₹{product.price} × {quantity})
                      </span>
                    </div>
                    <span className="font-bold text-white shrink-0">₹{product.price * quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal (Net):</span>
                  <span>₹{pricing.subtotal}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount Savings:</span>
                    <span>-₹{pricing.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>CGST (9%):</span>
                  <span>₹{pricing.cgst}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>SGST (9%):</span>
                  <span>₹{pricing.sgst}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-dashed border-white/10">
                  <span>Final Payable Amount:</span>
                  <span className="text-cyan-400">₹{pricing.total}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={downloadReceiptPDF}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/15 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Download PDF Receipt</span>
              </button>

              <button
                onClick={onOpenPayment}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹{pricing.total} with {currentCashier.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
