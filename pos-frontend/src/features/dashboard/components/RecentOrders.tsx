import React from "react";
import { GrUpdate } from "react-icons/gr";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders, updateOrderStatus } from "../api/dashboardApi";
import { formatDateAndTime } from "../../../shared/utils";
import { MdStore, MdComputer } from "react-icons/md";
import { useTranslation } from "react-i18next";

interface RecentOrdersProps {
  branchId?: string;
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ branchId = "all" }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const handleStatusChange = ({orderId, orderStatus}: {orderId: string, orderStatus: string}) => {
    orderStatusUpdateMutation.mutate({orderId, orderStatus});
  };

  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({orderId, orderStatus}: {orderId: string, orderStatus: string}) => updateOrderStatus({orderId, orderStatus}),
    onSuccess: () => {
      enqueueSnackbar(t('dashboard.orders.status_updated'), { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["orders"] }); 
    },
    onError: () => {
      enqueueSnackbar(t('dashboard.orders.status_failed'), { variant: "error" });
    }
  });

  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await getOrders();
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });

  if (isError) {
    enqueueSnackbar(t('dashboard.orders.something_wrong'), { variant: "error" });
  }

  if (isLoading) {
    return <div className="p-10 text-center text-[var(--text-muted)]">{t('dashboard.orders.loading')}</div>;
  }

  // Filter by branch
  const filteredOrders = (resData || []).filter((order: any) => {
    if (branchId === "all") return true;
    return order.branchId === branchId;
  });

  return (
    <div className="container mx-auto bg-[var(--bg-card-alt)] p-3 rounded-xl border border-[var(--border-main)]">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-[var(--text-main)] text-lg font-black uppercase tracking-tighter">
          {branchId === "all" ? t('dashboard.orders.all_orders') : t('dashboard.orders.branch_orders')}
        </h2>
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["orders"] })}
          className="text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-2 text-sm"
        >
          <GrUpdate size={14} /> {t('dashboard.orders.refresh')}
        </button>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-[var(--text-main)]">
          <thead className="bg-[var(--bg-card)] text-[var(--text-muted)] border-b border-[var(--border-main)]">
            <tr>
              <th className="p-3 text-[9px] font-black uppercase tracking-widest">{t('dashboard.orders.order_id')}</th>
              <th className="p-3 text-[9px] font-black uppercase tracking-widest">{t('dashboard.orders.source')}</th>
              <th className="p-3 text-[9px] font-black uppercase tracking-widest">{t('dashboard.orders.customer')}</th>
              <th className="p-3 text-[9px] font-black uppercase tracking-widest">{t('dashboard.orders.status')}</th>
              <th className="p-3 text-[9px] font-black uppercase tracking-widest">{t('dashboard.orders.date_time')}</th>
              <th className="p-3 text-[9px] font-black uppercase tracking-widest">{t('dashboard.orders.items')}</th>
              <th className="p-3 text-[9px] font-black uppercase tracking-widest">{t('dashboard.orders.table')}</th>
              <th className="p-3 text-[9px] font-black uppercase tracking-widest">{t('dashboard.orders.total')}</th>
              <th className="p-3 text-[9px] font-black uppercase tracking-widest text-center">{t('dashboard.orders.payment')}</th>
            </tr>
          </thead>
          <tbody>
            {(filteredOrders || []).map((order: any) => {
              const isPremium = order.customer?.totalOrders >= 5;
              return (
                <tr
                  key={order.id}
                  className="border-b border-gray-600 hover:bg-[var(--border-main)] transition-colors"
                >
                  <td className="p-3 font-mono text-xs">#{Math.floor(new Date(order.createdAt).getTime() / 1000)}</td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[var(--primary)] text-[10px] font-bold uppercase">
                        <MdStore /> {order.branch?.name || t('dashboard.orders.unknown_branch')}
                      </div>
                      <div className="flex items-center gap-1 text-[var(--text-muted)] text-[9px] font-medium uppercase tracking-tighter">
                        <MdComputer /> {order.posPoint?.name || t('dashboard.orders.terminal_1')}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{order.customerDetails?.name || t('common.guest')}</span>
                      {isPremium && <span className="text-[10px] text-[var(--status-warning)] font-bold uppercase">{t('dashboard.orders.loyal_customer')}</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <select
                      className={`bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)] p-2 rounded-lg focus:outline-none text-xs ${
                        order.orderStatus === "Ready" ? "text-[var(--status-success)]" : 
                        order.orderStatus === "Completed" ? "text-[var(--primary)]" : "text-[var(--status-warning)]"
                      }`}
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange({orderId: order.id, orderStatus: e.target.value})}
                    >
                      <option value="In Progress">{t('common.order_status.in_progress')}</option>
                      <option value="Ready">{t('common.order_status.ready')}</option>
                      <option value="Completed">{t('common.order_status.completed')}</option>
                    </select>
                  </td>
                  <td className="p-3 text-xs">{formatDateAndTime(order.createdAt)}</td>
                  <td className="p-3 text-sm">{order.orderItems?.length || 0} {t('dashboard.orders.items')}</td>
                  <td className="p-3">
                    <span className="bg-[var(--bg-card)] px-2 py-1 rounded text-[10px] font-bold border border-[var(--border-main)]">{t('common.table')} {order.table?.tableNo || "N/A"}</span>
                  </td>
                  <td className="p-3 font-bold text-[var(--primary)] text-sm">₹{parseFloat(order.total || 0).toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${order.paymentMethod === 'Cash' ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]' : 'bg-[var(--primary-light)] text-[var(--primary)]'}`}>
                      {order.paymentMethod || t('pos.cart.cash')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
