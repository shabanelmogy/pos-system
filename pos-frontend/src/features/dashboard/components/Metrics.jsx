import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrders, getCustomers, getItems, getCategories, getTables } from "../api/dashboardApi";
import { FaArrowUp, FaArrowDown, FaUsers, FaUtensils, FaChartLine, FaCheckCircle, FaMoneyBillWave } from "react-icons/fa";
import { motion } from "framer-motion";

const MetricCard = ({ title, value, percentage, icon, color, isIncrease, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -4, scale: 1.01 }}
    className="bg-[var(--bg-card)] border border-[var(--border-main)] p-5 rounded-3xl relative overflow-hidden group hover:border-[var(--primary)]/30 transition-all shadow-xl"
  >
    <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${color} opacity-[0.03] blur-3xl group-hover:opacity-10 transition-opacity`} />
    
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-3.5 rounded-xl bg-gradient-to-br ${color} text-white shadow-2xl transform group-hover:rotate-6 transition-transform`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${isIncrease ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]' : 'bg-[var(--status-error-bg)] text-[var(--status-error)]'}`}>
        {isIncrease ? <FaArrowUp /> : <FaArrowDown />}
        {percentage}
      </div>
    </div>
    
    <div className="mt-6 relative z-10">
      <p className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-[var(--text-main)] text-3xl font-black mt-1 tracking-tighter group-hover:text-[var(--primary)] transition-colors">{value}</h3>
    </div>
    
    <div className="mt-6 w-full h-1.5 bg-[var(--bg-card-alt)] rounded-full overflow-hidden relative z-10">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "75%" }}
        transition={{ duration: 1.5, delay: delay + 0.5 }}
        className={`h-full bg-gradient-to-r ${color} rounded-full`} 
      />
    </div>
  </motion.div>
);

