import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getTables } from "../https";
import { MdTableBar } from "react-icons/md";

import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import FullScreenLoader from "../components/shared/FullScreenLoader";
import OrderSummaryModal from "../components/tables/OrderSummaryModal";
import { setOrder } from "../redux/slices/customerSlice";
import { setCart } from "../redux/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";

const Tables = () => {
  const dispatch = useDispatch();
  const customerData = useSelector((state) => state.customer);
  const isNewOrderFlow = customerData.customerName && customerData.customerPhone;
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [serviceStatus, setServiceStatus] = useState("all"); // New filter state

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsSummaryModalOpen(true);
  };

  const handleUpdateOrder = (order) => {
    dispatch(setOrder({
      customerName: order.customerDetails.name,
      customerPhone: order.customerDetails.phone,
      table: { tableId: order.table.id, tableNo: order.table.tableNo },
      orderId: order.id,
      guests: order.customerDetails.guests
    }));
    
    dispatch(setCart(order.items));
    navigate(`/menu`);
  };

  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await getTables();
      return response.data.data; 
    },
    placeholderData: keepPreviousData,
    refetchInterval: 5000, 
  });

  useEffect(() => {
    document.title = "POS | Tables";
  }, []);

  if (isLoading) return <FullScreenLoader />;

  if (isError) {
    enqueueSnackbar("Failed to load tables. Please try again.", { variant: "error" });
  }

  // Separate tables into Active and Free
  const activeTablesRaw = resData?.filter(table => table.status === "Booked") || [];
  const freeTables = resData?.filter(table => table.status !== "Booked") || [];

  // Apply service status filter to active tables
  const activeTables = activeTablesRaw.filter(table => {
    if (serviceStatus === "all") return true;
    return table.currentOrder?.orderStatus === serviceStatus;
  });

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
      {/* Header Area */}
      <div className="flex items-center justify-between px-8 py-4 bg-[#1a1a1a] border-b border-[#333]">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[#f5f5f5] text-2xl font-black tracking-tighter uppercase">Floor Plan</h1>
            <p className="text-[#ababab] text-xs font-medium">Manage your tables and active orders</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#2e4a40] border border-green-500"></span>
            <span className="text-[#f5f5f5] text-xs font-bold">{activeTables.length} Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#333] border border-[#555]"></span>
            <span className="text-[#f5f5f5] text-xs font-bold">{freeTables.length} Free</span>
          </div>
        </div>
      </div>

      {/* Split Layout Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT SIDE: ACTIVE ORDERS (Main Area) */}
        <div className="flex-[1.5] border-r border-[#333] flex flex-col bg-[#1f1f1f]">
          <div className="px-8 py-4 bg-[#262626] border-b border-[#333] flex justify-between items-center">
             <div className="flex flex-col gap-1">
                <h2 className="text-[#f6b100] text-sm font-black uppercase tracking-widest flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-[#f6b100] animate-pulse"></span>
                   Active Service
                </h2>
                <div className="flex items-center gap-3 mt-2">
                   <button 
                     onClick={() => setServiceStatus("all")}
                     className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                       serviceStatus === "all" ? "bg-[#f6b100] text-[#1a1a1a] border-[#f6b100]" : "text-[#ababab] border-[#444] hover:border-[#666]"
                     }`}
                   >
                     All ({activeTablesRaw.length})
                   </button>
                   <button 
                     onClick={() => setServiceStatus("In Progress")}
                     className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                       serviceStatus === "In Progress" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50" : "text-[#ababab] border-[#444] hover:border-[#666]"
                     }`}
                   >
                     In Progress ({activeTablesRaw.filter(t => t.currentOrder?.orderStatus === "In Progress").length})
                   </button>
                   <button 
                     onClick={() => setServiceStatus("Ready")}
                     className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                       serviceStatus === "Ready" ? "bg-green-500/20 text-green-500 border-green-500/50" : "text-[#ababab] border-[#444] hover:border-[#666]"
                     }`}
                   >
                     Ready ({activeTablesRaw.filter(t => t.currentOrder?.orderStatus === "Ready").length})
                   </button>
                </div>
             </div>
             <span className="text-[#ababab] text-[10px] font-bold bg-[#1a1a1a] px-2 py-1 rounded">
               {activeTables.length} Shown
             </span>
          </div>
          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
             {activeTables.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                 {activeTables.map((table) => (
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
                  <MdTableBar size={80} className="text-[#ababab] mb-4" />
                  <p className="text-[#f5f5f5] text-lg font-bold">No Active Tables</p>
                  <p className="text-[#ababab] text-sm">Start an order to see tables here</p>
               </div>
             )}
          </div>
        </div>

        {/* RIGHT SIDE: AVAILABLE TABLES (Side Panel) */}
        <div className="flex-1 flex flex-col bg-[#1a1a1a]">
          <div className="px-8 py-4 bg-[#222] border-b border-[#333] flex justify-between items-center">
             <h2 className="text-[#ababab] text-sm font-black uppercase tracking-widest">
                Available Tables
             </h2>
             <span className="text-[#ababab] text-[10px] font-bold bg-[#1a1a1a] px-2 py-1 rounded">
               {freeTables.length} Free
             </span>
          </div>
          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {freeTables.map((table) => (
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
