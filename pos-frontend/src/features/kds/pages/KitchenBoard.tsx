import React, { useEffect, useState } from "react";
import useKdsStore from "../store/useKdsStore";
import { motion } from "framer-motion";
import { initSocket } from "../../../shared/utils/socket";
import Ticket from "../components/Ticket";
import { updateOrderFulfillment, getKitchenStations } from "../api/kdsApi";
import { useTranslation } from "react-i18next";
import usePOSStore from "../../pos/store/usePOSStore";

const KitchenBoard: React.FC = () => {
  const { t } = useTranslation();
  const { activeOrders, currentStationId, setStationId, fetchOrders, isLoading } = useKdsStore();
  const { selectedBranch } = usePOSStore();
  const [stations, setStations] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
    const socket = initSocket(selectedBranch?.id);
    socket?.emit("join_branch", selectedBranch?.id);
    socket?.on("order_update", () => {
      console.log("Real-time Order Update Received");
      fetchOrders();
    });

    const loadStations = async () => {
      const res = await getKitchenStations();
      setStations(res.data);
    };
    loadStations();

    return () => {
      socket?.off("order_update");
    };
  }, [fetchOrders, selectedBranch?.id]);

  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (orderId: string, status: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await updateOrderFulfillment({ orderId, status });
      await fetchOrders();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const safeOrders = Array.isArray(activeOrders) ? activeOrders : [];
  const pendingOrders = safeOrders.filter(o => o.fulfillmentStatus === "PENDING");
  const preparingOrders = safeOrders.filter(o => o.fulfillmentStatus === "PREPARING");
  const readyOrders = safeOrders.filter(o => o.fulfillmentStatus === "READY");

  return (
    <div className="h-screen bg-[var(--bg-main)] flex flex-col overflow-hidden">
      {/* KDS Header */}
      <header className="bg-[var(--bg-card)] border-b border-[var(--border-main)] p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black text-[var(--primary)] tracking-tighter">KITCHEN DISPLAY</h1>
          <select
            value={currentStationId || ""}
            onChange={(e) => setStationId(e.target.value || null)}
            className="bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-main)] rounded-lg px-3 py-1 text-sm font-bold focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="">All Stations</option>
            {stations.map(s => (
              <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          {isLoading && <div className="animate-spin h-5 w-5 border-2 border-[var(--primary)] border-t-transparent rounded-full" />}
          <span className="bg-green-500/10 text-green-500 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Live Connection</span>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 min-h-0 overflow-x-auto p-6 flex gap-6">
        {/* PENDING COLUMN */}
        <section className="flex-1 min-w-[320px] max-w-[450px] flex flex-col h-full bg-orange-500/5 rounded-2xl border-2 border-dashed border-orange-500/20 shadow-inner">
          <div className="p-4 flex justify-between items-center border-b border-orange-500/10 bg-orange-500/10 rounded-t-2xl">
            <h2 className="font-black text-orange-600 uppercase tracking-tighter flex items-center gap-2">
              <span className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
              Incoming
            </h2>
            <span className="bg-orange-600 text-white text-xs font-black px-2 py-0.5 rounded-full">{pendingOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
            {pendingOrders.map(order => (
              <Ticket key={order.id} order={order} onStatusChange={handleStatusChange} isUpdating={isUpdating} />
            ))}
          </div>
        </section>

        {/* PREPARING COLUMN */}
        <section className="flex-1 min-w-[320px] max-w-[450px] flex flex-col h-full bg-blue-500/5 rounded-2xl border-2 border-dashed border-blue-500/20 shadow-inner">
          <div className="p-4 flex justify-between items-center border-b border-blue-500/10 bg-blue-500/10 rounded-t-2xl">
            <h2 className="font-black text-blue-600 uppercase tracking-tighter flex items-center gap-2">
              <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
              Preparing
            </h2>
            <span className="bg-blue-600 text-white text-xs font-black px-2 py-0.5 rounded-full">{preparingOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
            {preparingOrders.map(order => (
              <Ticket key={order.id} order={order} onStatusChange={handleStatusChange} isUpdating={isUpdating} />
            ))}
          </div>
        </section>

        {/* READY COLUMN */}
        <section className="flex-1 min-w-[320px] max-w-[450px] flex flex-col h-full bg-green-500/5 rounded-2xl border-2 border-dashed border-green-500/20 shadow-inner">
          <div className="p-4 flex justify-between items-center border-b border-green-500/10 bg-green-500/10 rounded-t-2xl">
            <h2 className="font-black text-green-600 uppercase tracking-tighter flex items-center gap-2">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Ready
            </h2>
            <span className="bg-green-600 text-white text-xs font-black px-2 py-0.5 rounded-full">{readyOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
            {readyOrders.map(order => (
              <Ticket key={order.id} order={order} onStatusChange={handleStatusChange} isUpdating={isUpdating} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default KitchenBoard;
