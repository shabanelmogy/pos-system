import React from "react";
import { FaCheckDouble, FaLongArrowAltRight, FaCircle, FaUser } from "react-icons/fa";
import { getAvatarName } from "../../utils/index";
import { motion } from "framer-motion";
import ReprintPill from "../shared/ReprintPill";

const OrderList = ({ order, onReprint }) => {
  if (!order) return null;

  const customerName = order.customerDetails?.name || order.customerSnapshot?.name || "Guest";
  const itemsCount = (order.items || order.orderItems || []).length;
  const tableNo = order.table?.tableNo || "N/A";
  const status = order.orderStatus || "In Progress";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 bg-[#1f1f1f] p-4 rounded-2xl border border-transparent hover:border-[#333] transition-all group"
    >
      <div className="bg-[#f6b100] w-12 h-12 flex items-center justify-center text-black font-black rounded-xl shadow-lg shadow-yellow-500/10 shrink-0">
        {customerName !== "Guest" ? getAvatarName(customerName) : <FaUser size={16} />}
      </div>
      
      <div className="flex-1 flex items-center justify-between min-w-0">
        <div className="flex flex-col min-w-0 mr-4">
          <h1 className="text-white text-sm font-black uppercase tracking-tight truncate group-hover:text-[#f6b100] transition-colors">
            {customerName}
          </h1>
          <p className="text-[#555] text-[10px] font-bold uppercase tracking-widest">{itemsCount} Items Ordered</p>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#262626] rounded-xl border border-[#333]">
           <span className="text-[9px] text-[#ababab] font-black uppercase tracking-widest">Table</span>
           <FaLongArrowAltRight className="text-[#444]" size={10} />
           <span className="text-xs text-[#f6b100] font-black">{tableNo}</span>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
           <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
             status === 'Ready' || status === 'Completed'
               ? 'bg-green-500/10 text-green-500 border border-green-500/10' 
               : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/10'
           }`}>
              {status === 'Ready' || status === 'Completed' ? <FaCheckDouble size={10} /> : <FaCircle size={8} />}
              {status}
           </div>
           
           <ReprintPill onClick={() => onReprint(order)} />
        </div>
      </div>
    </motion.div>
  );
};

export default OrderList;
