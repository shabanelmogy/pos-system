import React from "react";
import { FaCheckDouble, FaLongArrowAltRight, FaCrown, FaPrint } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils/index";
import useAuth from "../../hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus, updateTable } from "../../https";
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
    <div className="w-full bg-[#262626] p-4 rounded-lg mb-4 shadow-xl border border-[#333]">
      <div className="flex items-center gap-5">
        <div className="relative">
          <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg min-w-[50px]">
            {getAvatarName(order.customerDetails?.name || "Guest")}
          </button>
          {isPremiumCustomer && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-black p-1 rounded-full border-2 border-[#262626] title='Premium Customer'">
              <FaCrown size={12} />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between w-[100%]">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
                {order.customerDetails?.name || "Guest"}
              </h1>
              {isPremiumCustomer && (
                <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                  Loyal
                </span>
              )}
            </div>
            <p className="text-[#ababab] text-xs font-medium">#{Math.floor(new Date(order.orderDate).getTime() / 1000)} / {order.paymentMethod || "Cash"}</p>
            <p className="text-[#ababab] text-sm">Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" /> {order.table?.tableNo || "N/A"}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {order.orderStatus === "Ready" ? (
              <>
                <p className="text-green-600 bg-[#2e4a40] px-2 py-1 rounded-lg">
                  <FaCheckDouble className="inline mr-2" /> {order.orderStatus}
                </p>
                <p className="text-[#ababab] text-sm">
                  <FaCircle className="inline mr-2 text-green-600" /> Ready to
                  serve
                </p>
              </>
            ) : (
              <>
                <p className="text-yellow-600 bg-[#4a452e] px-2 py-1 rounded-lg">
                  <FaCircle className="inline mr-2" /> {order.orderStatus}
                </p>
                <p className="text-[#ababab] text-sm">
                  <FaCircle className="inline mr-2 text-yellow-600" /> {order.orderStatus === "Completed" ? "Order Served" : "Preparing"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 text-[#ababab]">
        <p>{formatDateAndTime(order.orderDate)}</p>
        <p>{(order.items || []).length} Items</p>
      </div>
      <hr className="w-full mt-4 border-t-1 border-gray-500" />
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[#f5f5f5] text-lg font-semibold">Total</h1>
        <p className="text-[#f6b100] text-lg font-black">₹{parseFloat(order.bills?.totalWithTax || 0).toFixed(2)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
            onClick={() => onReprint && onReprint(order)}
            className="flex items-center justify-center gap-2 bg-[#333] text-[#f5f5f5] font-bold py-2 rounded-lg hover:bg-[#444] transition-colors border border-[#444]"
        >
            <FaPrint size={14} /> Reprint
        </button>

        {canCompleteOrders && order.orderStatus !== "Completed" ? (
            <button
            onClick={handleCompleteOrder}
            disabled={statusMutation.isPending}
            className="bg-[#f6b100] text-[#1a1a1a] font-bold py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
            {statusMutation.isPending ? "Serving..." : "Serve Order"}
            </button>
        ) : (
            <div className="bg-[#2e4a40]/50 text-green-500 font-bold py-2 rounded-lg text-center text-xs flex items-center justify-center gap-2">
                <FaCheckDouble size={12} /> Served
            </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
