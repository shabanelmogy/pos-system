import React from "react";
import { FaCheckDouble, FaCircle, FaUser, FaClock, FaHashtag, FaWallet } from "react-icons/fa";
import { getAvatarName, formatDateAndTime } from "@/shared/utils";
import { motion } from "framer-motion";
import ReprintPill from "@/shared/components/ReprintPill";
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
      className="group relative flex flex-col gap-1.5 overflow-hidden rounded-2xl border border-transparent bg-[var(--bg-main)] p-2 shadow-sm transition-all hover:border-[var(--border-main)] hover:shadow-md sm:flex-row sm:items-center sm:gap-2 2xl:gap-3 2xl:rounded-3xl 2xl:p-3"
    >
      {/* Decorative background accent */}
      <div className="absolute start-0 top-0 h-full w-0.5 bg-[var(--primary)]/20" />

      {/* Avatar Section */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-[10px] font-black text-black shadow-sm shadow-yellow-500/10 transition-transform group-hover:scale-105 sm:h-9 sm:w-9 sm:rounded-2xl sm:text-xs 2xl:h-10 2xl:w-10 2xl:rounded-[1.25rem] 2xl:text-sm">
          {customerName !== t('common.guest') ? getAvatarName(customerName) : <FaUser className="size-3.5" />}
        </div>
        <div className="flex flex-col sm:hidden">
           <h1 className="truncate text-xs font-black uppercase tracking-tight text-[var(--text-main)] transition-colors group-hover:text-[var(--primary)]">
            {customerName}
          </h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
             <span className="flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wide text-[var(--text-dim)]">
                <FaHashtag className="size-2.5 shrink-0" /> {orderId}
             </span>
             <span className="flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wide text-[var(--text-dim)]">
                <FaClock className="size-2.5 shrink-0" /> {formatDateAndTime(order.createdAt).split(',')[1]}
             </span>
          </div>
        </div>
      </div>
      
      {/* Main Details Section */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5 sm:flex-row sm:items-center sm:gap-2">
        <div className="hidden min-w-0 flex-col sm:flex sm:me-1.5">
          <h1 className="truncate text-[11px] font-black uppercase tracking-tight text-[var(--text-main)] transition-colors group-hover:text-[var(--primary)] 2xl:text-xs">
            {customerName}
          </h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
             <span className="flex items-center gap-0.5 rounded-md bg-[var(--bg-card-alt)] px-1 py-px text-[8px] font-bold uppercase tracking-wide text-[var(--text-dim)] 2xl:rounded-lg">
                <FaHashtag className="size-2.5 shrink-0" /> {orderId}
             </span>
             <span className="flex items-center gap-0.5 rounded-md bg-[var(--bg-card-alt)] px-1 py-px text-[8px] font-bold uppercase tracking-wide text-[var(--text-dim)] 2xl:rounded-lg">
                <FaClock className="size-2.5 shrink-0" /> {formatDateAndTime(order.createdAt).split(',')[1]}
             </span>
             <span className="flex items-center gap-0.5 rounded-md bg-[var(--bg-card-alt)] px-1 py-px text-[8px] font-bold uppercase tracking-wide text-[var(--text-dim)] 2xl:rounded-lg">
                <FaWallet className="size-2.5 shrink-0" /> {paymentMethod === "Cash" ? t('pos.cart.cash') : t('pos.cart.online')}
             </span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="flex flex-col">
             <span className="mb-px text-[7px] font-black uppercase tracking-wide text-[var(--text-muted)]">{t('common.items')}</span>
             <span className="text-[10px] font-black text-[var(--text-main)] 2xl:text-[11px]">{itemsCount}</span>
          </div>

          <div className="hidden h-4 w-px bg-[var(--border-main)] sm:block" />

          {tableNo !== "N/A" && (
            <div className="flex flex-col">
               <span className="mb-px text-[7px] font-black uppercase tracking-wide text-[var(--text-muted)]">{t('common.table')}</span>
               <span className="text-[10px] font-black text-[var(--primary)] 2xl:text-[11px]">{tableNo}</span>
            </div>
          )}

          <div className="hidden h-4 w-px bg-[var(--border-main)] sm:block" />

          <div className="flex flex-col">
             <span className="mb-px text-[7px] font-black uppercase tracking-wide text-[var(--text-muted)]">{t('pos.cart.total')}</span>
             <span className="text-[11px] font-black text-[var(--primary)] 2xl:text-xs">₹{parseFloat(total).toFixed(2)}</span>
          </div>
        </div>

        {/* Status & Actions Section */}
        <div className="flex shrink-0 flex-row items-center justify-between gap-1.5 border-t border-[var(--border-main)] pt-1.5 sm:flex-col sm:items-end sm:justify-center sm:gap-1 sm:border-t-0 sm:pt-0">
           <div className={`flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wide 2xl:rounded-xl ${
             status === 'Ready' || status === 'Completed'
               ? 'border border-[var(--status-success)]/10 bg-[var(--status-success-bg)] text-[var(--status-success)]' 
               : 'border border-[var(--status-warning)]/10 bg-[var(--status-warning-bg)] text-[var(--status-warning)]'
           }`}>
              {status === 'Ready' || status === 'Completed' ? <FaCheckDouble className="size-2.5" /> : <FaCircle className="size-2" />}
              {statusLabelMap[status] || status}
           </div>
           
           <ReprintPill onClick={() => onReprint(order)} />
        </div>
      </div>
    </motion.div>
  );
};

export default OrderList;
