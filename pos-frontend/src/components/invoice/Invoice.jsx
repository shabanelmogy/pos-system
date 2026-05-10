import React, { useRef } from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import { useNavigate } from "react-router-dom";

const Invoice = ({ orderInfo, setShowInvoice }) => {
  const invoiceRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClose = () => {
    dispatch(removeAllItems());
    dispatch(removeCustomer());
    setShowInvoice(false);
    navigate("/tables"); // Navigate back to tables
  };

  const handlePrint = () => {
    const printContent = invoiceRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");

    if (!WinPrint) {
      alert("Please allow popups to print the receipt");
      return;
    }

    WinPrint.document.write(`
      <html>
        <head>
          <title>Order Receipt</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #333; }
            .receipt-header { text-align: center; margin-bottom: 20px; }
            .details { margin-bottom: 15px; font-size: 14px; }
            .item-list { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .item-list th, .item-list td { text-align: left; padding: 5px 0; border-bottom: 1px solid #eee; }
            .totals { text-align: right; font-size: 14px; }
            .grand-total { font-size: 18px; font-weight: bold; margin-top: 10px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <h1>RESTRO</h1>
            <p>Order Receipt</p>
          </div>
          ${printContent}
        </body>
      </html>
    `);

    WinPrint.document.close();
    WinPrint.focus();
    
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 500);
  };

  // Helper to safely format numbers
  const formatNum = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div ref={invoiceRef} className="p-8">
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20"
            >
              <FaCheck className="text-white text-3xl" />
            </motion.div>
          </div>

          <h2 className="text-2xl font-black text-center text-gray-900 mb-1">Order Success</h2>
          <p className="text-gray-500 text-center text-sm mb-8 italic">Receipt Generated Successfully</p>

          <div className="space-y-3 py-6 border-y border-dashed border-gray-200 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID</span>
              <span className="font-bold text-gray-900">#{Math.floor(new Date(orderInfo.orderDate).getTime() / 1000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span className="font-bold text-gray-900">{orderInfo.customerDetails?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone</span>
              <span className="font-bold text-gray-900">{orderInfo.customerDetails?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Guests</span>
              <span className="font-bold text-gray-900">{orderInfo.customerDetails?.guests}</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Items Ordered</h3>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {orderInfo.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 font-medium">
                    {item.name} <span className="text-gray-400 text-xs">x{item.quantity}</span>
                  </span>
                  <span className="font-bold text-gray-900">₹{formatNum(item.price)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>₹{formatNum(orderInfo.bills?.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax (5%)</span>
              <span>₹{formatNum(orderInfo.bills?.tax)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-black text-gray-900 uppercase">Grand Total</span>
              <span className="text-2xl font-black text-green-600">₹{formatNum(orderInfo.bills?.totalWithTax)}</span>
            </div>
          </div>

          <div className="mt-6 p-3 bg-gray-50 rounded-xl text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
            Paid via {orderInfo.paymentMethod}
          </div>
        </div>

        <div className="bg-gray-50 p-6 flex gap-4 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10"
          >
            Print Receipt
          </button>
          <button
            onClick={handleClose}
            className="flex-1 bg-white border border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
