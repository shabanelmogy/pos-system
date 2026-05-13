import React from "react";
import { FaCheckDouble, FaLongArrowAltRight, FaCircle, FaUser, FaClock, FaHashtag, FaWallet } from "react-icons/fa";
import { getAvatarName, formatDateAndTime } from "../../../../shared/utils/index";
import { motion } from "framer-motion";
import ReprintPill from "../../../../shared/components/ReprintPill";
import { useTranslation } from "react-i18next";

interface OrderListProps {
  order: any;
  onReprint: (order: any) => void;
}

const OrderList: React.FC<OrderListProps> = ({ order, onReprint }) => {
  const { t } = useTranslation();
  if (!order) return null;

  const customerName = order.customerDetails?.name || order.customerSnapshot?.name || t('common.guest');
  const itemsCount = (order.items || order.orderItems || []).length;
  const tableNo = order.table?.tableNo || "N/A";
  const status = order.orderStatus || "In Progress";
  const total = order.total || order.bills?.totalWithTax || 0;
  const orderId = order.id ? `#${order.id.slice(-6).toUpperCase()}` : "N/A";
  const paymentMethod = order.paymentMethod || "Cash";

  const statusLabelMap: { [key: string]: string } = {
    "In Progress": t('common.order_status.in_progress'),
    "Ready": t('common.order_status.ready'),
    "Completed": t('common.order_status.completed')
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center gap-4 bg-[var(--bg-main)] p-5 rounded-2xl border border-transparent hover:border-[var(--border-main)] transition-all group shadow-sm hover:shadow-md relative overflow-hidden"
    >
      {/* Decorative background accent */}
      <div className="absolute top-0 start-0 w-1 h-full bg-[var(--primary)]/20" />

      {/* Avatar Section */}
      <div className="flex items-center gap-4">
        <div className="bg-[var(--primary)] w-12 h-12 flex items-center justify-center text-black font-black rounded-xl shadow-lg shadow-yellow-500/10 shrink-0 transform group-hover:scale-105 transition-transform">
          {customerName !== t('common.guest') ? getAvatarName(customerName) : <FaUser size={16} />}
        </div>
        <div className="flex flex-col sm:hidden">
           <h1 className="text-[var(--text-main)] text-sm font-black uppercase tracking-tight truncate group-hover:text-[var(--primary)] transition-colors">
            {customerName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-widest flex items-center gap-1">
                <FaHashtag size={8} /> {orderId}
             </span>
             <span className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-widest flex items-center gap-1">
                <FaClock size={8} /> {formatDateAndTime(order.createdAt).split(',')[1]}
             </span>
          </div>
        </div>
      </div>
      
      {/* Main Details Section */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div className="hidden sm:flex flex-col min-w-0 me-4">
          <h1 className="text-[var(--text-main)] text-sm font-black uppercase tracking-tight truncate group-hover:text-[var(--primary)] transition-colors">
            {customerName}
          </h1>
          <div className="flex items-center gap-3 mt-1">
             <span className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-widest flex items-center gap-1 bg-[var(--bg-card-alt)] px-1.5 py-0.5 rounded">
                <FaHashtag size={8} /> {orderId}
             </span>
             <span className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-widest flex items-center gap-1 bg-[var(--bg-card-alt)] px-1.5 py-0.5 rounded">
                <FaClock size={8} /> {formatDateAndTime(order.createdAt).split(',')[1]}
             </span>
             <span className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-widest flex items-center gap-1 bg-[var(--bg-card-alt)] px-1.5 py-0.5 rounded">
                <FaWallet size={8} /> {paymentMethod === "Cash" ? t('pos.cart.cash') : t('pos.cart.online')}
             </span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col">
             <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">{t('common.items')}</span>
             <span className="text-xs text-[var(--text-main)] font-black">{itemsCount}</span>
          </div>

          <div className="w-px h-6 bg-[var(--border-main)] hidden sm:block" />

          {tableNo !== "N/A" && (
            <div className="flex flex-col">
               <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">{t('common.table')}</span>
               <span className="text-xs text-[var(--primary)] font-black">{tableNo}</span>
            </div>
          )}

          <div className="w-px h-6 bg-[var(--border-main)] hidden sm:block" />

          <div className="flex flex-col">
             <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5">{t('pos.cart.total')}</span>
             <span className="text-sm text-[var(--primary)] font-black">₹{parseFloat(total).toFixed(2)}</span>
          </div>
        </div>

        {/* Status & Actions Section */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2 shrink-0 border-t sm:border-t-0 border-[var(--border-main)] pt-3 sm:pt-0">
           <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
             status === 'Ready' || status === 'Completed'
               ? 'bg-[var(--status-success-bg)] text-[var(--status-success)] border border-[var(--status-success)]/10' 
               : 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning)]/10'
           }`}>
              {status === 'Ready' || status === 'Completed' ? <FaCheckDouble size={10} /> : <FaCircle size={8} />}
              {statusLabelMap[status] || status}
           </div>
           
           <ReprintPill onClick={() => onReprint(order)} />
        </div>
      </div>
    </motion.div>
  );
};

export default OrderList;
