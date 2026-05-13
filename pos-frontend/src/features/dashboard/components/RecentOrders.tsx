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
    return (
      <div className="py-4 px-2 text-center text-[9px] text-[var(--text-muted)] 2xl:py-8 2xl:px-3 2xl:text-xs">
        {t('dashboard.orders.loading')}
      </div>
    );
  }

  // Filter by branch
  const filteredOrders = (resData || []).filter((order: any) => {
    if (branchId === "all") return true;
    return order.branchId === branchId;
  });

  const cell = "px-1 py-0.5 align-middle leading-tight 2xl:px-2 2xl:py-1.5 2xl:leading-normal";
  const thCell = `${cell} text-[6px] font-black uppercase tracking-tight whitespace-nowrap 2xl:text-[8px] 2xl:tracking-wide`;

  return (
    <div className="w-full max-w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-card-alt)] p-1 2xl:rounded-2xl 2xl:p-2.5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-1 px-px 2xl:mb-1.5 2xl:gap-1.5">
        <h2 className="max-w-[min(100%,16rem)] text-[9px] font-black uppercase leading-none tracking-tight text-[var(--text-main)] sm:max-w-none sm:text-[10px] 2xl:text-sm">
          {branchId === "all" ? t('dashboard.orders.all_orders') : t('dashboard.orders.branch_orders')}
        </h2>
        <button
          type="button"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["orders"] })}
          className="flex shrink-0 items-center gap-0.5 text-[8px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] 2xl:gap-1 2xl:text-[10px]"
        >
          <GrUpdate size={10} className="2xl:h-3 2xl:w-3" /> {t('dashboard.orders.refresh')}
        </button>
      </div>
      <div className="-mx-px overflow-x-auto px-px custom-scrollbar sm:mx-0 sm:px-0">
        <table className="w-full min-w-[38rem] text-left text-[9px] text-[var(--text-main)] md:min-w-[44rem] lg:min-w-0 lg:table-fixed 2xl:text-[11px]">
          <colgroup>
            <col style={{ width: "7%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>
          <thead className="border-b border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-muted)]">
            <tr>
              <th className={thCell}>{t('dashboard.orders.order_id')}</th>
              <th className={thCell}>{t('dashboard.orders.source')}</th>
              <th className={thCell}>{t('dashboard.orders.customer')}</th>
              <th className={thCell}>{t('dashboard.orders.status')}</th>
              <th className={thCell}>{t('dashboard.orders.date_time')}</th>
              <th className={thCell}>{t('dashboard.orders.items')}</th>
              <th className={thCell}>{t('dashboard.orders.table')}</th>
              <th className={thCell}>{t('dashboard.orders.total')}</th>
              <th className={`${thCell} text-center`}>{t('dashboard.orders.payment')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-main)]/60">
            {(filteredOrders || []).map((order: any) => {
              const isPremium = order.customer?.totalOrders >= 5;
              return (
                <tr
                  key={order.id}
                  className="leading-none transition-colors hover:bg-[var(--border-main)]/40 2xl:leading-normal"
                >
                  <td className={`${cell} font-mono text-[8px] whitespace-nowrap tabular-nums 2xl:text-[10px]`}>
                    #{Math.floor(new Date(order.createdAt).getTime() / 1000)}
                  </td>
                  <td className={cell}>
                    <div className="flex min-w-0 flex-col gap-0">
                      <div className="flex items-center gap-px truncate text-[7px] font-bold uppercase text-[var(--primary)] 2xl:gap-0.5 2xl:text-[9px]" title={order.branch?.name}>
                        <MdStore className="size-2.5 shrink-0 2xl:size-3" />
                        <span className="truncate">{order.branch?.name || t('dashboard.orders.unknown_branch')}</span>
                      </div>
                      <div className="flex items-center gap-px truncate text-[6px] font-medium uppercase tracking-tight text-[var(--text-muted)] 2xl:gap-0.5 2xl:text-[8px]" title={order.posPoint?.name}>
                        <MdComputer className="size-2 shrink-0 2xl:size-2.5" />
                        <span className="truncate">{order.posPoint?.name || t('dashboard.orders.terminal_1')}</span>
                      </div>
                    </div>
                  </td>
                  <td className={cell}>
                    <div className="flex min-w-0 flex-col gap-0">
                      <span className="truncate text-[9px] font-semibold leading-tight 2xl:text-[11px]" title={order.customerDetails?.name}>
                        {order.customerDetails?.name || t('common.guest')}
                      </span>
                      {isPremium && (
                        <span className="text-[6px] font-bold uppercase leading-none text-[var(--status-warning)] 2xl:text-[8px]">
                          {t('dashboard.orders.loyal_customer')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={cell}>
                    <select
                      className={`h-5 w-full min-w-0 max-w-full rounded-md border border-[var(--border-main)] bg-[var(--bg-card)] px-px py-0 text-[8px] leading-none text-[var(--text-main)] focus:outline-none 2xl:h-6 2xl:rounded-lg 2xl:px-1 2xl:py-0.5 2xl:text-[10px] ${
                        order.orderStatus === "Ready"
                          ? "text-[var(--status-success)]"
                          : order.orderStatus === "Completed"
                            ? "text-[var(--primary)]"
                            : "text-[var(--status-warning)]"
                      }`}
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange({ orderId: order.id, orderStatus: e.target.value })}
                    >
                      <option value="In Progress">{t('common.order_status.in_progress')}</option>
                      <option value="Ready">{t('common.order_status.ready')}</option>
                      <option value="Completed">{t('common.order_status.completed')}</option>
                    </select>
                  </td>
                  <td className={`${cell} whitespace-nowrap text-[8px] leading-tight md:whitespace-normal md:break-words 2xl:text-[10px]`}>
                    {formatDateAndTime(order.createdAt)}
                  </td>
                  <td className={`${cell} whitespace-nowrap tabular-nums text-[8px] 2xl:text-[10px]`}>
                    {order.orderItems?.length || 0} {t('dashboard.orders.items')}
                  </td>
                  <td className={cell}>
                    <span className="inline-flex whitespace-nowrap rounded-md border border-[var(--border-main)] bg-[var(--bg-card)] px-0.5 py-px text-[7px] font-bold 2xl:rounded-lg 2xl:px-1 2xl:text-[9px]">
                      {t('common.table')} {order.table?.tableNo || "N/A"}
                    </span>
                  </td>
                  <td className={`${cell} whitespace-nowrap tabular-nums text-[9px] font-bold text-[var(--primary)] 2xl:text-[11px]`}>
                    ₹{parseFloat(order.total || 0).toFixed(2)}
                  </td>
                  <td className={`${cell} text-center`}>
                    <span
                      className={`inline-block max-w-full truncate rounded-full px-0.5 py-px text-[6px] font-bold uppercase 2xl:px-1 2xl:text-[8px] ${
                        order.paymentMethod === "Cash"
                          ? "bg-[var(--status-success-bg)] text-[var(--status-success)]"
                          : "bg-[var(--primary-light)] text-[var(--primary)]"
                      }`}
                      title={order.paymentMethod || t("pos.cart.cash")}
                    >
                      {order.paymentMethod || t("pos.cart.cash")}
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
