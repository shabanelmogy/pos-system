import React from "react";
import { FaCheckDouble, FaLongArrowAltRight, FaCircle, FaUser } from "react-icons/fa";
import { getAvatarName } from "../../../../shared/utils/index";
import { motion } from "framer-motion";
import ReprintPill from "../../../../shared/components/ReprintPill";

interface OrderListProps {
  order: any;
  onReprint: (order: any) => void;
}

const OrderList: React.FC<OrderListProps> = ({ order, onReprint }) => {
  if (!order) return null;

  const customerName = order.customerDetails?.name || order.customerSnapshot?.name || "Guest";
  const itemsCount = (order.items || order.orderItems || []).length;
  const tableNo = order.table?.tableNo || "N/A";
  const status = order.orderStatus || "In Progress";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 bg-[var(--bg-main)] p-4 rounded-2xl border border-transparent hover:border-[var(--border-main)] transition-all group"
    >
      <div className="bg-[var(--primary)] w-12 h-12 flex items-center justify-center text-black font-black rounded-xl shadow-lg shadow-yellow-500/10 shrink-0">
        {customerName !== "Guest" ? getAvatarName(customerName) : <FaUser size={16} />}
      </div>
      
      <div className="flex-1 flex items-center justify-between min-w-0">
        <div className="flex flex-col min-w-0 me-4">
          <h1 className="text-[var(--text-main)] text-sm font-black uppercase tracking-tight truncate group-hover:text-[var(--primary)] transition-colors">
            {customerName}
          </h1>
          <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-widest">{itemsCount} Items Ordered</p>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card-alt)] rounded-xl border border-[var(--border-main)]">
           <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">Table</span>
           <FaLongArrowAltRight className="text-[var(--text-dim)] rtl:rotate-180" size={10} />
           <span className="text-xs text-[var(--primary)] font-black">{tableNo}</span>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0 ms-4">
           <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
             status === 'Ready' || status === 'Completed'
               ? 'bg-[var(--status-success-bg)] text-[var(--status-success)] border border-[var(--status-success-bg)]' 
               : 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-bg)]'
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
