import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrders, getCustomers, getItems, getCategories, getTables } from "../../https";
import { FaArrowUp, FaArrowDown, FaUsers, FaUtensils, FaChartLine, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const MetricCard = ({ title, value, percentage, icon, color, isIncrease }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-[#1a1a1a] border border-[#333] p-6 rounded-3xl relative overflow-hidden group hover:border-[#444] transition-all"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`} />
    
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${isIncrease ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
        {isIncrease ? <FaArrowUp /> : <FaArrowDown />}
        {percentage}
      </div>
    </div>
    
    <div className="mt-6">
      <p className="text-[#ababab] text-xs font-bold uppercase tracking-widest">{title}</p>
      <h3 className="text-white text-3xl font-black mt-1 tracking-tighter">{value}</h3>
    </div>
    
    <div className="mt-4 w-full h-1 bg-[#262626] rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "70%" }}
        transition={{ duration: 1, delay: 0.5 }}
        className={`h-full bg-gradient-to-r ${color}`} 
      />
    </div>
  </motion.div>
);

const Metrics = () => {
  // Fetch Real Data
  const { data: orders } = useQuery({ queryKey: ["orders"], queryFn: async () => (await getOrders()).data.data });
  const { data: customers } = useQuery({ queryKey: ["customers"], queryFn: async () => (await getCustomers()).data.data });
  const { data: items } = useQuery({ queryKey: ["items"], queryFn: async () => (await getItems()).data.data });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: async () => (await getCategories()).data.data });
  const { data: tables } = useQuery({ queryKey: ["tables"], queryFn: async () => (await getTables()).data.data });

  // Calculations
  const ordersList = Array.isArray(orders) ? orders : [];
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
      percentage: "12%", 
      icon: <FaChartLine size={20} />, 
      color: "from-green-500 to-emerald-600", 
      isIncrease: true 
    },
    { 
      title: "Total Orders", 
      value: ordersList.length.toString(), 
      percentage: "8%", 
      icon: <FaUtensils size={20} />, 
      color: "from-blue-500 to-indigo-600", 
      isIncrease: true 
    },
    { 
      title: "Active Customers", 
      value: customersList.length.toString(), 
      percentage: "15%", 
      icon: <FaUsers size={20} />, 
      color: "from-orange-500 to-red-600", 
      isIncrease: true 
    },
    { 
      title: "Completed", 
      value: completedOrders.toString(), 
      percentage: "95%", 
      icon: <FaCheckCircle size={20} />, 
      color: "from-purple-500 to-violet-600", 
      isIncrease: true 
    },
  ];

  const inventoryStats = [
    { label: "Categories", value: categoriesList.length },
    { label: "Dishes", value: itemsList.length },
    { label: "Active Tables", value: tablesList.length },
    { label: "Open Orders", value: activeOrders },
  ];

  return (
    <div className="space-y-10">
      {/* Performance Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[#f5f5f5] text-xl font-bold tracking-tight">Business Intelligence</h2>
            <p className="text-[#ababab] text-sm font-medium">Tracking your restaurant's growth and financial health.</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333] px-4 py-2 rounded-xl text-[#f5f5f5] text-xs font-bold">
            LIVE UPDATE
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceMetrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Secondary Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory Summary */}
        <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-3xl lg:col-span-1">
          <h3 className="text-white text-lg font-bold mb-6">Operations Hub</h3>
          <div className="space-y-6">
            {inventoryStats.map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-[#ababab] font-medium">{stat.label}</span>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-24 bg-[#262626] rounded-full overflow-hidden">
                    <div className="h-full bg-[#f6b100] w-2/3" />
                  </div>
                  <span className="text-white font-black text-lg">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Placeholder for Growth Chart */}
        <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-3xl lg:col-span-2 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-white text-lg font-bold">Revenue Growth</h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="w-3 h-3 rounded-full bg-blue-500" />
            </div>
          </div>
          
          <div className="h-40 flex items-end justify-between gap-2 px-4">
            {[40, 70, 45, 90, 65, 80, 50, 85, 60, 100].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="w-full bg-gradient-to-t from-[#f6b100]/20 to-[#f6b100] rounded-t-md opacity-80 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
          
          <div className="mt-6 flex justify-between text-[#555] text-[10px] font-black uppercase tracking-tighter">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
