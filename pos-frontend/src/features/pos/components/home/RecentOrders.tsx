import React, { useState, useEffect, useMemo } from "react";
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaWallet, FaChevronDown, FaChevronUp, FaUtensils, FaMoneyBillWave, FaCalendarDay, FaChartPie, FaTimesCircle, FaUser, FaSort, FaTimes, FaLayerGroup } from "react-icons/fa";
import OrderList from "../menu/OrderList";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../../orders/api/orderApi";
import { motion, AnimatePresence } from "framer-motion";
import Invoice from "../../../orders/components/invoice/Invoice";
import usePOSStore from "../../store/usePOSStore";
import { useTranslation } from "react-i18next";

const RecentOrders: React.FC = () => {
  const { t } = useTranslation();
  const [selectedOrderForReprint, setSelectedOrderForReprint] = useState<any>(null);
  const [showReprintModal, setShowReprintModal] = useState(false);
  
  // Advanced & Flexible States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [datePreset, setDatePreset] = useState("All");
  
  const [sortBy, setSortBy] = useState<"createdAt" | "total" | "customerName" | "itemsCount">("createdAt");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const { selectedPOSPoint } = usePOSStore();

  const { data: ordersList = [], isError, isLoading } = useQuery({
    queryKey: ["recent-orders", selectedPOSPoint?.id],
    queryFn: async () => {
      const res = await getOrders({ posPointId: selectedPOSPoint?.id });
      return res.data.data;
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isError) enqueueSnackbar(t('common.error'), { variant: "error" });
  }, [isError, t]);

  const handleReprint = (order: any) => {
    setSelectedOrderForReprint(order);
    setShowReprintModal(true);
  };

  const processedOrders = useMemo(() => {
    let filtered = (ordersList || []).filter((order: any) => {
      const customerName = (order.customerDetails?.name || order.customerSnapshot?.name || "Guest").toLowerCase();
      const tableNo = (order.table?.tableNo || "").toString().toLowerCase();
      const orderId = (order.id || "").toString().toLowerCase();
      const itemsCount = (order.items || order.orderItems || []).length;
      const total = parseFloat(order.total || order.bills?.totalWithTax || 0);
      
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      
      const isToday = orderDate.toDateString() === today.toDateString();
      const isYesterday = orderDate.toDateString() === yesterday.toDateString();

      // Multi-select matches
      const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(order.orderStatus);
      const paymentMatch = selectedPayments.length === 0 || selectedPayments.includes(order.paymentMethod);
      
      const sizeMatch = selectedSizes.length === 0 || 
                        (selectedSizes.includes("Small") && itemsCount <= 2) || 
                        (selectedSizes.includes("Large") && itemsCount > 2);
      
      const dateMatch = datePreset === "All" || 
                        (datePreset === "Today" && isToday) || 
                        (datePreset === "Yesterday" && isYesterday);

      const searchMatch = customerName.includes(searchTerm.toLowerCase()) || 
                          tableNo.includes(searchTerm.toLowerCase()) ||
                          orderId.includes(searchTerm.toLowerCase()) ||
                          total.toString().includes(searchTerm);
                          
      return statusMatch && searchMatch && paymentMatch && sizeMatch && dateMatch;
    });

    // Flexible Sorting
    return filtered.sort((a: any, b: any) => {
      let valA: any, valB: any;
      
      switch(sortBy) {
        case "total":
          valA = parseFloat(a.total || a.bills?.totalWithTax || 0);
          valB = parseFloat(b.total || b.bills?.totalWithTax || 0);
          break;
        case "customerName":
          valA = (a.customerDetails?.name || a.customerSnapshot?.name || "Guest").toLowerCase();
          valB = (b.customerDetails?.name || b.customerSnapshot?.name || "Guest").toLowerCase();
          break;
        case "itemsCount":
          valA = (a.items || a.orderItems || []).length;
          valB = (b.items || b.orderItems || []).length;
          break;
        default:
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
      }
      
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [ordersList, searchTerm, selectedStatuses, selectedPayments, selectedSizes, datePreset, sortBy, sortOrder]);

  const toggleFilter = (list: string[], setList: (l: string[]) => void, value: string) => {
    if (list.includes(value)) {
      setList(list.filter(v => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const filteredTotal = useMemo(() => 
    processedOrders.reduce((sum, order) => sum + parseFloat(order.total || order.bills?.totalWithTax || 0), 0)
  , [processedOrders]);

  const activeFilters = useMemo(() => {
    const filters: { type: string, value: string, label: string }[] = [];
    selectedStatuses.forEach(s => filters.push({ type: t('common.order_status.title'), value: s, label: s === "In Progress" ? t('common.order_status.in_progress') : s === "Ready" ? t('common.order_status.ready') : t('common.order_status.completed') }));
    selectedPayments.forEach(p => filters.push({ type: t('pos.cart.payment_method'), value: p, label: p === "Cash" ? t('pos.cart.cash') : t('pos.cart.online') }));
    selectedSizes.forEach(s => filters.push({ type: t('common.volume.title'), value: s, label: s === "Small" ? t('common.volume.small') : t('common.volume.large') }));
    if (datePreset !== "All") filters.push({ type: t('common.period.title'), value: datePreset, label: datePreset === "Today" ? t('common.period.today') : t('common.period.yesterday') });
    return filters;
  }, [selectedStatuses, selectedPayments, selectedSizes, datePreset, t]);

  const removeFilter = (filter: any) => {
    if (filter.type === t('common.order_status.title')) setSelectedStatuses(prev => prev.filter(v => v !== filter.value));
    else if (filter.type === t('pos.cart.payment_method')) setSelectedPayments(prev => prev.filter(v => v !== filter.value));
    else if (filter.type === t('common.volume.title')) setSelectedSizes(prev => prev.filter(v => v !== filter.value));
    else if (filter.type === t('common.period.title')) setDatePreset("All");
  };

  const statusDistribution = useMemo(() => {
    const total = processedOrders.length || 1;
    const counts = { "In Progress": 0, "Ready": 0, "Completed": 0 };
    processedOrders.forEach(o => { if (counts[o.orderStatus as keyof typeof counts] !== undefined) counts[o.orderStatus as keyof typeof counts]++; });
    return Object.entries(counts).map(([label, count]) => ({ label, percentage: (count / total) * 100, count }));
  }, [processedOrders]);

  const sortOptions = [
    { label: t('common.sort.date_time'), value: "createdAt" },
    { label: t('common.sort.price'), value: "total" },
    { label: t('common.sort.customer'), value: "customerName" },
    { label: t('common.sort.items'), value: "itemsCount" },
  ];

  return (
    <div className="mt-4 mb-6 relative">
      <div className="bg-[var(--bg-card)] w-full min-h-[600px] lg:h-[650px] 2xl:h-[850px] rounded-[3rem] border border-[var(--border-main)] shadow-2xl overflow-hidden flex flex-col transition-all duration-700">
        
        {/* Top Header - Analytics & Summary */}
        <div className="px-8 py-8 border-b border-[var(--border-main)]/50 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--primary)]/5 sticky top-0 z-30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <motion.div 
                whileHover={{ rotate: 180 }}
                className="bg-[var(--primary)] w-16 h-16 flex items-center justify-center rounded-[2rem] shadow-2xl shadow-[var(--primary)]/30 text-black transform transition-all duration-500"
              >
                <FaLayerGroup size={28} />
              </motion.div>
              <div>
                <h1 className="text-[var(--text-main)] text-2xl font-black uppercase tracking-tighter leading-none mb-2">
                  {t('pos.home.recent_orders')}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest">{t('common.items')}</span>
                    <span className="text-sm text-[var(--text-main)] font-black">{processedOrders.length}</span>
                  </div>
                  <div className="w-px h-8 bg-[var(--border-main)]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest">{t('pos.cart.total')}</span>
                    <span className="text-sm text-[var(--primary)] font-black">₹{filteredTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribution Bar */}
            <div className="flex-1 max-w-md hidden sm:block">
               <div className="flex justify-between items-end mb-2 px-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">{t('common.status_distribution')}</span>
                  <div className="flex gap-3">
                     {statusDistribution.map(d => (
                       <span key={d.label} className="text-[8px] font-bold uppercase text-[var(--text-muted)] flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${d.label === 'Completed' ? 'bg-emerald-400' : d.label === 'Ready' ? 'bg-indigo-400' : 'bg-amber-400'}`} />
                          {d.count}
                       </span>
                     ))}
                  </div>
               </div>
               <div className="h-2 w-full bg-[var(--bg-card-alt)] rounded-full overflow-hidden flex shadow-inner">
                  {statusDistribution.map(d => (
                    <motion.div 
                       key={d.label}
                       initial={{ width: 0 }}
                       animate={{ width: `${d.percentage}%` }}
                       className={`${d.label === 'Completed' ? 'bg-emerald-400' : d.label === 'Ready' ? 'bg-indigo-400' : 'bg-amber-400'} transition-all`}
                    />
                  ))}
               </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[var(--bg-card-alt)] rounded-2xl p-1.5 border border-[var(--border-main)] shadow-xl">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] outline-none px-4 py-2 cursor-pointer hover:text-[var(--text-main)] transition-colors"
                >
                   {sortOptions.map(opt => (
                     <option key={opt.value} value={opt.value} className="bg-[var(--bg-card)] text-[var(--text-main)]">{opt.label}</option>
                   ))}
                </select>
                <button 
                  onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                  className={`p-2.5 rounded-xl transition-all ${sortOrder === "desc" ? "bg-[var(--primary)] text-black shadow-lg" : "bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)]"}`}
                >
                  {sortOrder === "desc" ? <FaSortAmountDown size={14} /> : <FaSortAmountUp size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="px-8 py-6 bg-[var(--bg-card-alt)]/5 border-b border-[var(--border-main)]/50 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            <div className="flex-1 relative group">
              <FaSearch className="absolute start-5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] group-focus-within:text-[var(--primary)] transition-all duration-300" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('common.search_cluster')}
                className="w-full bg-[var(--bg-main)] rounded-[1.5rem] ps-14 pe-14 py-4.5 border-2 border-[var(--border-main)] focus:border-[var(--primary)] focus:ring-8 focus:ring-[var(--primary)]/5 outline-none text-[var(--text-main)] font-bold text-sm transition-all shadow-inner" 
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute end-5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-full">
                  <FaTimes size={14} />
                </button>
              )}
            </div>
            
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center justify-center gap-3 px-8 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all border-2 ${showAdvanced ? "bg-[var(--primary)] text-black border-[var(--primary)] shadow-2xl shadow-[var(--primary)]/20" : "bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-[var(--text-dim)] shadow-sm"}`}
            >
              <FaFilter size={12} />
              {t('common.filters')}
              {showAdvanced ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
            </button>
          </div>

          {/* Active Filter Chips */}
          <AnimatePresence>
            {activeFilters.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-wrap gap-2 pt-2"
              >
                {activeFilters.map((filter, i) => (
                  <motion.div 
                    key={`${filter.type}-${filter.value}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl group hover:bg-[var(--primary)]/20 transition-all cursor-default"
                  >
                     <span className="text-[9px] font-black uppercase tracking-widest text-[var(--primary)] opacity-60">{filter.type}:</span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">{filter.label}</span>
                     <button onClick={() => removeFilter(filter)} className="text-[var(--text-dim)] hover:text-red-500 transition-colors">
                        <FaTimes size={10} />
                     </button>
                  </motion.div>
                ))}
                <button 
                   onClick={() => { setSelectedStatuses([]); setSelectedPayments([]); setSelectedSizes([]); setDatePreset("All"); }}
                   className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:underline px-2"
                >
                   {t('common.clear_filters')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Advanced Drawer */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-[var(--bg-card)]/50 rounded-3xl mt-4 border border-[var(--border-main)]/30"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-8">
                  {/* Status Group */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)] flex items-center gap-2">
                        <FaSort className="text-[var(--primary)]" size={12} /> {t('common.order_status.title')}
                     </label>
                     <div className="flex flex-wrap gap-2">
                        {["In Progress", "Ready", "Completed"].map(status => {
                          const isSelected = selectedStatuses.includes(status);
                          const labelMap: any = { "In Progress": t('common.order_status.in_progress'), "Ready": t('common.order_status.ready'), "Completed": t('common.order_status.completed') };
                          return (
                            <button key={status} onClick={() => toggleFilter(selectedStatuses, setSelectedStatuses, status)} className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${isSelected ? "bg-[var(--primary)] text-black border-[var(--primary)] shadow-xl scale-105" : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-[var(--text-dim)]"}`}>
                               {labelMap[status]}
                            </button>
                          );
                        })}
                     </div>
                  </div>

                  {/* Payment Group */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)] flex items-center gap-2">
                        <FaWallet className="text-indigo-400" size={12} /> {t('pos.cart.payment_method')}
                     </label>
                     <div className="flex flex-wrap gap-2">
                        {[{v:"Cash", l:t('pos.cart.cash')}, {v:"Online", l:t('pos.cart.online')}].map(method => {
                          const isSelected = selectedPayments.includes(method.v);
                          return (
                            <button key={method.v} onClick={() => toggleFilter(selectedPayments, setSelectedPayments, method.v)} className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${isSelected ? "bg-indigo-500 text-white border-indigo-500 shadow-xl scale-105" : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-[var(--text-dim)]"}`}>
                               {method.l}
                            </button>
                          );
                        })}
                     </div>
                  </div>

                  {/* Volume Group */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)] flex items-center gap-2">
                        <FaUtensils className="text-emerald-400" size={12} /> {t('common.volume.title')}
                     </label>
                     <div className="flex flex-wrap gap-2">
                        {[{v:"Small", l:t('common.volume.small')}, {v:"Large", l:t('common.volume.large')}].map(size => {
                          const isSelected = selectedSizes.includes(size.v);
                          return (
                            <button key={size.v} onClick={() => toggleFilter(selectedSizes, setSelectedSizes, size.v)} className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${isSelected ? "bg-emerald-500 text-white border-emerald-500 shadow-xl scale-105" : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-[var(--text-dim)]"}`}>
                               {size.l}
                            </button>
                          );
                        })}
                     </div>
                  </div>

                  {/* Date Preset Group */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)] flex items-center gap-2">
                        <FaCalendarDay className="text-rose-400" size={12} /> {t('common.period.title')}
                     </label>
                     <div className="flex flex-wrap gap-2">
                        {[{v:"All", l:t('common.all')}, {v:"Today", l:t('common.period.today')}, {v:"Yesterday", l:t('common.period.yesterday')}].map(p => (
                          <button key={p.v} onClick={() => setDatePreset(p.v)} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${datePreset === p.v ? "bg-rose-500 text-white border-rose-500 shadow-xl scale-105" : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-[var(--text-dim)]"}`}>
                             {p.l}
                          </button>
                        ))}
                     </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-gradient-to-b from-[var(--bg-main)]/5 to-transparent">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-10">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-[12px] border-[var(--primary)]/10 rounded-[3rem] transform rotate-12" />
                <div className="absolute inset-0 border-[12px] border-t-[var(--primary)] rounded-[3rem] animate-spin transform rotate-12 shadow-[0_0_50px_var(--primary)]/20" />
              </div>
              <div className="flex flex-col items-center gap-2">
                 <p className="text-[12px] text-[var(--text-muted)] font-black uppercase tracking-[1em] animate-pulse">{t('common.scanning_grid')}</p>
                 <span className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-widest">{t('common.optimizing_data')}</span>
              </div>
            </div>
          ) : processedOrders.length > 0 ? (
            <motion.div 
               layout
               className="grid grid-cols-1 gap-6 pb-10"
            >
              {processedOrders.map((order: any) => (
                <OrderList key={order.id} order={order} onReprint={handleReprint} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center p-20 bg-[var(--bg-card)]/60 rounded-[4rem] border-4 border-dashed border-[var(--border-main)] shadow-inner"
            >
              <div className="w-40 h-40 bg-[var(--bg-card-alt)] rounded-[3.5rem] flex items-center justify-center mb-12 border border-[var(--border-main)] shadow-2xl group transition-all duration-500 hover:rotate-12">
                <FaSearch className="text-[var(--text-dim)]/10 group-hover:text-[var(--primary)]/20 transition-colors" size={72} />
              </div>
              <h3 className="text-[var(--text-main)] font-black uppercase tracking-[0.3em] text-2xl mb-6 leading-tight">
                {t('common.no_criteria_match')}
              </h3>
              <p className="text-[var(--text-dim)] text-xs font-bold uppercase max-w-[360px] leading-relaxed mb-12 opacity-70">
                {t('common.broaden_results')}
              </p>
              <button 
                onClick={() => { setSearchTerm(""); setSelectedStatuses([]); setSelectedPayments([]); setSelectedSizes([]); setDatePreset("All"); setSortBy("createdAt"); setSortOrder("desc"); }}
                className="px-16 py-6 bg-gradient-to-r from-[var(--primary)] to-yellow-600 text-black text-xs font-black rounded-3xl shadow-[0_20px_50px_var(--primary)]/20 uppercase tracking-[0.6em] hover:scale-110 active:scale-95 transition-all transform"
              >
                {t('common.restore_defaults')}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showReprintModal && selectedOrderForReprint && (
          <Invoice orderInfo={selectedOrderForReprint} setShowInvoice={setShowReprintModal} isReprint={true} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecentOrders;
