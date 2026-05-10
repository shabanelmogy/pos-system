import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import BackButton from "../components/shared/BackButton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../https/index";
import { enqueueSnackbar } from "notistack"

const Orders = () => {
  const [status, setStatus] = useState("all");

  useEffect(() => {
    document.title = "POS | Orders"
  }, [])

  const { data: resData, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return await getOrders();
    },
    placeholderData: keepPreviousData
  })

  if(isError) {
    enqueueSnackbar("Something went wrong!", {variant: "error"})
  }

  // Filter logic
  const filteredOrders = resData?.data.data.filter((order) => {
    if (status === "all") return true;
    if (status === "progress") return order.orderStatus === "In Progress";
    if (status === "ready") return order.orderStatus === "Ready";
    if (status === "completed") return order.orderStatus === "Completed";
    return true;
  });

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex flex-col md:flex-row items-center justify-between px-10 py-6 gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-black uppercase tracking-tighter">
            Orders
          </h1>
        </div>
        <div className="flex items-center bg-[#1a1a1a] p-1 rounded-xl border border-[#333] overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full">

          {[
            { id: "all", label: "All" },
            { id: "progress", label: "In Progress" },
            { id: "ready", label: "Ready" },
            { id: "completed", label: "Completed" }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setStatus(tab.id)} 
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                status === tab.id 
                  ? "bg-[#f6b100] text-[#1a1a1a] shadow-lg shadow-[#f6b100]/20" 
                  : "text-[#ababab] hover:text-[#f5f5f5]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-10 pb-20 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredOrders && filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-20">
              <h2 className="text-white text-2xl font-black uppercase">No {status !== 'all' ? status : ''} orders found</h2>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

export default Orders;
