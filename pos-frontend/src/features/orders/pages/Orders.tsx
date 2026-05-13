import React, { useState, useEffect } from "react";
import BottomNav from "../../../shared/components/BottomNav";
import OrderCard from "../components/OrderCard";
import BackButton from "../../../shared/components/BackButton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getOrders } from "../api/orderApi";
import { enqueueSnackbar } from "notistack";
import usePOSStore from "../../pos/store/usePOSStore";
import useUserStore from "../../auth/store/useUserStore";
import Invoice from "../components/invoice/Invoice";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const Orders: React.FC = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState("all");
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");

  const [selectedOrderForReprint, setSelectedOrderForReprint] = useState<any>(null);
  const [showReprintModal, setShowReprintModal] = useState(false);

  const { selectedPOSPoint } = usePOSStore();
  const enableTables = selectedPOSPoint?.settings?.enableTables !== false;
  const user = useUserStore();

  useEffect(() => {
    document.title = "POS | Orders";
  }, []);

  const { data: orders = [], isError } = useQuery({
    queryKey: ["orders", selectedPOSPoint?.id, showOnlyMine, dateFilter],
    queryFn: async () => {
      const params: any = { posPointId: selectedPOSPoint?.id };

      if (showOnlyMine && user.id) {
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
  });

  const handleReprint = (order: any) => {
    setSelectedOrderForReprint(order);
    setShowReprintModal(true);
  };

  useEffect(() => {
    if (isError) {
      enqueueSnackbar(t('common.error'), { variant: "error" });
    }
  }, [isError, t]);

  const statusTabs = [
    { id: "all", label: t('orders.status.all') },
    { id: "progress", label: t('orders.status.in_progress') },
    { id: "ready", label: t('orders.status.ready') },
    { id: "completed", label: t('orders.status.completed') }
  ];

  const filteredOrders = orders.filter((order: any) => {
    if (status === "all") return true;
    if (status === "progress") return order.orderStatus === "In Progress";
    if (status === "ready") return order.orderStatus === "Ready";
    if (status === "completed") return order.orderStatus === "Completed";
    return true;
  });

  return (
    <section className="bg-[var(--bg-main)] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex flex-col px-10 py-6 gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-[var(--text-main)] text-2xl font-black uppercase tracking-tighter">
              {t('orders.title')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDateFilter(dateFilter === "all" ? "today" : "all")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                dateFilter === "today"
                ? "bg-[var(--primary)] border-[var(--primary)] text-black"
                : "bg-transparent border-[var(--border-main)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
              }`}
            >
              {dateFilter === "today" ? t('orders.showing_today') : t('orders.show_today')}
            </button>

            <button
              onClick={() => setShowOnlyMine(!showOnlyMine)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                showOnlyMine
                ? "bg-[var(--primary)] border-[var(--primary)] text-black"
                : "bg-transparent border-[var(--border-main)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
              }`}
            >
              {showOnlyMine ? t('orders.showing_mine') : t('orders.show_mine')}
            </button>
          </div>
        </div>

        {enableTables && (
          <div className="flex items-center bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-main)] overflow-x-auto whitespace-nowrap scrollbar-hide max-w-fit">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                  status === tab.id
                    ? "bg-[var(--primary)] text-black shadow-lg shadow-[var(--primary)]/20"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
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
            filteredOrders.map((order: any) => (
              <OrderCard key={order.id} order={order} onReprint={handleReprint} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-20">
              <h2 className="text-[var(--text-main)] text-2xl font-black uppercase">{t('orders.no_orders')}</h2>
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
