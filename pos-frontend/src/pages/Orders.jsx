import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import BackButton from "../components/shared/BackButton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../https/index";
import { enqueueSnackbar } from "notistack"
import { useSelector } from "react-redux";
import Invoice from "../components/invoice/Invoice";
import { AnimatePresence } from "framer-motion";

const Orders = () => {
  const [status, setStatus] = useState("all");
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [dateFilter, setDateFilter] = useState("all"); 
  
  const [selectedOrderForReprint, setSelectedOrderForReprint] = useState(null);
  const [showReprintModal, setShowReprintModal] = useState(false);
  
  const { selectedPOSPoint } = useSelector((state) => state.pos);
  const enableTables = selectedPOSPoint?.settings?.enableTables !== false;
  const user = useSelector((state) => state.user);

  useEffect(() => {
    document.title = "POS | Orders"
  }, [])

  const { data: orders = [], isError } = useQuery({
    queryKey: ["orders", selectedPOSPoint?.id, showOnlyMine, dateFilter],
    queryFn: async () => {
      const params = { posPointId: selectedPOSPoint?.id };
      
      if (showOnlyMine) {
          params.cashierId = user.id;
      }
      
      if (dateFilter === "today") {
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          params.startDate = start.toISOString();
      }

      const res = await getOrders(params);
      return res.data.data;
    },
    placeholderData: keepPreviousData
  })

  const handleReprint = (order) => {
    setSelectedOrderForReprint(order);
    setShowReprintModal(true);
  };

  if(isError) {
    enqueueSnackbar("Something went wrong!", {variant: "error"})
  }

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    if (status === "all") return true;
    if (status === "progress") return order.orderStatus === "In Progress";
    if (status === "ready") return order.orderStatus === "Ready";
    if (status === "completed") return order.orderStatus === "Completed";
    return true;
  });

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex flex-col px-10 py-6 gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-[#f5f5f5] text-2xl font-black uppercase tracking-tighter">
                Orders
            </h1>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setDateFilter(dateFilter === "all" ? "today" : "all")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                        dateFilter === "today" 
                        ? "bg-[#f6b100] border-[#f6b100] text-[#1a1a1a]" 
                        : "bg-transparent border-[#333] text-[#ababab] hover:border-[#f6b100] hover:text-[#f6b100]"
                    }`}
                >
                    {dateFilter === "today" ? "Showing Today" : "Show Today Only"}
                </button>
                
                <button 
                    onClick={() => setShowOnlyMine(!showOnlyMine)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                        showOnlyMine 
                        ? "bg-[#f6b100] border-[#f6b100] text-[#1a1a1a]" 
                        : "bg-transparent border-[#333] text-[#ababab] hover:border-[#f6b100] hover:text-[#f6b100]"
                    }`}
                >
                    {showOnlyMine ? "Showing My Orders" : "Show My Orders"}
                </button>
            </div>
        </div>

        {enableTables && (
          <div className="flex items-center bg-[#1a1a1a] p-1 rounded-xl border border-[#333] overflow-x-auto whitespace-nowrap scrollbar-hide max-w-fit">
            {[
              { id: "all", label: "All Status" },
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
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-10 pb-20 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredOrders && filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onReprint={handleReprint} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-20">
              <h2 className="text-white text-2xl font-black uppercase">No {status !== 'all' ? status : ''} orders found</h2>
            </div>
          )}
        </div>
      </div>

      <BottomNav />

      <AnimatePresence>
        {showReprintModal && selectedOrderForReprint && (
          <Invoice
            orderInfo={selectedOrderForReprint}
            setShowInvoice={setShowReprintModal}
            isReprint={true}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Orders;
