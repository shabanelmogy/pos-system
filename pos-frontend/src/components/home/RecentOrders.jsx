import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import OrderList from "./OrderList";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../https/index";
import { motion, AnimatePresence } from "framer-motion";
import Invoice from "../invoice/Invoice";
import { useSelector } from "react-redux";

const RecentOrders = () => {
  const [selectedOrderForReprint, setSelectedOrderForReprint] = useState(null);
  const [showReprintModal, setShowReprintModal] = useState(false);
  const { selectedPOSPoint } = useSelector((state) => state.pos);

  const { data: ordersList = [], isError, isLoading } = useQuery({
    queryKey: ["orders", selectedPOSPoint?.id],
    queryFn: async () => {
      const res = await getOrders({ posPointId: selectedPOSPoint?.id });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });

  React.useEffect(() => {
    if (isError) {
      enqueueSnackbar("Failed to sync recent orders", { variant: "error" });
    }
  }, [isError, enqueueSnackbar]);

  const handleReprint = (order) => {
    setSelectedOrderForReprint(order);
    setShowReprintModal(true);
  };


  return (
    <div className="px-8 mt-6 relative">
      <div className="bg-[#1a1a1a] w-full h-[450px] rounded-[2rem] border border-[#333] shadow-2xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-8 py-6 border-b border-[#262626]">
          <h1 className="text-white text-lg font-black uppercase tracking-tighter">
            Recent Orders
          </h1>
          <button className="text-[#f6b100] text-[10px] font-black uppercase tracking-widest hover:underline">
            View full history
          </button>
        </div>

        <div className="p-6 flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center gap-4 bg-[#262626] rounded-2xl px-6 py-3 mb-6 border border-[#333] focus-within:border-[#f6b100] transition-colors">
            <FaSearch className="text-[#555]" />
            <input
              type="text"
              placeholder="Search history..."
              className="bg-transparent outline-none text-white text-sm w-full font-medium"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                  <div className="w-8 h-8 border-4 border-[#333] border-t-[#f6b100] rounded-full animate-spin" />
                  <p className="text-[10px] text-[#ababab] font-black uppercase tracking-widest">Fetching Orders...</p>
               </div>
            ) : ordersList.length > 0 ? (
              <div className="space-y-3">
                {ordersList.map((order) => (
                  <OrderList key={order.id} order={order} onReprint={handleReprint} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <p className="text-[#444] font-black uppercase tracking-widest text-xs">No Recent Activity</p>
                <p className="text-[#333] text-[10px] mt-1 font-bold uppercase">Ready for your first order</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reprint Invoice Modal */}
      <AnimatePresence>
        {showReprintModal && selectedOrderForReprint && (
          <Invoice 
            orderInfo={selectedOrderForReprint} 
            setShowInvoice={setShowReprintModal} 
            isReprint={true}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecentOrders;
