import React, { useState, useEffect } from "react";
import BottomNav from "../../../shared/components/BottomNav";
import BackButton from "../../../shared/components/BackButton";
import TableCard from "../components/TableCard";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTables } from "../api/tableApi";
import { MdTableBar } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import FullScreenLoader from "../../../shared/components/FullScreenLoader";
import OrderSummaryModal from "../components/OrderSummaryModal";
import useCustomerStore from "../../customers/store/useCustomerStore";
import useCartStore from "../../pos/store/useCartStore";
import { useTranslation } from "react-i18next";

const Tables: React.FC = () => {
  const { t } = useTranslation();
  const { setOrder } = useCustomerStore();
  const { addItem, clearCart } = useCartStore();

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [serviceStatus, setServiceStatus] = useState("all");

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsSummaryModalOpen(true);
  };

  const handleUpdateOrder = (order: any) => {
    setOrder({
      customerName: order.customerDetails.name,
      customerPhone: order.customerDetails.phone,
      table: { tableId: order.table.id, tableNo: order.table.tableNo },
      orderId: order.id,
      guests: order.customerDetails.guests
    });

    clearCart();
    (order.items || []).forEach((item: any) => {
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          id: item.menuItem.id,
          name: item.name,
          price: item.unitPrice
        });
      }
    });

    navigate(`/menu`);
  };

  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await getTables();
      return response.data.data as any[];
    },
    placeholderData: keepPreviousData,
    refetchInterval: 5000,
  });

  useEffect(() => {
    document.title = "POS | Tables";
  }, []);

  if (isLoading) return <FullScreenLoader />;

  if (isError) {
    enqueueSnackbar(t('common.error'), { variant: "error" });
  }

  const activeTablesRaw = resData?.filter(table => table.status === "Occupied") || [];
  const freeTables = resData?.filter(table => table.status !== "Occupied") || [];

  const activeTables = activeTablesRaw.filter(table => {
    if (serviceStatus === "all") return true;
    const fulfillment = table.currentOrder?.fulfillmentStatus || "PREPARING";
    return fulfillment === serviceStatus;
  });

  return (
    <section className="bg-[var(--bg-main)] h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
      {/* Header Area */}
      <div className="flex items-center justify-between px-8 py-4 bg-[var(--bg-card)] border-b border-[var(--border-main)]">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[var(--text-main)] text-2xl font-black tracking-tighter uppercase">{t('tables.title')}</h1>
            <p className="text-[var(--text-muted)] text-xs font-medium">{t('tables.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--status-success-bg)] border border-[var(--status-success)]"></span>
            <span className="text-[var(--text-main)] text-xs font-bold">{activeTables.length} {t('tables.active')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--bg-card-alt)] border border-[var(--border-main)]"></span>
            <span className="text-[var(--text-main)] text-xs font-bold">{freeTables.length} {t('tables.free')}</span>
          </div>
        </div>
      </div>

      {/* Split Layout Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* LEFT SIDE: ACTIVE ORDERS */}
        <div className="flex-[1.5] border-r border-[var(--border-main)] flex flex-col bg-[var(--bg-main)]">
          <div className="px-8 py-4 bg-[var(--bg-card-alt)] border-b border-[var(--border-main)] flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-[var(--primary)] text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
                {t('tables.active_service')}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setServiceStatus("all")}
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                    serviceStatus === "all" ? "bg-[var(--primary)] text-black border-[var(--primary)]" : "text-[var(--text-muted)] border-[var(--border-main)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  {t('tables.status.all')} ({activeTablesRaw.length})
                </button>
                <button
                  onClick={() => setServiceStatus("PREPARING")}
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                    serviceStatus === "PREPARING" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50" : "text-[var(--text-muted)] border-[var(--border-main)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  {t('tables.status.in_progress')} ({activeTablesRaw.filter(t => (t.currentOrder?.fulfillmentStatus || "PREPARING") === "PREPARING").length})
                </button>
                <button
                  onClick={() => setServiceStatus("READY")}
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                    serviceStatus === "READY" ? "bg-green-500/20 text-green-500 border-green-500/50" : "text-[var(--text-muted)] border-[var(--border-main)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  {t('tables.status.ready')} ({activeTablesRaw.filter(t => t.currentOrder?.fulfillmentStatus === "READY").length})
                </button>
              </div>
            </div>
            <span className="text-[var(--text-muted)] text-[10px] font-bold bg-[var(--bg-card)] px-2 py-1 rounded">
              {activeTables.length} {t('tables.shown')}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            {activeTables.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeTables.map((table: any) => (
                  <TableCard
                    key={table.id}
                    id={table.id}
                    name={table.tableNo}
                    status={table.status}
                    initials={table?.currentOrder?.customerDetails?.name}
                    seats={table.seats}
                    order={table.currentOrder}
                    onViewOrder={handleViewOrder}
                  />
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <MdTableBar size={80} className="text-[var(--text-muted)] mb-4" />
                <p className="text-[var(--text-main)] text-lg font-bold">{t('tables.no_active_tables')}</p>
                <p className="text-[var(--text-muted)] text-sm">{t('tables.no_active_subtitle')}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: AVAILABLE TABLES */}
        <div className="flex-1 flex flex-col bg-[var(--bg-card)]">
          <div className="px-8 py-4 bg-[var(--bg-card-alt)] border-b border-[var(--border-main)] flex justify-between items-center">
            <h2 className="text-[var(--text-muted)] text-sm font-black uppercase tracking-widest">
              {t('tables.available_tables')}
            </h2>
            <span className="text-[var(--text-muted)] text-[10px] font-bold bg-[var(--bg-main)] px-2 py-1 rounded">
              {freeTables.length} {t('tables.free')}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {freeTables.map((table: any) => (
                <TableCard
                  key={table.id}
                  id={table.id}
                  name={table.tableNo}
                  status={table.status}
                  initials={null}
                  seats={table.seats}
                  order={null}
                  onViewOrder={handleViewOrder}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <OrderSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        order={selectedOrder}
        onUpdate={handleUpdateOrder}
      />

      <BottomNav />
    </section>
  );
};

export default Tables;
