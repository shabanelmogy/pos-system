import React from "react";
import { FaCheckDouble, FaLongArrowAltRight, FaCrown, FaPrint } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../../shared/utils/index";
import useAuth from "../../auth/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "../api/orderApi";
import { updateTable } from "../../tables/api/tableApi";
import { enqueueSnackbar } from "notistack";

const OrderCard = ({ order, onReprint }) => {
  const { canCompleteOrders } = useAuth();
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      enqueueSnackbar("Order Completed!", { variant: "success" });
      
      // If completed, also free the table
      if (order.table?.id) {
        tableMutation.mutate({ 
          tableId: order.table.id, 
          status: "Available" 
        });
      }
    },
    onError: () => {
      enqueueSnackbar("Failed to update status", { variant: "error" });
    }
  });

  const tableMutation = useMutation({
    mutationFn: updateTable,
    onSuccess: () => {
      queryClient.invalidateQueries(["tables"]);
    }
  });

  const handleCompleteOrder = () => {
    statusMutation.mutate({ orderId: order.id, orderStatus: "Completed" });
  };

  const isPremiumCustomer = order.customer?.totalOrders >= 5;

  return (
    <div className="w-full bg-[var(--bg-card-alt)] p-4 rounded-lg mb-4 shadow-xl border border-[var(--border-main)]">
      <div className="flex items-center gap-5">
        <div className="relative">
          <button className="bg-[var(--primary)] p-3 text-xl font-bold rounded-lg min-w-[50px]">
            {getAvatarName(order.customerDetails?.name || "Guest")}
          </button>
          {isPremiumCustomer && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-black p-1 rounded-full border-2 border-[var(--bg-card-alt)] title='Premium Customer'">
              <FaCrown size={12} />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between w-[100%]">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[var(--text-main)] text-lg font-semibold tracking-wide">
                {order.customerDetails?.name || "Guest"}
              </h1>
              {isPremiumCustomer && (
                <span className="text-[10px] bg-[var(--status-warning-bg)] text-[var(--status-warning)] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                  Loyal
                </span>
              )}
            </div>
            <p className="text-[var(--text-muted)] text-xs font-medium">#{Math.floor(new Date(order.orderDate).getTime() / 1000)} / {order.paymentMethod || "Cash"}</p>
            <p className="text-[var(--text-muted)] text-sm">Table <FaLongArrowAltRight className="text-[var(--text-muted)] ml-2 inline" /> {order.table?.tableNo || "N/A"}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {order.orderStatus === "Ready" ? (
              <>
                <p className="text-[var(--status-success)] bg-[var(--status-success-bg)] px-2 py-1 rounded-lg">
                  <FaCheckDouble className="inline mr-2" /> {order.orderStatus}
                </p>
                <p className="text-[var(--text-muted)] text-sm">
                  <FaCircle className="inline mr-2 text-[var(--status-success)]" /> Ready to
                  serve
                </p>
              </>
            ) : (
              <>
                <p className={`px-2 py-1 rounded-lg ${order.orderStatus === "Completed" ? "text-[var(--status-success)] bg-[var(--status-success-bg)]" : "text-[var(--status-warning)] bg-[var(--status-warning-bg)]"}`}>
                  <FaCircle className="inline mr-2" /> {order.orderStatus}
                </p>
                <p className="text-[var(--text-muted)] text-sm">
                  <FaCircle className={`inline mr-2 ${order.orderStatus === "Completed" ? "text-[var(--status-success)]" : "text-[var(--status-warning)]"}`} /> {order.orderStatus === "Completed" ? "Order Served" : "Preparing"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 text-[var(--text-muted)]">
        <p>{formatDateAndTime(order.orderDate)}</p>
        <p>{(order.items || []).length} Items</p>
      </div>
      <hr className="w-full mt-4 border-t-1 border-[var(--border-main)]" />
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[var(--text-main)] text-lg font-semibold">Total</h1>
        <p className="text-[var(--primary)] text-lg font-black">₹{parseFloat(order.bills?.totalWithTax || 0).toFixed(2)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
            onClick={() => onReprint && onReprint(order)}
            className="flex items-center justify-center gap-2 bg-[var(--bg-hover)] text-[var(--text-main)] font-bold py-2 rounded-lg hover:bg-[var(--border-main)] transition-colors border border-[var(--border-main)]"
        >
            <FaPrint size={14} /> Reprint
        </button>

        {canCompleteOrders && order.orderStatus !== "Completed" ? (
            <button
            onClick={handleCompleteOrder}
            disabled={statusMutation.isPending}
            className="bg-[var(--primary)] text-[var(--bg-card)] font-bold py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
            {statusMutation.isPending ? "Serving..." : "Serve Order"}
            </button>
        ) : (
            <div className="bg-[var(--status-success-bg)] text-[var(--status-success)] font-bold py-2 rounded-lg text-center text-xs flex items-center justify-center gap-2">
                <FaCheckDouble size={12} /> Served
            </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
