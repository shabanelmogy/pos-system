import React, { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaPrint, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../../../features/pos/store/useCartStore";
import useCustomerStore from "../../../../features/customers/store/useCustomerStore";
import usePOSStore from "../../../../features/pos/store/usePOSStore";
import useUserStore from "../../../../features/auth/store/useUserStore";

interface InvoiceProps {
  orderInfo: any;
  setShowInvoice: (show: boolean) => void;
  isReprint?: boolean;
  directPrint?: boolean;
}

const Invoice: React.FC<InvoiceProps> = ({ orderInfo, setShowInvoice, isReprint = false, directPrint = false }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const removeAllItems = useCartStore((state) => state.removeAllItems);
  const { removeCustomer, setCustomer } = useCustomerStore();
  const { selectedBranch, selectedPOSPoint } = usePOSStore();
  const userRole = useUserStore((state) => state.role);
  const isAdmin = userRole?.toLowerCase() === "admin";
  
  // Settings from DB
  const directPrintSetting = selectedPOSPoint?.settings?.directPrint === true;
  const autoPrintSetting = selectedPOSPoint?.settings?.autoPrintReceipt !== false;

  // Final Logic Flags
  const isAutoPrint = autoPrintSetting && !isReprint;
  const isDirectPrint = directPrint || directPrintSetting;

  const handleClose = useCallback(() => {
    setShowInvoice(false);

    if (!isReprint) {
      const enableTables = selectedPOSPoint?.settings?.enableTables !== false;
      const openOnMenu = selectedPOSPoint?.settings?.openOnMenu === true;

      removeAllItems();

      if (isAdmin) return; // Admins stay put

      if (openOnMenu) {
        setCustomer({ name: "Guest", phone: "N/A", guests: 1 });
        navigate("/menu");
      } else {
        removeCustomer();
        navigate(enableTables ? "/tables" : "/menu");
      }
    }
  }, [isReprint, selectedPOSPoint, removeAllItems, setCustomer, removeCustomer, navigate, setShowInvoice, isAdmin]);

  const handlePrint = useCallback(() => {
    const width = 750;
    const height = 850;
    const left = Math.round((window.screen.width / 2) - (width / 2));
    const top = Math.round((window.screen.height / 2) - (height / 2));

    const printWindow = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,scrollbars=1`);
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>POS Receipt</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;700;900&display=swap');
            @page { size: 80mm auto; margin: 8mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { width: 100%; height: 100%; background: #f0f0f0; }
            body { display: flex; justify-content: center; align-items: flex-start; padding: 24px; font-family: 'Inter', sans-serif; }
            .receipt {
              background: #fff;
              width: 100%;
              max-width: 380px;
              padding: 24px;
              box-shadow: 0 4px 32px rgba(0,0,0,0.12);
              border-radius: 4px;
              color: #000;
              line-height: 1.4;
              font-size: 13px;
            }
            @media print {
              html, body { background: #fff; display: block; padding: 0; }
              .receipt { box-shadow: none; border-radius: 0; max-width: 80mm; padding: 0; }
            }
            .mono { font-family: 'Space Mono', monospace; }
            .header { text-align: center; margin-bottom: 18px; border-bottom: 2px solid #000; padding-bottom: 12px; }
            .header h1 { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
            .header p { font-size: 10px; font-weight: 700; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.1em; color: #555; }
            .badge { display: inline-block; background: #000; color: #fff; font-size: 9px; font-weight: 900; text-transform: uppercase; padding: 3px 10px; border-radius: 999px; margin-top: 8px; letter-spacing: 0.15em; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px dashed #ccc; padding-bottom: 12px; }
            .meta-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #888; margin-bottom: 3px; }
            .meta-value { font-size: 12px; font-weight: 900; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
            th { text-align: left; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #000; padding-bottom: 6px; color: #555; }
            th.col-total { text-align: right; }
            td { padding: 8px 0; font-size: 12px; font-weight: 700; border-bottom: 1px solid #eee; vertical-align: top; }
            .col-qty { text-align: center; width: 32px; }
            .col-total { text-align: right; }
            .summary { border-top: 1px dashed #ccc; padding-top: 12px; margin-bottom: 12px; }
            .summary-row { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 6px; color: #555; }
            .grand-total { margin-top: 12px; padding-top: 12px; border-top: 2px solid #000; display: flex; justify-content: space-between; align-items: center; }
            .grand-total .label { font-size: 14px; font-weight: 900; text-transform: uppercase; }
            .grand-total .value { font-size: 26px; font-weight: 900; font-family: 'Space Mono', monospace; }
            .footer { text-align: center; font-size: 10px; font-weight: 700; margin-top: 20px; padding-top: 14px; border-top: 1px dashed #ccc; color: #777; }
          </style>
        </head>
        <body>
          <div class="receipt">
          <div class="header">
            <h1>RESTRO POS</h1>
            <p>${selectedBranch?.name || 'Restaurant'}</p>
            ${isReprint ? '<span class="badge">Duplicate Copy</span>' : ''}
          </div>
          <div class="meta">
            <div>
              <div class="meta-label">Receipt No.</div>
              <div class="meta-value">#RD-${orderInfo.id?.slice(0, 8).toUpperCase()}</div>
            </div>
            <div style="text-align:right">
              <div class="meta-label">Date</div>
              <div class="meta-value">${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <table>
            <thead><tr><th>Item</th><th class="col-qty">Qty</th><th class="col-total">Total</th></tr></thead>
            <tbody>
              ${orderInfo.items?.map((item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td class="col-qty">${item.quantity}</td>
                  <td class="col-total mono">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="summary">
            <div class="summary-row"><span>Subtotal</span><span>₹${orderInfo.bills?.total}</span></div>
            <div class="summary-row"><span>Tax (5%)</span><span>₹${orderInfo.bills?.tax}</span></div>
            <div class="grand-total">
              <span class="label">Payable</span>
              <span class="value mono">₹${orderInfo.bills?.totalWithTax}</span>
            </div>
          </div>
          <div class="footer">★ Thank you for dining with us ★</div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    if (isDirectPrint) handleClose();
  }, [orderInfo, isReprint, selectedBranch, handleClose, isDirectPrint]);
  // Handle Automatic Trigger
  useEffect(() => {
    if (isAutoPrint && orderInfo) {
      handlePrint();
    }
  }, [isAutoPrint, orderInfo, handlePrint]);

  const formatNum = (val: any) => {
    const num = parseFloat(val);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  /**
   * RENDER LOGIC
   * 1. Direct Print + Auto Print = Minimal "Printing" screen.
   * 2. Otherwise = Full Invoice Modal.
   */
  if (isDirectPrint && isAutoPrint) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100000]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[var(--bg-card)] p-8 rounded-[2rem] border border-[var(--border-main)] flex flex-col items-center gap-5 shadow-[0_30px_100px_rgba(0,0,0,0.5)] max-w-[280px] w-full"
        >
          <div className="w-14 h-14 bg-[var(--primary)] rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-[var(--primary)]/20 text-black">
            <FaPrint size={20} />
          </div>
          <div className="text-center">
            <h3 className="text-[var(--text-main)] text-[10px] font-black uppercase tracking-[0.2em]">Printing Receipt</h3>
            <p className="text-[var(--text-dim)] text-[8px] font-bold uppercase mt-2 opacity-50">Transmitting to terminal...</p>
          </div>
          <button onClick={handleClose} className="mt-2 text-[var(--primary)] text-[8px] font-black uppercase tracking-widest hover:underline">
            Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100000] p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[var(--bg-card)] rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] w-full max-w-sm overflow-hidden relative border border-[var(--border-main)]"
      >
        {/* Header */}
        <div className={`px-6 py-5 flex items-center justify-between ${isReprint ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'} border-b border-[var(--border-main)]/50`}>
           <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isReprint ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
                 <FaCheck size={14} />
              </div>
              <div>
                 <h2 className="text-[10px] font-black uppercase tracking-widest">{isReprint ? 'Reprint Copy' : 'Order Placed'}</h2>
                 <p className="text-[8px] opacity-60 font-black uppercase tracking-[0.2em] mt-0.5">Transaction Success</p>
              </div>
           </div>
           <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors text-[var(--text-dim)]">
              <FaTimes size={14} />
           </button>
        </div>

        {/* Invoice Content */}
        <div className="p-6">
          <div ref={invoiceRef}>
            <div className="flex justify-between items-end mb-6 pb-4 border-b border-[var(--border-main)]/30">
               <div>
                  <h3 className="text-[7px] text-[var(--text-dim)] font-black uppercase tracking-widest mb-1">Receipt ID</h3>
                  <p className="text-[var(--text-main)] font-black text-xs uppercase leading-none">#RD-{orderInfo.id?.slice(0, 8).toUpperCase()}</p>
               </div>
               <div className="text-right">
                  <p className="text-[7px] text-[var(--text-dim)] font-black uppercase tracking-widest mb-1">Terminal</p>
                  <p className="text-[var(--text-main)] font-black text-[9px] uppercase leading-none">{selectedPOSPoint?.name}</p>
               </div>
            </div>

            <div className="space-y-3 mb-6 max-h-40 overflow-y-auto custom-scrollbar pr-2">
               {orderInfo.items?.map((item: any, index: number) => (
                 <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                       <p className="text-[var(--text-main)] font-black text-[10px] uppercase truncate leading-none">{item.name}</p>
                       <p className="text-[7px] text-[var(--text-dim)] font-bold uppercase mt-1">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-[var(--text-main)] font-black text-[10px] ml-4">
                      ₹{formatNum(item.price * item.quantity)}
                    </span>
                 </div>
               ))}
            </div>

            <div className="pt-4 border-t border-dashed border-[var(--border-main)]/50 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-[var(--primary)] uppercase tracking-widest">Total Amount</span>
                <span className="text-2xl font-black text-[var(--primary)] tracking-tighter">₹{formatNum(orderInfo.bills?.totalWithTax)}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-[2] bg-[var(--primary)] text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20 uppercase tracking-widest text-[9px] hover:scale-[1.02] transition-all"
            >
              <FaPrint size={12} /> {isDirectPrint ? 'Direct' : 'Print'}
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-[var(--bg-card-alt)] text-[var(--text-muted)] font-black py-3 rounded-xl hover:text-[var(--text-main)] transition-all uppercase tracking-widest text-[9px] border border-[var(--border-main)]"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Invoice;
