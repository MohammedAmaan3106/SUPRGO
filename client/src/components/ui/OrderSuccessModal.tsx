import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, Download, ShoppingBag, ArrowRight, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';

export const OrderSuccessModal: React.FC = () => {
  const { lastOrder, checkoutStage, setCheckoutStage } = useStore();

  if (checkoutStage !== 'COMPLETED' || !lastOrder) return null;

  const downloadReceipt = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200]
    });

    let y = 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('SUPRGO SUPERMARKET', 40, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Aisle 01, Cyber Retail Mall, Bangalore', 40, y, { align: 'center' });
    y += 4;
    doc.text('GSTIN: 29AAAAA0000A1Z5', 40, y, { align: 'center' });
    y += 5;

    doc.line(5, y, 75, y);
    y += 4;

    doc.setFontSize(7);
    doc.text(`Invoice: ${lastOrder.invoiceNumber}`, 5, y);
    y += 3.5;
    doc.text(`Order ID: ${lastOrder.orderId}`, 5, y);
    y += 3.5;
    doc.text(`Payment ID: ${lastOrder.paymentId}`, 5, y);
    y += 3.5;
    doc.text(`Status: ${lastOrder.status} (${lastOrder.paymentMethod})`, 5, y);
    y += 3.5;
    doc.text(`Date: ${new Date(lastOrder.timestamp).toLocaleString()}`, 5, y);
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
    lastOrder.items.forEach((item) => {
      const name = item.name.length > 20 ? item.name.slice(0, 18) + '..' : item.name;
      doc.text(name, 5, y);
      doc.text(`${item.quantity}`, 43, y);
      doc.text(`${item.price}`, 54, y);
      doc.text(`${item.subtotal}`, 75, y, { align: 'right' });
      y += 4;
    });

    doc.line(5, y, 75, y);
    y += 4;

    doc.text('Subtotal (excl. GST):', 5, y);
    doc.text(`₹${lastOrder.pricing.subtotal}`, 75, y, { align: 'right' });
    y += 3.5;

    if (lastOrder.pricing.discount > 0) {
      doc.text('Discount Savings:', 5, y);
      doc.text(`-₹${lastOrder.pricing.discount}`, 75, y, { align: 'right' });
      y += 3.5;
    }

    doc.text('CGST (9%):', 5, y);
    doc.text(`₹${lastOrder.pricing.cgst}`, 75, y, { align: 'right' });
    y += 3.5;

    doc.text('SGST (9%):', 5, y);
    doc.text(`₹${lastOrder.pricing.sgst}`, 75, y, { align: 'right' });
    y += 4;

    doc.line(5, y, 75, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL PAID:', 5, y);
    doc.text(`₹${lastOrder.pricing.total}`, 75, y, { align: 'right' });
    y += 6;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for shopping at SuprGo!', 40, y, { align: 'center' });

    doc.save(`SuprGo_Invoice_${lastOrder.invoiceNumber}.pdf`);
  };

  const handleStartNewTrip = () => {
    setCheckoutStage('SHOPPING');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="w-full max-w-lg glass-panel rounded-3xl border border-emerald-500/30 shadow-2xl overflow-hidden bg-slate-950/95 flex flex-col p-6 text-center">
        {/* Celebration Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4 border border-emerald-500/40 shadow-lg shadow-emerald-500/30 animate-bounce">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h2 className="text-xl font-black text-white mb-1">Order Confirmed!</h2>
        <p className="text-xs text-slate-300 mb-5">
          Payment successfully verified. Your digital invoice has been generated.
        </p>

        {/* Invoice Summary Box */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 text-left font-mono text-xs space-y-2 mb-6">
          <div className="flex justify-between text-slate-400">
            <span>Invoice No:</span>
            <span className="font-bold text-white">{lastOrder.invoiceNumber}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Order ID:</span>
            <span className="text-white">{lastOrder.orderId}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Payment Method:</span>
            <span className="text-emerald-400">{lastOrder.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Amount Paid:</span>
            <span className="text-cyan-400 font-bold">₹{lastOrder.pricing.total}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={downloadReceipt}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/15 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Download Invoice (PDF)</span>
          </button>

          <button
            onClick={handleStartNewTrip}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};

