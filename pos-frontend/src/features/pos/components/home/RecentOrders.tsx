import React, { useState, useEffect, useMemo } from "react";
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaWallet, FaChevronDown, FaChevronUp, FaUtensils, FaCalendarDay, FaSort, FaTimes, FaLayerGroup, FaExpand, FaCompress } from "react-icons/fa";
import OrderList from "../menu/OrderList";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../../orders/api/orderApi";
import { motion, AnimatePresence } from "framer-motion";
import Invoice from "../../../orders/components/invoice/Invoice";
import usePOSStore from "../../store/usePOSStore";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";

const RecentOrders: React.FC = () => {
  const { t } = useTranslation();
  const [selectedOrderForReprint, setSelectedOrderForReprint] = useState<any>(null);
  const [showReprintModal, setShowReprintModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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

  const content = (
    <div className={`transition-all duration-700 ${isFullscreen ? "fixed inset-0 z-[9999] bg-black/60 p-2 backdrop-blur-2xl 2xl:p-8" : "relative mb-3 mt-1.5"}`}>
      <div className={`bg-[var(--bg-card)] w-full rounded-[2rem] border border-[var(--bg-card-alt)] shadow-2xl overflow-hidden flex flex-col transition-all duration-700 2xl:rounded-[2.5rem] ${isFullscreen ? "h-full w-full max-w-7xl mx-auto" : "min-h-[360px] lg:h-[508px] 2xl:h-[635px]"}`}>
        
        {/* Top Header - Analytics & Summary */}
        <div className="sticky top-0 z-30 border-b border-[var(--bg-card-alt)] bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--primary)]/5 px-3 py-2 2xl:px-5 2xl:py-4">
          <div className="flex flex-col justify-between gap-2 xl:flex-row xl:items-center xl:gap-3">
            <div className="flex items-center gap-2 2xl:gap-4">
              <motion.div 
                whileHover={{ rotate: 180 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-black shadow-md shadow-[var(--primary)]/25 transition-all duration-500 2xl:h-12 2xl:w-12 2xl:rounded-[1.75rem]"
              >
                <FaLayerGroup className="size-[18px] 2xl:size-6" />
              </motion.div>
              <div>
                <h1 className="mb-0.5 text-sm font-black uppercase leading-none tracking-tighter text-[var(--text-main)] 2xl:mb-1 2xl:text-lg">
                  {t('pos.home.recent_orders')}
                </h1>
                <div className="flex items-center gap-2 2xl:gap-4">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black uppercase tracking-widest text-[var(--text-dim)] 2xl:text-[9px]">{t('common.items')}</span>
                    <span className="text-[11px] font-black text-[var(--text-main)] 2xl:text-sm">{processedOrders.length}</span>
                  </div>
                  <div className="h-5 w-px bg-[var(--border-main)] 2xl:h-6" />
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black uppercase tracking-widest text-[var(--text-dim)] 2xl:text-[9px]">{t('pos.cart.total')}</span>
                    <span className="text-[11px] font-black text-[var(--primary)] 2xl:text-sm">₹{filteredTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribution Bar */}
            <div className="hidden max-w-[11rem] flex-1 sm:block 2xl:max-w-sm">
               <div className="mb-1 flex items-end justify-between px-0.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-dim)]">{t('common.status_distribution')}</span>
                  <div className="flex gap-2">
                     {statusDistribution.map(d => (
                       <span key={d.label} className="flex items-center gap-0.5 text-[7px] font-bold uppercase text-[var(--text-muted)]">
                          <div className={`h-1 w-1 rounded-full ${d.label === 'Completed' ? 'bg-emerald-400' : d.label === 'Ready' ? 'bg-indigo-400' : 'bg-amber-400'}`} />
                          {d.count}
                       </span>
                     ))}
                  </div>
               </div>
               <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-card-alt)] shadow-inner">
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

            <div className="flex items-center gap-1.5 2xl:gap-2">
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center justify-center rounded-xl border border-[var(--bg-card-alt)] bg-[var(--bg-card-alt)] p-1.5 text-[var(--text-muted)] shadow-sm transition-all hover:text-[var(--text-main)] 2xl:rounded-2xl 2xl:p-2.5"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <FaCompress className="size-3.5 2xl:size-4" /> : <FaExpand className="size-3.5 2xl:size-4" />}
              </button>

              <div className="flex items-center gap-0.5 rounded-xl border border-[var(--bg-card-alt)] bg-[var(--bg-card-alt)] p-0.5 shadow-sm 2xl:gap-1.5 2xl:rounded-2xl 2xl:p-1.5">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="cursor-pointer bg-transparent px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-[var(--text-muted)] outline-none transition-colors hover:text-[var(--text-main)] 2xl:px-3 2xl:py-1.5 2xl:text-[10px] 2xl:tracking-widest"
                >
                   {sortOptions.map(opt => (
                     <option key={opt.value} value={opt.value} className="bg-[var(--bg-card)] text-[var(--text-main)]">{opt.label}</option>
                   ))}
                </select>
                <button 
                  onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                  className={`rounded-xl p-1 transition-all 2xl:rounded-2xl 2xl:p-2 ${sortOrder === "desc" ? "bg-[var(--primary)] text-black shadow-md" : "border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-main)]"}`}
                >
                  {sortOrder === "desc" ? <FaSortAmountDown className="size-2.5 2xl:size-3.5" /> : <FaSortAmountUp className="size-2.5 2xl:size-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="space-y-1.5 border-b border-[var(--bg-card-alt)] bg-[var(--bg-card-alt)]/5 px-2.5 py-2 2xl:space-y-3 2xl:px-4 2xl:py-3">
          <div className="flex h-auto flex-col items-stretch gap-1.5 md:h-9 md:flex-row md:gap-1.5 2xl:h-11 2xl:gap-2">
            <div className="group relative h-9 flex-1 md:h-full">
              <FaSearch className="absolute start-2.5 top-1/2 size-3 -translate-y-1/2 text-[var(--text-dim)] transition-all duration-300 group-focus-within:text-[var(--primary)] 2xl:start-3.5 2xl:size-4" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('common.search_cluster')}
                className="h-full w-full rounded-2xl border border-[var(--bg-card-alt)] bg-[var(--bg-main)] py-1.5 ps-9 pe-9 text-xs font-bold text-[var(--text-main)] shadow-inner outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 2xl:rounded-[1.5rem] 2xl:py-2 2xl:ps-11 2xl:pe-11 2xl:text-[15px]" 
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--text-dim)] transition-colors hover:bg-red-500/10 hover:text-red-500 2xl:end-3 2xl:p-1.5">
                  <FaTimes className="size-2.5 2xl:size-3.5" />
                </button>
              )}
            </div>
            
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-2xl border px-3 text-[8px] font-black uppercase tracking-wider transition-all md:h-full md:gap-2 2xl:gap-2.5 2xl:rounded-[1.35rem] 2xl:px-5 2xl:text-[10px] 2xl:tracking-[0.15em] ${showAdvanced ? "border-[var(--primary)] bg-[var(--primary)] text-black shadow-md shadow-[var(--primary)]/15" : "border-[var(--border-main)] bg-[var(--bg-main)] text-[var(--text-muted)] shadow-sm hover:border-[var(--text-dim)]"}`}
            >
              <FaFilter className="size-3 shrink-0" />
              {t('common.filters')}
              {showAdvanced ? <FaChevronUp className="size-2.5" /> : <FaChevronDown className="size-2.5" />}
            </button>
          </div>

          {/* Active Filter Chips */}
          <AnimatePresence>
            {activeFilters.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-wrap gap-1 pt-0.5 2xl:gap-2 2xl:pt-1"
              >
                {activeFilters.map((filter, i) => (
                  <motion.div 
                    key={`${filter.type}-${filter.value}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="group flex cursor-default items-center gap-1 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-1.5 py-0.5 transition-all hover:bg-[var(--primary)]/20 2xl:gap-1.5 2xl:rounded-2xl 2xl:px-2.5 2xl:py-1"
                  >
                     <span className="text-[6px] font-black uppercase tracking-wide text-[var(--primary)] opacity-70 2xl:text-[8px] 2xl:tracking-widest">{filter.type}:</span>
                     <span className="text-[7px] font-black uppercase tracking-tight text-[var(--text-main)] 2xl:text-[9px] 2xl:tracking-wider">{filter.label}</span>
                     <button onClick={() => removeFilter(filter)} className="text-[var(--text-dim)] transition-colors hover:text-red-500">
                        <FaTimes className="size-2 2xl:size-3" />
                     </button>
                  </motion.div>
                ))}
                <button 
                   onClick={() => { setSelectedStatuses([]); setSelectedPayments([]); setSelectedSizes([]); setDatePreset("All"); }}
                   className="px-1 text-[7px] font-black uppercase tracking-wide text-red-500 hover:underline 2xl:px-1.5 2xl:text-[9px] 2xl:tracking-widest"
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
                className="mt-1.5 overflow-hidden rounded-2xl border border-[var(--border-main)]/30 bg-[var(--bg-card)]/50 2xl:mt-3 2xl:rounded-3xl"
              >
                <div className="grid grid-cols-1 gap-2.5 p-2.5 md:grid-cols-2 xl:grid-cols-4 xl:gap-3 2xl:gap-5 2xl:p-4">
                  {/* Status Group */}
                  <div className="space-y-1.5 2xl:space-y-3">
                     <label className="flex items-center gap-1 text-[7px] font-black uppercase tracking-[0.15em] text-[var(--text-dim)] 2xl:gap-1.5 2xl:text-[9px] 2xl:tracking-[0.25em]">
                        <FaSort className="text-[var(--primary)]" size={10} /> {t('common.order_status.title')}
                     </label>
                     <div className="flex flex-wrap gap-1.5">
                        {["In Progress", "Ready", "Completed"].map(status => {
                          const isSelected = selectedStatuses.includes(status);
                          const labelMap: any = { "In Progress": t('common.order_status.in_progress'), "Ready": t('common.order_status.ready'), "Completed": t('common.order_status.completed') };
                          return (
                            <button key={status} onClick={() => toggleFilter(selectedStatuses, setSelectedStatuses, status)} className={`rounded-xl border px-2 py-1 text-[7px] font-black uppercase transition-all 2xl:rounded-2xl 2xl:px-3 2xl:py-2 2xl:text-[9px] ${isSelected ? "scale-[1.02] border-[var(--primary)] bg-[var(--primary)] text-black shadow-md" : "border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--text-dim)]"}`}>
                               {labelMap[status]}
                            </button>
                          );
                        })}
                     </div>
                  </div>

                  {/* Payment Group */}
                  <div className="space-y-1.5 2xl:space-y-3">
                     <label className="flex items-center gap-1.5 text-[7px] font-black uppercase tracking-[0.15em] text-[var(--text-dim)] 2xl:text-[9px]">
                        <FaWallet className="text-indigo-400" size={10} /> {t('pos.cart.payment_method')}
                     </label>
                     <div className="flex flex-wrap gap-1.5">
                        {[{v:"Cash", l:t('pos.cart.cash')}, {v:"Online", l:t('pos.cart.online')}].map(method => {
                          const isSelected = selectedPayments.includes(method.v);
                          return (
                            <button key={method.v} onClick={() => toggleFilter(selectedPayments, setSelectedPayments, method.v)} className={`rounded-xl border px-2 py-1 text-[7px] font-black uppercase transition-all 2xl:rounded-2xl 2xl:px-3 2xl:py-2 2xl:text-[9px] ${isSelected ? "scale-[1.02] border-indigo-500 bg-indigo-500 text-white shadow-md" : "border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--text-dim)]"}`}>
                               {method.l}
                            </button>
                          );
                        })}
                     </div>
                  </div>

                  {/* Volume Group */}
                  <div className="space-y-1.5 2xl:space-y-3">
                     <label className="flex items-center gap-1.5 text-[7px] font-black uppercase tracking-[0.15em] text-[var(--text-dim)] 2xl:text-[9px]">
                        <FaUtensils className="text-emerald-400" size={10} /> {t('common.volume.title')}
                     </label>
                     <div className="flex flex-wrap gap-1.5">
                        {[{v:"Small", l:t('common.volume.small')}, {v:"Large", l:t('common.volume.large')}].map(size => {
                          const isSelected = selectedSizes.includes(size.v);
                          return (
                            <button key={size.v} onClick={() => toggleFilter(selectedSizes, setSelectedSizes, size.v)} className={`rounded-xl border px-2 py-1 text-[7px] font-black uppercase transition-all 2xl:rounded-2xl 2xl:px-3 2xl:py-2 2xl:text-[9px] ${isSelected ? "scale-[1.02] border-emerald-500 bg-emerald-500 text-white shadow-md" : "border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--text-dim)]"}`}>
                               {size.l}
                            </button>
                          );
                        })}
                     </div>
                  </div>

                  {/* Date Preset Group */}
                  <div className="space-y-1.5 2xl:space-y-3">
                     <label className="flex items-center gap-1.5 text-[7px] font-black uppercase tracking-[0.15em] text-[var(--text-dim)] 2xl:text-[9px]">
                        <FaCalendarDay className="text-rose-400" size={10} /> {t('common.period.title')}
                     </label>
                     <div className="flex flex-wrap gap-1.5">
                        {[{v:"All", l:t('common.all')}, {v:"Today", l:t('common.period.today')}, {v:"Yesterday", l:t('common.period.yesterday')}].map(p => (
                          <button key={p.v} onClick={() => setDatePreset(p.v)} className={`rounded-xl border px-2.5 py-1 text-[7px] font-black uppercase transition-all 2xl:rounded-2xl 2xl:px-3.5 2xl:py-2 2xl:text-[9px] ${datePreset === p.v ? "scale-[1.02] border-rose-500 bg-rose-500 text-white shadow-md" : "border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--text-dim)]"}`}>
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
        <div className="custom-scrollbar flex-1 overflow-y-auto bg-gradient-to-b from-[var(--bg-main)]/5 to-transparent p-2 2xl:p-4">
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 2xl:gap-8">
              <div className="relative h-16 w-16 2xl:h-24 2xl:w-24">
                <div className="absolute inset-0 rotate-12 rounded-[1.5rem] border-[6px] border-[var(--primary)]/10 2xl:rounded-[2.5rem] 2xl:border-[10px]" />
                <div className="absolute inset-0 rotate-12 animate-spin rounded-[1.5rem] border-[6px] border-t-[var(--primary)] shadow-[0_0_24px_var(--primary)]/12 2xl:rounded-[2.5rem] 2xl:border-[10px]" />
              </div>
              <div className="flex flex-col items-center gap-1">
                 <p className="animate-pulse text-[9px] font-black uppercase tracking-[0.35em] text-[var(--text-muted)] 2xl:text-[11px] 2xl:tracking-[0.65em]">{t('common.scanning_grid')}</p>
                 <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-dim)]">{t('common.optimizing_data')}</span>
              </div>
            </div>
          ) : processedOrders.length > 0 ? (
            <motion.div 
               layout
               className={`grid gap-2 pb-4 2xl:gap-3 2xl:pb-8 ${isFullscreen ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}
            >
              {processedOrders.map((order: any) => (
                <OrderList key={order.id} order={order} onReprint={handleReprint} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-full flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[var(--border-main)] bg-[var(--bg-card)]/60 p-5 text-center shadow-inner 2xl:rounded-[2.5rem] 2xl:p-12"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card-alt)] shadow-md transition-all duration-500 group hover:rotate-6 2xl:mb-8 2xl:h-28 2xl:w-28 2xl:rounded-[1.75rem]">
                <FaSearch className="text-[var(--text-dim)]/15 transition-colors group-hover:text-[var(--primary)]/25" size={32} />
              </div>
              <h3 className="mb-2 text-sm font-black uppercase leading-tight tracking-[0.12em] text-[var(--text-main)] 2xl:mb-4 2xl:text-lg 2xl:tracking-[0.2em]">
                {t('common.no_criteria_match')}
              </h3>
              <p className="mb-4 max-w-[260px] text-[9px] font-bold uppercase leading-relaxed text-[var(--text-dim)] opacity-70 2xl:mb-8 2xl:max-w-[320px] 2xl:text-xs">
                {t('common.broaden_results')}
              </p>
              <button 
                onClick={() => { setSearchTerm(""); setSelectedStatuses([]); setSelectedPayments([]); setSelectedSizes([]); setDatePreset("All"); setSortBy("createdAt"); setSortOrder("desc"); }}
                className="rounded-2xl bg-gradient-to-r from-[var(--primary)] to-yellow-600 px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.28em] text-black shadow-md shadow-[var(--primary)]/15 transition-all hover:scale-[1.03] active:scale-95 2xl:rounded-3xl 2xl:px-10 2xl:py-4 2xl:text-xs 2xl:tracking-[0.45em]"
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

  if (isFullscreen) {
    return createPortal(content, document.body);
  }

  return content;
};

export default RecentOrders;
