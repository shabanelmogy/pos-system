import React, { useState, useEffect, useMemo } from "react";
import { MdTableBar, MdCategory, MdAddCircleOutline, MdSpaceDashboard, MdStore, MdFolderOpen } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { FaHistory, FaWallet, FaUsers } from "react-icons/fa";
import Metrics from "../components/Metrics";
import RecentOrders from "../components/RecentOrders";
import Management from "../components/Management";
import CustomerList from "../../customers/components/CustomerList";
import ManagementModal from "../components/ManagementModal";
import ShortageMonitor from "../components/ShortageMonitor";
import CustomDropdown from "../../../shared/components/CustomDropdown";
import useAuth from "../../auth/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getBranches } from "../api/dashboardApi";
import { useTranslation } from "react-i18next";
import { MenuTreeList } from "../components/management/MenuTreeList";
import TableList from "../components/management/TableList";
import BranchList from "../components/management/BranchList";
import POSPointList from "../components/management/POSPointList";
import StaffList from "../components/management/StaffList";
import CouponList from "../components/management/CouponList";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import { useManagement } from "../hooks/useManagement";
import { TreeView, TreeNodeData } from "../../../shared/components/TreeView";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { canManageSettings } = useAuth();
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: string }>({ isOpen: false, type: "" });
  const [activeTab, setActiveTab] = useState("Metrics");
  const [selectedBranchId, setSelectedBranchId] = useState("all");

  const {
    confirmModal, openConfirm, closeConfirm, handleConfirmAction,
    editModal, closeEditModal, openEditModal,
    handleManualRefresh,
    isDeleting,
    data,
    status
  } = useManagement();

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

  const navTreeData = useMemo<TreeNodeData[]>(() => [
    {
      id: "insights-group",
      label: "Operational Insights",
      type: "folder",
      icon: <MdFolderOpen className="text-amber-500" size={15} />,
      children: [
        {
          id: "Metrics",
          label: t('dashboard.tabs.analytics'),
          type: "nav",
          icon: <MdSpaceDashboard size={13} className="text-[var(--primary)]" />,
        },
        {
          id: "Orders",
          label: t('dashboard.tabs.order_history'),
          type: "nav",
          icon: <FaHistory size={13} className="text-[var(--primary)]" />,
        }
      ]
    },
    {
      id: "management-folder",
      label: "Management Control",
      type: "folder",
      icon: <MdFolderOpen className="text-emerald-500" size={15} />,
      children: [
        {
          id: "Management",
          label: "Master Directory Tree",
          type: "nav",
          icon: <MdCategory size={13} className="text-emerald-400" />,
        },
        {
          id: "MenuTree",
          label: "Menu Tree Only",
          type: "nav",
          icon: <BiSolidDish size={13} className="text-amber-400" />,
        },
        {
          id: "Tables",
          label: "Dining Tables Map",
          type: "nav",
          icon: <MdTableBar size={13} className="text-blue-400" />,
        },
        {
          id: "Branches",
          label: "Branch Directories",
          type: "nav",
          icon: <MdStore size={13} className="text-teal-400" />,
        },
        {
          id: "POSPoints",
          label: "POS Hardware Terminals",
          type: "nav",
          icon: <MdSpaceDashboard size={13} className="text-indigo-400" />,
        },
        {
          id: "Users",
          label: "Staff & Active Members",
          type: "nav",
          icon: <FaUsers size={13} className="text-pink-400" />,
        },
        {
          id: "Coupons",
          label: "Promotional Coupons",
          type: "nav",
          icon: <FaWallet size={13} className="text-red-400" />,
        }
      ]
    },
    {
      id: "directory-group",
      label: "Enterprise CRM & Logs",
      type: "folder",
      icon: <MdFolderOpen className="text-blue-500" size={15} />,
      children: [
        {
          id: "Customers",
          label: t('dashboard.tabs.customers'),
          type: "nav",
          icon: <FaUsers size={13} className="text-emerald-400" />,
        },
        {
          id: "Shortage",
          label: t('dashboard.shortage.tab_title'),
          type: "nav",
          icon: <FaWallet size={13} className="text-indigo-400" />,
        }
      ]
    }
  ], [t]);

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
        <div className="container mx-auto px-3 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
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

      {/* Dashboard Main Grid Layout */}
      <div className="container mx-auto px-3 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Console Navigation Sidebar TreeView */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <div className="sticky top-[6.5rem]">
            <TreeView
              data={navTreeData}
              showSearch={false}
              headerTitle="Console Directory"
              headerSubtitle="Enterprise Portal Navigation"
              emptyLabel="No console groups found."
              onNodeClick={(node) => {
                if (node.type === "nav") {
                  setActiveTab(node.id);
                }
              }}
              selectedNodeId={activeTab}
            />
          </div>
        </div>

        {/* Right Column: Dynamic Content Panel */}
        <div className="lg:col-span-9 flex flex-col h-full min-h-[550px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + selectedBranchId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === "Metrics" && <Metrics branchId={selectedBranchId} />}
              {activeTab === "MenuTree" && (
                <MenuTreeList
                  categories={data.categories}
                  items={data.items}
                  loading={status.loadingCategories || status.loadingItems}
                  error={status.errorCategories || status.errorItems}
                  onEdit={openEditModal}
                  onDelete={openConfirm}
                  onRetry={handleManualRefresh}
                />
              )}
              {activeTab === "Management" && <Management />}
              {activeTab === "Customers" && <CustomerList />}
              {activeTab === "Orders" && <RecentOrders branchId={selectedBranchId} />}
              {activeTab === "Shortage" && <ShortageMonitor branchId={selectedBranchId} />}
              
              {/* Direct sidebar views for individual management directories */}
              {activeTab === "Tables" && (
                <TableList 
                  data={data.tables} 
                  loading={status.loadingTables} 
                  error={status.errorTables} 
                  onEdit={openEditModal}
                  onDelete={openConfirm}
                  onRetry={handleManualRefresh}
                  itemVariants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                />
              )}
              {activeTab === "Branches" && (
                <BranchList 
                  data={data.branches} 
                  loading={status.loadingBranches} 
                  error={status.errorBranches} 
                  onEdit={openEditModal}
                  onRetry={handleManualRefresh}
                  itemVariants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                />
              )}
              {activeTab === "POSPoints" && (
                <POSPointList 
                  data={data.posPoints} 
                  loading={status.loadingPOSPoints} 
                  error={status.errorPOSPoints} 
                  onEdit={openEditModal}
                  onRetry={handleManualRefresh}
                  itemVariants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                />
              )}
              {activeTab === "Users" && (
                <StaffList 
                  data={data.usersData} 
                  loading={status.loadingUsers} 
                  error={status.errorUsers} 
                  onEdit={openEditModal}
                  onDelete={openConfirm}
                  onRetry={handleManualRefresh}
                  searchQuery=""
                />
              )}
              {activeTab === "Coupons" && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2rem] p-8 shadow-sm">
                  <CouponList 
                    onAdd={() => openEditModal("coupon")}
                    onEdit={(coupon) => openEditModal("coupon", coupon)}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      <ManagementModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        onClose={handleCloseModal}
      />

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        title={t('dashboard.management.confirm_delete.title')}
        message={t('dashboard.management.confirm_delete.message', { name: confirmModal.name })}
        confirmText={isDeleting ? t('dashboard.management.confirm_delete.deleting') : t('dashboard.management.confirm_delete.delete_permanently')}
        type="danger"
      />

      <ManagementModal
        isOpen={editModal.isOpen}
        type={editModal.type}
        initialData={editModal.data}
        onClose={closeEditModal}
      />
    </div>
  );
};

export default Dashboard;
