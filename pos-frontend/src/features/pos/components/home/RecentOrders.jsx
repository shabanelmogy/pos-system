import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import OrderList from "../menu/OrderList";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../../orders/api/orderApi";
import { motion, AnimatePresence } from "framer-motion";
import Invoice from "../../../orders/components/invoice/Invoice";
import { useSelector } from "react-redux";

const RecentOrders = () => {
  const [selectedOrderForReprint, setSelectedOrderForReprint] = useState(null);
  const [showReprintModal, setShowReprintModal] = useState(false);
  const { selectedPOSPoint } = useSelector((state) => state.pos);

  const { data: ordersList = [], isError, isLoading } = useQuery({
    queryKey: ["recent-orders", selectedPOSPoint?.id],
    queryFn: async () => {
      const res = await getOrders({
        posPointId: selectedPOSPoint?.id
      });
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
    <div className="mt-4 mb-6 relative">
      <div className="bg-[var(--bg-card)] w-full min-h-[300px] lg:h-[331px] 2xl:h-[503px] rounded-2xl border border-[var(--border-main)] shadow-xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--bg-card-alt)]">
          <h1 className="text-[var(--text-main)] text-base font-black uppercase tracking-tighter">
            Recent Orders
          </h1>
          <button className="text-[var(--primary)] text-[9px] font-black uppercase tracking-widest hover:underline">
            View full history
          </button>
        </div>

        <div className="overflow-y-auto min-h-[300px] lg:h-[420px] scrollbar-hide">
          <div className="flex items-center gap-3 bg-[var(--bg-card-alt)] rounded-xl px-4 py-2.5 mb-4 border border-[var(--border-main)] focus-within:border-[var(--primary)] transition-colors">
            <FaSearch className="text-[var(--text-dim)]" />
            <input
              type="text"
              placeholder="Search history..."
              className="bg-transparent outline-none text-[var(--text-main)] text-sm w-full font-medium"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                <div className="w-8 h-8 border-4 border-[var(--border-main)] border-t-[var(--primary)] rounded-full animate-spin" />
                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Fetching Orders...</p>
              </div>
            ) : ordersList.length > 0 ? (
              <div className="space-y-3">
                {ordersList.map((order) => (
                  <OrderList key={order.id} order={order} onReprint={handleReprint} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <p className="text-[var(--text-dim)] font-black uppercase tracking-widest text-xs">No Recent Activity</p>
                <p className="text-[var(--border-main)] text-[10px] mt-1 font-bold uppercase">Ready for your first order</p>
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
