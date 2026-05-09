import React from "react";
import { FaCheckDouble, FaLongArrowAltRight } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils/index";
import useAuth from "../../hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus, updateTable } from "../../https";
import { enqueueSnackbar } from "notistack";

const OrderCard = ({ order }) => {
  const { canCompleteOrders } = useAuth();
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      enqueueSnackbar("Order Completed!", { variant: "success" });
      
      // If completed, also free the table
      if (order.table?._id) {
        tableMutation.mutate({ 
          tableId: order.table._id, 
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
    statusMutation.mutate({ orderId: order._id, orderStatus: "Completed" });
  };
  return (
    <div key={key} className="w-[500px] bg-[#262626] p-4 rounded-lg mb-4">
      <div className="flex items-center gap-5">
        <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
          {getAvatarName(order.customerDetails.name)}
        </button>
        <div className="flex items-center justify-between w-[100%]">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
              {order.customerDetails.name}
            </h1>
            <p className="text-[#ababab] text-sm">#{Math.floor(new Date(order.orderDate).getTime())} / Dine in</p>
            <p className="text-[#ababab] text-sm">Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" /> {order.table.tableNo}</p>
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
                  <FaCircle className="inline mr-2 text-yellow-600" /> Preparing your order
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 text-[#ababab]">
        <p>{formatDateAndTime(order.orderDate)}</p>
        <p>{order.items.length} Items</p>
      </div>
      <hr className="w-full mt-4 border-t-1 border-gray-500" />
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[#f5f5f5] text-lg font-semibold">Total</h1>
        <p className="text-[#f5f5f5] text-lg font-semibold">₹{order.bills.totalWithTax.toFixed(2)}</p>
      </div>

      {canCompleteOrders && order.orderStatus !== "Completed" && (
        <button
          onClick={handleCompleteOrder}
          disabled={statusMutation.isPending}
          className="w-full mt-4 bg-[#f6b100] text-[#1a1a1a] font-bold py-2 rounded-lg hover:bg-yellow-600 transition-colors"
        >
          {statusMutation.isPending ? "Updating..." : "Complete Order & Free Table"}
        </button>
      )}
    </div>
  );
};

export default OrderCard;
