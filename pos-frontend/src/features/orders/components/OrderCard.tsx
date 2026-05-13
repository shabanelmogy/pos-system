import React from "react";
import { FaCheckDouble, FaLongArrowAltRight, FaCrown, FaPrint } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../../shared/utils/index";
import useAuth from "../../auth/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "../api/orderApi";
import { updateTable } from "../../tables/api/tableApi";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

interface OrderCardProps {
  order: any;
  onReprint?: (order: any) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onReprint }) => {
  const { t } = useTranslation();
  const { canCompleteOrders } = useAuth();
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      enqueueSnackbar(t('dashboard.orders.status_updated'), { variant: "success" });
      if (order.table?.id) {
        tableMutation.mutate({ tableId: order.table.id, status: "Available" });
      }
    },
    onError: () => { enqueueSnackbar(t('dashboard.orders.status_failed'), { variant: "error" }); }
  });

  const tableMutation = useMutation({
    mutationFn: updateTable,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tables"] }); }
  });

  const handleCompleteOrder = () => {
    statusMutation.mutate({ orderId: order.id, orderStatus: "Completed" });
  };

  const isPremiumCustomer = order.customer?.totalOrders >= 5;
  const status = order.orderStatus || "In Progress";

  const statusLabelMap: { [key: string]: string } = {
    "In Progress": t('common.order_status.in_progress'),
    "Ready": t('common.order_status.ready'),
    "Completed": t('common.order_status.completed')
  };

  return (
    <div className="w-full bg-[var(--bg-card-alt)] p-4 rounded-lg mb-4 shadow-xl border border-[var(--border-main)]">
      <div className="flex items-center gap-5">
        <div className="relative">
          <button className="bg-[var(--primary)] p-3 text-xl font-bold rounded-lg min-w-[50px]">
            {getAvatarName(order.customerDetails?.name || t('common.guest'))}
          </button>
          {isPremiumCustomer && (
            <div className="absolute -top-2 -end-2 bg-yellow-500 text-black p-1 rounded-full border-2 border-[var(--bg-card-alt)]" title="Premium Customer">
              <FaCrown size={12} />
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[var(--text-main)] text-lg font-semibold tracking-wide">
                {order.customerDetails?.name || t('common.guest')}
              </h1>
              {isPremiumCustomer && (
                <span className="text-[10px] bg-[var(--status-warning-bg)] text-[var(--status-warning)] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                  {t('orders.loyal')}
                </span>
              )}
            </div>
            <p className="text-[var(--text-muted)] text-xs font-medium">#{Math.floor(new Date(order.orderDate).getTime() / 1000)} / {order.paymentMethod || t('pos.cart.cash')}</p>
            <p className="text-[var(--text-muted)] text-sm">{t('tables.title')} <FaLongArrowAltRight className="text-[var(--text-muted)] ms-2 inline rtl:rotate-180" /> {order.table?.tableNo || "N/A"}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {status === "Ready" ? (
              <>
                <p className="text-[var(--status-success)] bg-[var(--status-success-bg)] px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-widest">
                  <FaCheckDouble className="inline me-2" /> {statusLabelMap[status]}
                </p>
                <p className="text-[var(--text-muted)] text-sm font-medium">
                  <FaCircle className="inline me-2 text-[var(--status-success)]" size={8} /> {t('orders.ready_to_serve')}
                </p>
              </>
            ) : (
              <>
                <p className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${status === "Completed" ? "text-[var(--status-success)] bg-[var(--status-success-bg)]" : "text-[var(--status-warning)] bg-[var(--status-warning-bg)]"}`}>
                  <FaCircle className="inline me-2" size={8} /> {statusLabelMap[status] || status}
                </p>
                <p className="text-[var(--text-muted)] text-sm font-medium">
                  <FaCircle className={`inline me-2 ${status === "Completed" ? "text-[var(--status-success)]" : "text-[var(--status-warning)]"}`} size={8} />
                  {status === "Completed" ? t('orders.order_served') : t('orders.preparing')}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 text-[var(--text-muted)] text-sm font-medium">
        <p>{formatDateAndTime(order.orderDate)}</p>
        <p>{(order.items || []).length} {t('common.items')}</p>
      </div>
      <hr className="w-full mt-4 border-t-1 border-[var(--border-main)]" />
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[var(--text-main)] text-lg font-semibold">{t('pos.cart.total')}</h1>
        <p className="text-[var(--primary)] text-lg font-black">₹{parseFloat(order.bills?.totalWithTax || 0).toFixed(2)}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button onClick={() => onReprint && onReprint(order)}
          className="flex items-center justify-center gap-2 bg-[var(--bg-hover)] text-[var(--text-main)] font-bold py-2 rounded-lg hover:bg-[var(--border-main)] transition-colors border border-[var(--border-main)] text-sm uppercase tracking-widest">
          <FaPrint size={14} /> {t('orders.reprint')}
        </button>
        {canCompleteOrders && status !== "Completed" ? (
          <button onClick={handleCompleteOrder} disabled={statusMutation.isPending}
            className="bg-[var(--primary)] text-[var(--bg-card)] font-bold py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm uppercase tracking-widest disabled:opacity-50">
            {statusMutation.isPending ? t('orders.serving') : t('orders.serve')}
          </button>
        ) : (
          <div className="bg-[var(--status-success-bg)] text-[var(--status-success)] font-bold py-2 rounded-lg text-center text-[10px] flex items-center justify-center gap-2 uppercase tracking-widest border border-[var(--status-success-bg)]">
            <FaCheckDouble size={12} /> {t('orders.served')}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
