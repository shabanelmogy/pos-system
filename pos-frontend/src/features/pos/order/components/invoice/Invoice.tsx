import React, { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaPrint, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useCartStore from "@/features/pos/terminal/store/useCartStore";
import useCustomerStore from "@/features/crm/customer/store/useCustomerStore";
import usePOSStore from "@/features/pos/terminal/store/usePOSStore";
import useUserStore from "@/features/system/auth/store/useUserStore";
import useLocalize from "@/shared/hooks/useLocalize";

interface InvoiceProps {
  orderInfo: any;
  setShowInvoice: (show: boolean) => void;
  isReprint?: boolean;
  directPrint?: boolean;
}

const Invoice: React.FC<InvoiceProps> = ({ orderInfo, setShowInvoice, isReprint = false, directPrint = false }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const clearCart = useCartStore((state) => state.clearCart);
  const { removeCustomer, setCustomer } = useCustomerStore();
  const { selectedBranch, selectedPOSPoint } = usePOSStore();
  const userRole = useUserStore((state) => state.role);
  const isAdmin = userRole?.toLowerCase() === "admin";
  const { localize } = useLocalize();
  
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

      clearCart();

      if (isAdmin) return; // Admins stay put

      if (openOnMenu) {
        setCustomer({ name: "Guest", phone: "N/A", guests: 1 });
        navigate("/menu");
      } else {
        removeCustomer();
        navigate(enableTables ? "/tables" : "/menu");
      }
    }
  }, [isReprint, selectedPOSPoint, clearCart, setCustomer, removeCustomer, navigate, setShowInvoice, isAdmin]);

  const handlePrint = useCallback(() => {
    const width = Math.round(window.screen.availWidth * 0.9);
    const height = Math.round(window.screen.availHeight * 0.9);
    const left = Math.round((window.screen.availWidth - width) / 2);
    const top = Math.round((window.screen.availHeight - height) / 2);

    const printWindow = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,scrollbars=1,resizable=1`);
    if (!printWindow) return;

    // Use orderItems from the backend response
    const items = orderInfo.orderItems || orderInfo.items || [];

    printWindow.document.write(`
      <html>
        <head>
          <title>POS Receipt</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;700;900&display=swap');
            @page { size: 80mm auto; margin: 8mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background: #fff; color: #000; line-height: 1.4; font-size: 12px; }
            .receipt { width: 100%; max-width: 80mm; padding: 5mm; }
            .mono { font-family: 'Space Mono', monospace; }
            .header { text-align: center; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px; }
            .header h1 { font-size: 18px; font-weight: 900; }
            .header p { font-size: 9px; font-weight: 700; text-transform: uppercase; margin-top: 2px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #ccc; padding-bottom: 8px; }
            .meta-label { font-size: 8px; font-weight: 700; color: #666; }
            .meta-value { font-size: 10px; font-weight: 900; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            th { text-align: left; font-size: 8px; font-weight: 900; border-bottom: 1px solid #000; padding-bottom: 4px; }
            td { padding: 6px 0; font-size: 10px; font-weight: 700; border-bottom: 1px solid #eee; vertical-align: top; }
            .modifier { font-size: 8px; color: #555; padding-left: 8px; display: block; font-weight: 400; }
            .col-qty { text-align: center; width: 30px; }
            .col-total { text-align: right; }
            .summary { border-top: 1px dashed #ccc; padding-top: 8px; }
            .summary-row { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; margin-bottom: 4px; }
            .grand-total { margin-top: 8px; padding-top: 8px; border-top: 2px solid #000; display: flex; justify-content: space-between; align-items: center; }
            .grand-total .label { font-size: 12px; font-weight: 900; text-transform: uppercase; }
            .grand-total .value { font-size: 20px; font-weight: 900; font-family: 'Space Mono', monospace; }
            .footer { text-align: center; font-size: 9px; font-weight: 700; margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>RESTRO POS</h1>
              <p>${selectedBranch?.name || 'Restaurant'}</p>
              ${isReprint ? '<div style="background:#000;color:#fff;font-size:8px;padding:2px;margin-top:5px">DUPLICATE COPY</div>' : ''}
            </div>
            <div class="meta">
              <div>
                <div class="meta-label">Order #</div>
                <div class="meta-value">${orderInfo.orderNumber || orderInfo.id?.slice(0, 8).toUpperCase()}</div>
              </div>
              <div style="text-align:right">
                <div class="meta-label">Date</div>
                <div class="meta-value">${new Date(orderInfo.createdAt).toLocaleString()}</div>
              </div>
            </div>
            <table>
              <thead><tr><th>Item</th><th class="col-qty">Qty</th><th class="col-total">Total</th></tr></thead>
              <tbody>
                ${items.map((item: any) => `
                  <tr>
                    <td>
                      ${localize(item.nameSnapshot) || localize(item.name)}
                      ${(item.modifiers || []).map((m: any) => `<span class="modifier">+ ${localize(m.name)}</span>`).join('')}
                    </td>
                    <td class="col-qty">${item.quantity}</td>
                    <td class="col-total mono">₹${parseFloat(item.subtotal || (item.unitPrice * item.quantity)).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="summary">
              <div class="summary-row"><span>Subtotal</span><span>₹${parseFloat(orderInfo.subtotal || 0).toFixed(2)}</span></div>
              <div class="summary-row"><span>Tax</span><span>₹${parseFloat(orderInfo.taxTotal || 0).toFixed(2)}</span></div>
              <div class="grand-total">
                <span class="label">Payable</span>
                <span class="value mono">₹${parseFloat(orderInfo.grandTotal || 0).toFixed(2)}</span>
              </div>
            </div>
            <div class="footer">★ Thank you for dining with us ★</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    if (isDirectPrint) handleClose();
  }, [orderInfo, isReprint, selectedBranch, handleClose, isDirectPrint]);

  useEffect(() => {
    if (isAutoPrint && orderInfo) {
      handlePrint();
    }
  }, [isAutoPrint, orderInfo, handlePrint]);

  const formatNum = (val: any) => {
    const num = parseFloat(val);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  if (isDirectPrint && isAutoPrint) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100000]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[var(--bg-card)] p-8 rounded-[2rem] border border-[var(--border-main)] flex flex-col items-center gap-5 shadow-2xl max-w-[280px] w-full">
          <div className="w-14 h-14 bg-[var(--primary)] rounded-2xl flex items-center justify-center animate-pulse text-black"><FaPrint size={20} /></div>
          <h3 className="text-[var(--text-main)] text-[10px] font-black uppercase tracking-widest text-center">Printing Receipt</h3>
          <button onClick={handleClose} className="text-[var(--primary)] text-[8px] font-black uppercase tracking-widest">Cancel</button>
        </motion.div>
      </div>
    );
  }

  const items = orderInfo.orderItems || orderInfo.items || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100000] p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[var(--bg-card)] rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden relative border border-[var(--border-main)]">
        <div className={`px-6 py-5 flex items-center justify-between ${isReprint ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'} border-b border-[var(--border-main)]/50`}>
           <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isReprint ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}><FaCheck size={14} /></div>
              <div>
                 <h2 className="text-[10px] font-black uppercase tracking-widest">{isReprint ? 'Reprint Copy' : 'Order Placed'}</h2>
                 <p className="text-[8px] opacity-60 font-black uppercase mt-0.5 tracking-widest">Transaction Success</p>
              </div>
           </div>
           <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg text-[var(--text-dim)]"><FaTimes size={14} /></button>
        </div>

        <div className="p-6">
          <div ref={invoiceRef}>
            <div className="flex justify-between items-end mb-6 pb-4 border-b border-[var(--border-main)]/30">
               <div>
                  <h3 className="text-[7px] text-[var(--text-dim)] font-black uppercase mb-1">Order #</h3>
                  <p className="text-[var(--text-main)] font-black text-xs uppercase">{orderInfo.orderNumber || orderInfo.id?.slice(0, 8).toUpperCase()}</p>
               </div>
               <div className="text-right">
                  <p className="text-[7px] text-[var(--text-dim)] font-black uppercase mb-1">Terminal</p>
                  <p className="text-[var(--text-main)] font-black text-[9px] uppercase">{selectedPOSPoint?.name}</p>
               </div>
            </div>

            <div className="space-y-4 mb-6 max-h-48 overflow-y-auto custom-scrollbar pr-2">
               {items.map((item: any, index: number) => (
                 <div key={index} className="flex flex-col">
                    <div className="flex items-center justify-between">
                       <p className="text-[var(--text-main)] font-black text-[10px] uppercase truncate flex-1">{localize(item.nameSnapshot) || localize(item.name)}</p>
                       <span className="text-[var(--text-main)] font-black text-[10px] ml-4">₹{formatNum(item.subtotal || (item.unitPrice * item.quantity))}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[7px] text-[var(--text-dim)] font-bold uppercase">Qty: {item.quantity} @ ₹{formatNum(item.unitPrice || item.price)}</p>
                    </div>
                    {/* Modifiers List */}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.modifiers.map((m: any, idx: number) => (
                          <p key={idx} className="text-[7px] text-[var(--primary)] font-black uppercase ps-2">+ {localize(m.name)}</p>
                        ))}
                      </div>
                    )}
                 </div>
               ))}
            </div>

            <div className="pt-4 border-t border-dashed border-[var(--border-main)]/50 space-y-2">
              <div className="flex justify-between items-center text-[var(--text-dim)] text-[9px] font-bold uppercase">
                <span>Subtotal</span>
                <span>₹{formatNum(orderInfo.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-[var(--text-dim)] text-[9px] font-bold uppercase">
                <span>Tax</span>
                <span>₹{formatNum(orderInfo.taxTotal)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">Total Payable</span>
                <span className="text-2xl font-black text-[var(--primary)] tracking-tighter">₹{formatNum(orderInfo.grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-2">
            <button onClick={handlePrint} className="flex-[2] bg-[var(--primary)] text-black font-black py-3.5 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest text-[9px]">
              <FaPrint size={12} /> {isDirectPrint ? 'Direct' : 'Print'}
            </button>
            <button onClick={handleClose} className="flex-1 bg-[var(--bg-card-alt)] text-[var(--text-muted)] font-black py-3.5 rounded-xl uppercase tracking-widest text-[9px] border border-[var(--border-main)]">Close</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Invoice;
