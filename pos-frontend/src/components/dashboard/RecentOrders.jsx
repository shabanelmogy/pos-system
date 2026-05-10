import React from "react";
import { GrUpdate } from "react-icons/gr";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders, updateOrderStatus } from "../../https/index";
import { formatDateAndTime } from "../../utils";
import { MdStore, MdComputer } from "react-icons/md";

const RecentOrders = ({ branchId = "all" }) => {
  const queryClient = useQueryClient();
  const handleStatusChange = ({orderId, orderStatus}) => {
    orderStatusUpdateMutation.mutate({orderId, orderStatus});
  };

  const orderStatusUpdateMutation = useMutation({
    mutationFn: ({orderId, orderStatus}) => updateOrderStatus({orderId, orderStatus}),
    onSuccess: () => {
      enqueueSnackbar("Order status updated successfully!", { variant: "success" });
      queryClient.invalidateQueries(["orders"]); 
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

  // Filter by branch
  const filteredOrders = (resData || []).filter(order => {
    if (branchId === "all") return true;
    return order.branchId === branchId;
  });

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#f5f5f5] text-xl font-semibold">
          {branchId === "all" ? "All Orders" : "Branch Orders"}
        </h2>
        <button 
          onClick={() => queryClient.invalidateQueries(["orders"])}
          className="text-[#ababab] hover:text-white flex items-center gap-2 text-sm"
        >
          <GrUpdate size={14} /> Refresh
        </button>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-[#f5f5f5]">
          <thead className="bg-[#333] text-[#ababab]">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Source</th>
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
            {(filteredOrders || []).map((order) => {
              const isPremium = order.customer?.totalOrders >= 5;
              return (
                <tr
                  key={order.id}
                  className="border-b border-gray-600 hover:bg-[#333] transition-colors"
                >
                  <td className="p-4 font-mono text-xs">#{Math.floor(new Date(order.createdAt).getTime() / 1000)}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[#f6b100] text-[10px] font-bold uppercase">
                        <MdStore /> {order.branch?.name || "Unknown Branch"}
                      </div>
                      <div className="flex items-center gap-1 text-[#ababab] text-[9px] font-medium uppercase tracking-tighter">
                        <MdComputer /> {order.posPoint?.name || "Terminal 1"}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{order.customerDetails?.name || "Guest"}</span>
                      {isPremium && <span className="text-[10px] text-yellow-500 font-bold uppercase">Loyal Customer</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      className={`bg-[#1a1a1a] text-[#f5f5f5] border border-gray-500 p-2 rounded-lg focus:outline-none text-xs ${
                        order.orderStatus === "Ready" ? "text-green-400" : 
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
                  <td className="p-4 text-xs">{formatDateAndTime(order.createdAt)}</td>
                  <td className="p-4 text-sm">{order.orderItems?.length || 0} Items</td>
                  <td className="p-4">
                    <span className="bg-[#333] px-2 py-1 rounded text-xs">Table - {order.table?.tableNo || "N/A"}</span>
                  </td>
                  <td className="p-4 font-bold text-[#f6b100] text-sm">₹{parseFloat(order.total || 0).toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${order.paymentMethod === 'Cash' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'}`}>
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
