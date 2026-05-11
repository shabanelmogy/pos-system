import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaPrint, FaTimes, FaStore, FaUser, FaClock } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer, setCustomer } from "../../redux/slices/customerSlice";
import { useNavigate } from "react-router-dom";

const Invoice = ({ orderInfo, setShowInvoice, isReprint = false }) => {
  const invoiceRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedBranch, selectedPOSPoint } = useSelector((state) => state.pos);

  const handleClose = () => {
    setShowInvoice(false);

    if (!isReprint) {
      const enableTables = selectedPOSPoint?.settings?.enableTables !== false;
      const openOnMenu = selectedPOSPoint?.settings?.openOnMenu === true;

      dispatch(removeAllItems());

      if (openOnMenu) {
        // Stay on menu flow — reset customer to Guest for next order
        dispatch(setCustomer({ name: "Guest", phone: "N/A", guests: 1 }));
        navigate("/menu");
      } else {
        dispatch(removeCustomer());
        navigate(enableTables ? "/tables" : "/menu");
      }
    }
  };

  const handlePrint = () => {
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
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 40px; 
              color: #000; 
              max-width: 400px; 
              margin: 0 auto; 
              background: #fff;
              line-height: 1.4;
            }
            .mono { font-family: 'Space+Mono', monospace; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #000; padding-bottom: 20px; }
            .header h1 { font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
            .header p { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; }
            .meta { display: flex; justify-content: space-between; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 25px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { text-align: left; font-size: 10px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 8px; }
            td { padding: 10px 0; font-size: 12px; font-weight: 700; border-bottom: 1px solid #eee; }
            .col-qty { text-align: center; width: 40px; }
            .col-total { text-align: right; }
            .summary-row { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 6px; }
            .grand-total { margin-top: 15px; padding-top: 15px; border-top: 3px solid #000; display: flex; justify-content: space-between; align-items: center; }
            .grand-total .label { font-size: 16px; font-weight: 900; text-transform: uppercase; }
            .grand-total .value { font-size: 22px; font-weight: 900; }
            .footer { text-align: center; font-size: 9px; font-weight: 700; text-transform: uppercase; color: #000; margin-top: 40px; }
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

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      handleClose();
    }, 600);
  };

  const formatNum = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[2000] p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden relative border border-white/20"
      >
        {/* Compact Success Header */}
        <div className={`p-6 flex items-center justify-between text-white ${isReprint ? 'bg-amber-500' : 'bg-emerald-500'}`}>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                 <FaCheck size={18} />
              </div>
              <div>
                 <h2 className="text-sm font-black uppercase tracking-tighter">{isReprint ? 'Reprint Mode' : 'Confirmed'}</h2>
                 <p className="text-[8px] text-white/70 font-black uppercase tracking-widest">{isReprint ? 'Duplicate Invoice' : 'Order Success'}</p>
              </div>
           </div>
           <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center hover:bg-black/10 rounded-lg transition-colors">
              <FaTimes size={14} />
           </button>
        </div>

        {/* Invoice Body */}
        <div className="p-8">
          <div ref={invoiceRef}>
            <div className="flex justify-between items-end mb-6 pb-4 border-b border-gray-50">
               <div>
                  <h3 className="text-[8px] text-gray-300 font-black uppercase tracking-widest mb-1">Receipt ID</h3>
                  <p className="text-gray-900 font-black text-sm uppercase">#RD-{orderInfo.id?.slice(0, 8).toUpperCase()}</p>
               </div>
               <div className="text-right">
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Terminal</p>
                  <p className="text-gray-900 font-black text-[10px] uppercase">{selectedPOSPoint?.name || "Register"}</p>
               </div>
            </div>

            {/* Table Headers */}
            <div className="flex items-center text-[8px] font-black uppercase tracking-[0.2em] text-amber-500 border-b border-amber-500/10 pb-2 mb-4">
               <span className="flex-1">Item Description</span>
               <span className="w-12 text-center">Qty</span>
               <span className="w-16 text-right">Total</span>
            </div>

            {/* Item Rows */}
            <div className="space-y-4 mb-8 max-h-48 overflow-y-auto custom-scrollbar pr-2">
               {orderInfo.items?.map((item, index) => (
                 <div key={index} className="flex items-center">
                   <span className="flex-1 text-gray-800 font-black text-xs uppercase truncate pr-2">
                     {item.name}
                   </span>
                   <span className="w-12 text-center text-gray-400 font-black text-[10px]">
                     {item.quantity}
                   </span>
                   <span className="w-16 text-right text-gray-900 font-black text-xs">
                     ₹{formatNum(item.price * item.quantity)}
                   </span>
                 </div>
               ))}
            </div>

            <div className="mt-auto pt-6 border-t-2 border-dashed border-gray-100 space-y-2">
              <div className="flex justify-between text-gray-400 text-[8px] font-black uppercase tracking-widest">
                <span>Core Subtotal</span>
                <span className="text-gray-900 font-bold">₹{formatNum(orderInfo.bills?.total)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-[8px] font-black uppercase tracking-widest">
                <span>Sales Tax (5%)</span>
                <span className="text-gray-900 font-bold">₹{formatNum(orderInfo.bills?.tax)}</span>
              </div>
              <div className="flex justify-between items-center pt-5">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Payable</span>
                <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{formatNum(orderInfo.bills?.totalWithTax)}</span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-8 flex gap-3 no-print">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrint}
              className="flex-[2] bg-gray-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-gray-900/10 uppercase tracking-[0.2em] text-[10px]"
            >
              <FaPrint /> {isReprint ? 'Reprint Copy' : 'Print Receipt'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              className="flex-1 bg-white border border-gray-200 text-gray-400 font-black py-5 rounded-2xl hover:text-red-500 transition-colors uppercase tracking-[0.2em] text-[10px]"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Invoice;
