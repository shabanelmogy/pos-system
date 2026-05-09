import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaUser, FaShoppingCart, FaCreditCard, FaEdit } from "react-icons/fa";
import { getAvatarName, getBgColor } from "../../utils";

const OrderSummaryModal = ({ isOpen, onClose, order, onUpdate }) => {
  if (!order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#1a1a1a] w-full max-w-md rounded-2xl border border-[#333] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#333] flex justify-between items-center bg-[#222]">
              <div className="flex items-center gap-3">
                 <div 
                   className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner"
                   style={{ backgroundColor: getBgColor() }}
                 >
                   {getAvatarName(order?.customerDetails?.name)}
                 </div>
                 <div>
                   <h2 className="text-[#f5f5f5] text-lg font-bold">{order?.customerDetails?.name}</h2>
                   <p className="text-[#ababab] text-[10px] uppercase font-bold tracking-widest">Order Summary</p>
                 </div>
              </div>
              <button onClick={onClose} className="text-[#ababab] hover:text-white transition-colors">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-[400px] overflow-y-auto scrollbar-hide">
              {/* Order Status Badge */}
              <div className="mb-4 flex items-center justify-between bg-[#262626] p-3 rounded-xl border border-[#333]">
                <div className="flex items-center gap-2">
                   <FaUser className="text-[#f6b100] text-xs" />
                   <span className="text-[#ababab] text-xs">Table {order?.table?.tableNo} • {order?.customerDetails?.guests} Guests</span>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                  order?.orderStatus === "Ready" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
                }`}>
                  {order?.orderStatus}
                </span>
              </div>

              {/* Items List */}
              <h3 className="text-[#f5f5f5] text-sm font-bold mb-3 flex items-center gap-2">
                 <FaShoppingCart size={14} className="text-[#f6b100]" />
                 Items Ordered
              </h3>
              <div className="space-y-3">
                {order?.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-[#222] rounded-lg">
                    <div className="flex items-center gap-3">
                       <span className="text-[#f6b100] font-black text-xs">x{item.quantity}</span>
                       <span className="text-[#f5f5f5] text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-[#ababab] text-sm font-bold">₹{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer / Total */}
            <div className="px-6 py-6 bg-[#222] border-t border-[#333]">
              <div className="flex justify-between items-center mb-6">
                 <div>
                   <p className="text-[#ababab] text-[10px] font-bold uppercase">Total Bill (incl. tax)</p>
                   <h3 className="text-[#f6b100] text-3xl font-black tracking-tighter">₹{order?.bills?.totalWithTax?.toFixed(2)}</h3>
                 </div>
                 <div className="text-right">
                    <p className="text-[#ababab] text-[10px] font-bold uppercase">Payment</p>
                    <div className="flex items-center gap-2 text-[#f5f5f5] font-bold">
                       <FaCreditCard className="text-xs text-[#ababab]" />
                       {order?.paymentMethod || "Unpaid"}
                    </div>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button 
                   onClick={onClose}
                   className="flex-1 bg-transparent border border-[#444] text-[#f5f5f5] py-3 rounded-xl font-bold hover:bg-[#333] transition-colors"
                 >
                   Close
                 </button>
                 <button 
                   onClick={() => onUpdate(order)}
                   className="flex-1 bg-[#f6b100] text-[#1a1a1a] py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                 >
                   <FaEdit /> UPDATE
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderSummaryModal;