const Metrics = ({ branchId = "all" }) => {
  const { data: orders } = useQuery({ queryKey: ["orders"], queryFn: async () => { const res = await getOrders(); return res.data.data || res.data; } });
  const { data: customers } = useQuery({ queryKey: ["customers"], queryFn: async () => { const res = await getCustomers(); return res.data.data || res.data; } });
  const { data: items } = useQuery({ queryKey: ["items"], queryFn: async () => { const res = await getItems(); return res.data.data || res.data; } });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: async () => { const res = await getCategories(); return res.data.data || res.data; } });
  const { data: tables } = useQuery({ queryKey: ["tables"], queryFn: async () => { const res = await getTables(); return res.data.data || res.data; } });

  const fullOrdersList = Array.isArray(orders) ? orders : [];
  const ordersList = fullOrdersList.filter(order => {
    if (branchId === "all") return true;
    return order.branchId === branchId;
  });

  const customersList = Array.isArray(customers) ? customers : [];
  const itemsList = Array.isArray(items) ? items : [];
  const categoriesList = Array.isArray(categories) ? categories : [];
  const tablesList = Array.isArray(tables) ? tables : [];

  const totalRevenue = ordersList.reduce((acc, order) => acc + parseFloat(order.total || 0), 0);
  const activeOrders = ordersList.filter(o => o.orderStatus !== "Completed").length;
  const completedOrders = ordersList.filter(o => o.orderStatus === "Completed").length;

  const performanceMetrics = [
    { 
      title: "Gross Revenue", 
      value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 
      percentage: "12.5%", 
      icon: <FaMoneyBillWave size={24} />, 
      color: "from-emerald-500 to-green-600", 
      isIncrease: true 
    },
    { 
      title: "Total Volume", 
      value: ordersList.length.toString(), 
      percentage: "4.2%", 
      icon: <FaChartLine size={24} />, 
      color: "from-blue-500 to-indigo-600", 
      isIncrease: true 
    },
    { 
      title: "Active Users", 
      value: customersList.length.toString(), 
      percentage: "18%", 
      icon: <FaUsers size={24} />, 
      color: "from-orange-500 to-amber-600", 
      isIncrease: true 
    },
    { 
      title: "Success Rate", 
      value: `${ordersList.length > 0 ? Math.round((completedOrders / ordersList.length) * 100) : 0}%`, 
      percentage: "2%", 
      icon: <FaCheckCircle size={24} />, 
      color: "from-violet-500 to-purple-600", 
      isIncrease: true 
    },
  ];

  const inventoryStats = [
    { label: "Total Categories", value: categoriesList.length, color: "bg-blue-500" },
    { label: "Active Dishes", value: itemsList.length, color: "bg-orange-500" },
    { label: "Table Capacity", value: tablesList.length, color: "bg-green-500" },
    { label: "Pending Tickets", value: activeOrders, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="h-1 w-6 bg-[var(--primary)] rounded-full"></div>
             <span className="text-[var(--primary)] text-[9px] font-black uppercase tracking-[0.3em]">Operational Insights</span>
          </div>
          <h2 className="text-[var(--text-main)] text-2xl font-black tracking-tighter uppercase">
            {branchId === "all" ? "Enterprise Pulse" : "Branch Performance"}
          </h2>
          <p className="text-[var(--text-muted)] text-xs mt-0.5 font-medium">Real-time financial telemetry.</p>
        </div>
        <div className="flex items-center gap-4 bg-[var(--bg-card)] p-2 rounded-2xl border border-[var(--border-main)]">
           <div className="px-4 py-2 bg-[var(--bg-card-alt)] rounded-xl text-[var(--text-main)] text-[10px] font-black uppercase tracking-widest border border-[var(--border-main)]">
              Data Stream: Active
           </div>
           <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
           </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} delay={index * 0.1} />
        ))}
      </div>

      {/* Secondary Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Summary */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-6 rounded-3xl lg:col-span-1 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
             <div className="p-2.5 bg-[var(--bg-card-alt)] rounded-xl text-[var(--primary)]">
                <FaUtensils size={20} />
             </div>
             <h3 className="text-white text-lg font-black uppercase tracking-tighter">Infrastructure</h3>
          </div>
          <div className="space-y-5">
            {inventoryStats.map((stat, idx) => (
              <div key={idx} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest group-hover:text-[var(--text-main)] transition-colors">{stat.label}</span>
                  <span className="text-[var(--text-main)] font-black text-xl group-hover:text-[var(--primary)] transition-colors">{stat.value}</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--bg-card-alt)] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1.5, delay: idx * 0.2 }}
                    className={`h-full ${stat.color} rounded-full`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] p-6 rounded-3xl lg:col-span-2 relative overflow-hidden group shadow-2xl hover:border-[var(--primary)]/20 transition-all">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-[var(--text-main)] text-lg font-black uppercase tracking-tighter">Revenue Trajectory</h3>
              <p className="text-[var(--text-dim)] text-[10px] font-bold uppercase tracking-widest mt-0.5">Rolling cycle</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]" />
                 <span className="text-[10px] text-[var(--text-main)] font-black uppercase">Current</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full bg-[var(--border-main)]" />
                 <span className="text-[10px] text-[var(--text-dim)] font-black uppercase">Goal</span>
              </div>
            </div>
          </div>
          
          <div className="h-48 flex items-end justify-between gap-3 px-2">
            {[45, 65, 50, 85, 70, 95, 60, 100, 80, 110].map((h, i) => (
              <div key={i} className="relative flex-1 group/bar">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(h/120)*100}%` }}
                  transition={{ duration: 1.5, delay: i * 0.05, ease: "circOut" }}
                  className="w-full bg-gradient-to-t from-[var(--primary)]/10 via-[var(--primary)]/40 to-[var(--primary)] rounded-xl relative z-10"
                />
                <motion.div 
                   initial={{ height: 0 }}
                   animate={{ height: "100%" }}
                   className="absolute bottom-0 left-0 right-0 bg-[var(--bg-card-alt)] rounded-xl opacity-20 border border-[var(--border-main)]"
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-[var(--text-main)] text-[var(--bg-card)] px-2 py-1 rounded text-[10px] font-black z-20 shadow-xl">
                   ₹{h}k
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-between text-[var(--text-dim)] text-[9px] font-black uppercase tracking-widest border-t border-[var(--bg-card-alt)] pt-6">
            <span>Cycle 01</span><span>Cycle 02</span><span>Cycle 03</span><span>Cycle 04</span><span>Cycle 05</span><span>Cycle 06</span><span>Cycle 07</span><span>Cycle 08</span><span>Cycle 09</span><span>Cycle 10</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
