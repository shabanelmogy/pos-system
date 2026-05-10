import React, { useState, useEffect } from "react";
import { MdTableBar, MdCategory, MdAddCircleOutline, MdSpaceDashboard, MdStore } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { FaHistory, FaWallet, FaUsers } from "react-icons/fa";
import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import Management from "../components/dashboard/Management";
import CustomerList from "../components/dashboard/CustomerList";
import ManagementModal from "../components/dashboard/ManagementModal";
import CustomDropdown from "../components/shared/CustomDropdown";
import useAuth from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getBranches } from "../https";

const buttons = [
  { label: "Table", icon: <MdTableBar />, action: "table", color: "from-blue-500 to-indigo-600" },
  { label: "Category", icon: <MdCategory />, action: "category", color: "from-purple-500 to-pink-600" },
  { label: "Dish", icon: <BiSolidDish />, action: "dishes", color: "from-orange-500 to-red-600" },
];

const tabs = [
  { id: "Metrics", label: "Analytics", icon: <MdSpaceDashboard /> },
  { id: "Management", label: "Management", icon: <MdCategory /> },
  { id: "Customers", label: "Customers", icon: <FaUsers /> },
  { id: "Orders", label: "Order History", icon: <FaHistory /> },
  { id: "Payments", label: "Transactions", icon: <FaWallet /> },
];

const Dashboard = () => {
  const { canManageSettings } = useAuth();
  const [modalState, setModalState] = useState({ isOpen: false, type: "" });
  const [activeTab, setActiveTab] = useState("Metrics");
  const [selectedBranchId, setSelectedBranchId] = useState("all");

  const { data: branches } = useQuery({ 
    queryKey: ["branches"], 
    queryFn: async () => (await getBranches()).data.data 
  });

  useEffect(() => {
    document.title = "POS | Management Center";
  }, []);

  const handleOpenModal = (action) => {
    setActiveTab("Management");
    setModalState({ isOpen: true, type: action });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, type: "" });
  };

  const branchOptions = [
    { id: "all", name: "All Branches" },
    ...(branches || []).map(b => ({ id: b.id, name: b.name }))
  ];

  return (
    <div className="bg-[#121212] min-h-[calc(100vh-5rem)] pb-20 overflow-y-auto">
      {/* Top Banner / Hero */}
      <div className="bg-[#1a1a1a] border-b border-[#333]">
        <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#f6b100]/10 text-[#f6b100] text-[10px] font-black tracking-widest px-2 py-1 rounded-md uppercase">Enterprise Dashboard</span>
            </div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase"
            >
              Management Center
            </motion.h1>
            <p className="text-[#ababab] mt-2 font-medium">Full control over your restaurant infrastructure and inventory.</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            {/* Branch Filter */}
            <CustomDropdown 
              options={branchOptions}
              value={selectedBranchId}
              onChange={setSelectedBranchId}
              icon={<MdStore size={20} />}
            />

            {canManageSettings && buttons.map(({ label, icon, action, color }) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={action}
                onClick={() => handleOpenModal(action)}
                className={`bg-gradient-to-br ${color} px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all border border-white/10 h-[52px]`}
              >
                <MdAddCircleOutline size={18} />
                Add {label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="container mx-auto px-6 mt-10">
        <div className="flex items-center bg-[#1a1a1a] p-1.5 rounded-2xl border border-[#333] w-fit overflow-x-auto no-scrollbar max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`
                px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#f6b100] text-[#1a1a1a] shadow-lg shadow-[#f6b100]/20"
                  : "text-[#ababab] hover:text-[#f5f5f5] hover:bg-[#262626]"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + selectedBranchId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "Metrics" && <Metrics branchId={selectedBranchId} />}
            {activeTab === "Management" && <Management />}
            {activeTab === "Customers" && <CustomerList />}
            {activeTab === "Orders" && <RecentOrders branchId={selectedBranchId} />}
            {activeTab === "Payments" && (
              <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-[#262626] rounded-full flex items-center justify-center mb-6 border border-[#444]">
                  <FaWallet className="text-[#ababab]" size={30} />
                </div>
                <h3 className="text-[#f5f5f5] text-xl font-bold">Transaction History Coming Soon</h3>
                <p className="text-[#ababab] mt-2 max-w-sm">We are integrating deeper payment analytics into your dashboard.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <ManagementModal 
        isOpen={modalState.isOpen} 
        type={modalState.type} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default Dashboard;
