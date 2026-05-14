import React, { useState, useEffect } from "react";
import { MdTableBar, MdCategory, MdAddCircleOutline, MdSpaceDashboard, MdStore } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { FaHistory, FaWallet, FaUsers } from "react-icons/fa";
import Metrics from "../components/Metrics";
import RecentOrders from "../components/RecentOrders";
import Management from "../components/Management";
import CustomerList from "../../customers/components/CustomerList";
import ManagementModal from "../components/ManagementModal";
import CustomDropdown from "../../../shared/components/CustomDropdown";
import useAuth from "../../auth/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getBranches } from "../api/dashboardApi";
import { useTranslation } from "react-i18next";

import ConfigDashboard from "../../product-configurator/admin/pages/ConfigDashboard";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { canManageSettings } = useAuth();
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: string }>({ isOpen: false, type: "" });
  const [activeTab, setActiveTab] = useState("Metrics");
  const [selectedBranchId, setSelectedBranchId] = useState("all");

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => { const res = await getBranches(); return res.data.data || res.data; }
  });

  useEffect(() => {
    document.title = "POS | Management Center";
  }, []);

  const buttons = [
    { label: t('dashboard.quick_add.table'), icon: <MdTableBar />, action: "table", color: "from-blue-500 to-indigo-600" },
    { label: t('dashboard.quick_add.category'), icon: <MdCategory />, action: "category", color: "from-purple-500 to-pink-600" },
    { label: t('dashboard.quick_add.dish'), icon: <BiSolidDish />, action: "dishes", color: "from-orange-500 to-red-600" },
  ];

  const tabs = [
    { id: "Metrics", label: t('dashboard.tabs.analytics'), icon: <MdSpaceDashboard /> },
    { id: "Management", label: t('dashboard.tabs.management'), icon: <MdCategory /> },
    { id: "Configurator", label: "Product Config", icon: <MdStore /> },
    { id: "Customers", label: t('dashboard.tabs.customers'), icon: <FaUsers /> },
    { id: "Orders", label: t('dashboard.tabs.order_history'), icon: <FaHistory /> },
    { id: "Payments", label: t('dashboard.tabs.transactions'), icon: <FaWallet /> },
  ];

  const handleOpenModal = (action: string) => {
    setActiveTab("Management");
    setModalState({ isOpen: true, type: action });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, type: "" });
  };

  const branchOptions = [
    { id: "all", name: t('dashboard.all_branches') },
    ...(branches || []).map((b: any) => ({ id: b.id, name: b.name }))
  ];

  return (
    <div className="bg-[var(--bg-main)] min-h-[calc(100vh-5rem)] pb-20 overflow-y-auto">
      {/* Top Banner / Hero */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-main)] shadow-sm">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-black tracking-widest px-2 py-1 rounded-md uppercase">{t('dashboard.badge')}</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase"
            >
              {t('dashboard.title')}
            </motion.h1>
            <p className="text-[var(--text-muted)] mt-1 text-sm font-medium">{t('dashboard.subtitle')}</p>
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
                className={`bg-gradient-to-br ${color} px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-xl transition-all border border-white/10 h-[44px]`}
              >
                <MdAddCircleOutline size={18} />
                {t('dashboard.add')} {label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="container mx-auto px-6 mt-6">
        <div className="flex items-center bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-main)] w-fit overflow-x-auto no-scrollbar max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`
                px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                  ? "bg-[var(--primary)] text-[var(--bg-card)] shadow-lg shadow-[var(--primary)]/20"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-alt)]"
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
      <div className="container mx-auto px-6 mt-6">
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
            {activeTab === "Configurator" && <ConfigDashboard />}
            {activeTab === "Customers" && <CustomerList />}
            {activeTab === "Orders" && <RecentOrders branchId={selectedBranchId} />}
            {activeTab === "Payments" && (
              <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl p-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-[var(--bg-card-alt)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-main)]">
                  <FaWallet className="text-[var(--text-muted)]" size={30} />
                </div>
                <h3 className="text-[var(--text-main)] text-xl font-bold">{t('dashboard.payments_soon')}</h3>
                <p className="text-[var(--text-muted)] mt-2 max-w-sm">{t('dashboard.payments_soon_desc')}</p>
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
