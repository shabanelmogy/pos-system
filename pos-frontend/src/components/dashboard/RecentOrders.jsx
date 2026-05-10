import React from "react";
import { GrUpdate } from "react-icons/gr";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders, updateOrderStatus } from "../../https/index";
import { formatDateAndTime } from "../../utils";

const RecentOrders = () => {
  const queryClient = useQueryClient();
  const handleStatusChange = ({orderId, orderStatus}) => {
    orderStatusUpdateMutation.mutate({orderId, orderStatus});
  };

  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({orderId, orderStatus}) => updateOrderStatus({orderId, orderStatus}),
    onSuccess: () => {
      enqueueSnackbar("Order status updated successfully!", { variant: "success" });
      queryClient.invalidateQueries(["orders"]); // Refresh order list
    },
    onError: () => {
      enqueueSnackbar("Failed to update order status!", { variant: "error" });
    }
  })

  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await getOrders();
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });

  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" });
  }

  if (isLoading) {
    return <div className="p-10 text-center text-[#ababab]">Loading recent orders...</div>;
  }

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#f5f5f5] text-xl font-semibold">
          Recent Orders
        </h2>
        <button 
          onClick={() => queryClient.invalidateQueries(["orders"])}
          className="text-[#ababab] hover:text-white flex items-center gap-2 text-sm"
        >
          <GrUpdate size={14} /> Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[#f5f5f5]">
          <thead className="bg-[#333] text-[#ababab]">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Items</th>
              <th className="p-3">Table No</th>
              <th className="p-3">Total</th>
              <th className="p-3 text-center">Payment</th>
            </tr>
          </thead>
          <tbody>
            {(resData || []).map((order) => {
              const isPremium = order.customer?.totalOrders >= 5;
              return (
                <tr
                  key={order.id}
                  className="border-b border-gray-600 hover:bg-[#333] transition-colors"
                >
                  <td className="p-4 font-mono text-xs">#{Math.floor(new Date(order.orderDate).getTime() / 1000)}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-semibold">{order.customerDetails?.name || "Guest"}</span>
                      {isPremium && <span className="text-[10px] text-yellow-500 font-bold uppercase">Loyal Customer</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      className={`bg-[#1a1a1a] text-[#f5f5f5] border border-gray-500 p-2 rounded-lg focus:outline-none text-sm ${
                        order.orderStatus === "Ready" ? "text-green-500" : 
                        order.orderStatus === "Completed" ? "text-blue-400" : "text-yellow-500"
                      }`}
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange({orderId: order.id, orderStatus: e.target.value})}
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Ready">Ready</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="p-4 text-sm">{formatDateAndTime(order.orderDate)}</td>
                  <td className="p-4">{order.items?.length || 0} Items</td>
                  <td className="p-4">
                    <span className="bg-[#333] px-2 py-1 rounded text-xs">Table - {order.table?.tableNo || "N/A"}</span>
                  </td>
                  <td className="p-4 font-bold text-[#f6b100]">₹{parseFloat(order.bills?.totalWithTax || 0).toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${order.paymentMethod === 'Cash' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'}`}>
                      {order.paymentMethod || "Cash"}
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
