import React, { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaPrint, FaTimes, FaStore, FaUser, FaClock } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer, setCustomer } from "../../redux/slices/customerSlice";
import { useNavigate } from "react-router-dom";

const Invoice = ({ orderInfo, setShowInvoice, isReprint = false, directPrint = false }) => {
  const invoiceRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { selectedBranch, selectedPOSPoint } = useSelector((state) => state.pos);
  const user = useSelector((state) => state.user);
  const isAdmin = user?.role?.toLowerCase() === "admin";
  
  // Settings from DB/Redux
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

      dispatch(removeAllItems());

      if (isAdmin) return; // Admins stay put

      if (openOnMenu) {
        dispatch(setCustomer({ name: "Guest", phone: "N/A", guests: 1 }));
        navigate("/menu");
      } else {
        dispatch(removeCustomer());
        navigate(enableTables ? "/tables" : "/menu");
      }
    }
  }, [isReprint, selectedPOSPoint, dispatch, navigate, setShowInvoice, isAdmin]);

  const handlePrint = useCallback(() => {
    console.log("[INVOICE] Printing logic started...");
    
    let iframe = document.getElementById("print-iframe");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "print-iframe";
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>POS Receipt</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;700;900&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #000; max-width: 300px; margin: 0 auto; background: #fff; line-height: 1.2; }
            .mono { font-family: 'Space+Mono', monospace; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .header h1 { font-size: 18px; font-weight: 900; }
            .header p { font-size: 8px; font-weight: 700; text-transform: uppercase; margin-top: 2px; }
            .meta { display: flex; justify-content: space-between; font-size: 9px; font-weight: 800; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th { text-align: left; font-size: 9px; font-weight: 900; border-bottom: 1px solid #000; padding-bottom: 4px; }
            td { padding: 6px 0; font-size: 10px; font-weight: 700; border-bottom: 1px solid #eee; }
            .col-qty { text-align: center; width: 30px; }
            .col-total { text-align: right; }
            .summary-row { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; margin-bottom: 4px; }
            .grand-total { margin-top: 10px; padding-top: 10px; border-top: 2px solid #000; display: flex; justify-content: space-between; align-items: center; }
            .grand-total .label { font-size: 14px; font-weight: 900; }
            .grand-total .value { font-size: 18px; font-weight: 900; }
            .footer { text-align: center; font-size: 8px; font-weight: 700; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RESTRO POS</h1>
            <p>${isReprint ? 'DUPLICATE RECEIPT' : 'Official Transaction Receipt'}</p>
          </div>
          <div class="meta">
             <span>#RD-${orderInfo.id?.slice(0, 8).toUpperCase()}</span>
             <span>${new Date().toLocaleDateString()}</span>
          </div>
          <table>
            <thead><tr><th>Item</th><th class="col-qty">Qty</th><th class="col-total">Total</th></tr></thead>
            <tbody>
              ${orderInfo.items?.map(item => `
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
          <div class="footer">Thank you for dining with us</div>
        </body>
      </html>
    `);
    doc.close();

    // Give time for styles to load in iframe
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      
      // If we are in Direct Print mode, we don't need to stay on this screen
      if (isDirectPrint) {
        handleClose();
      }
    }, 500);
  }, [orderInfo, isReprint, handleClose, isDirectPrint]);

  // Handle Automatic Trigger
  useEffect(() => {
    if (isAutoPrint && orderInfo) {
      handlePrint();
    }
  }, [isAutoPrint, orderInfo, handlePrint]);

  const formatNum = (val) => {
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[2000]">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-card)] p-10 rounded-[2.5rem] border border-[var(--border-main)] flex flex-col items-center gap-6 shadow-2xl"
        >
          <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-[var(--primary)]/20">
            <FaPrint className="text-[var(--bg-card)]" size={24} />
          </div>
          <div className="text-center">
            <h3 className="text-white text-sm font-black uppercase tracking-[0.2em]">Processing Receipt</h3>
            <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase mt-2 opacity-50">Direct print in progress...</p>
          </div>
          <button onClick={handleClose} className="mt-4 text-[var(--primary)] text-[10px] font-black uppercase tracking-widest hover:underline">
            Cancel & Close
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[2000] p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden relative border border-white/20"
      >
        {/* Header */}
        <div className={`px-8 py-6 flex items-center justify-between text-white ${isReprint ? 'bg-amber-500' : 'bg-emerald-500'}`}>
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                 <FaCheck size={18} />
              </div>
              <div>
                 <h2 className="text-xs font-black uppercase tracking-widest">{isReprint ? 'Reprint Copy' : 'Order Placed'}</h2>
                 <p className="text-[9px] text-white/60 font-black uppercase tracking-widest mt-0.5">Success Confirmation</p>
              </div>
           </div>
           <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center hover:bg-black/10 rounded-lg transition-colors">
              <FaTimes size={16} />
           </button>
        </div>

        {/* Invoice Content */}
        <div className="p-10">
          <div ref={invoiceRef}>
            <div className="flex justify-between items-end mb-8 pb-6 border-b border-gray-100">
               <div>
                  <h3 className="text-[8px] text-gray-300 font-black uppercase tracking-widest mb-1">Receipt Number</h3>
                  <p className="text-gray-900 font-black text-sm uppercase leading-none">#RD-{orderInfo.id?.slice(0, 8).toUpperCase()}</p>
               </div>
               <div className="text-right">
                  <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest mb-1">Terminal</p>
                  <p className="text-gray-900 font-black text-[10px] uppercase leading-none">{selectedPOSPoint?.name}</p>
               </div>
            </div>

            <div className="space-y-4 mb-8 max-h-48 overflow-y-auto custom-scrollbar pr-4">
               {orderInfo.items?.map((item, index) => (
                 <div key={index} className="flex items-center">
                   <div className="flex-1">
                      <p className="text-gray-900 font-black text-xs uppercase truncate leading-none">{item.name}</p>
                      <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Qty: {item.quantity}</p>
                   </div>
                   <span className="text-gray-900 font-black text-xs">
                     ₹{formatNum(item.price * item.quantity)}
                   </span>
                 </div>
               ))}
            </div>

            <div className="pt-6 border-t-2 border-dashed border-gray-100 space-y-2">
              <div className="flex justify-between items-center pt-4">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Total Payable</span>
                <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{formatNum(orderInfo.bills?.totalWithTax)}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-10 flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-[2] bg-gray-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-gray-900/20 uppercase tracking-widest text-[10px] hover:bg-black transition-colors"
            >
              <FaPrint /> {isDirectPrint ? 'Direct Print' : 'Print Receipt'}
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-50 text-gray-400 font-black py-5 rounded-2xl hover:text-gray-900 transition-colors uppercase tracking-widest text-[10px]"
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
