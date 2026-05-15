import React from "react";
import { MdTableBar, MdCategory, MdRestaurantMenu, MdStore, MdComputer, MdPeople } from "react-icons/md";
import { FaTag } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import ManagementModal from "./ManagementModal";
import { useTranslation } from "react-i18next";

// Custom Hook
import { useManagement } from "../hooks/useManagement";

// Sub-components
import ManagementHeader from "./management/ManagementHeader";
import TableList from "./management/TableList";
import CategoryList from "./management/CategoryList";
import ItemList from "./management/ItemList";
import BranchList from "./management/BranchList";
import POSPointList from "./management/POSPointList";
import StaffList from "./management/StaffList";
import CouponList from "./management/CouponList";

const Management: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeSubTab, setActiveSubTab,
    confirmModal, closeConfirm, handleConfirmAction,
    editModal, closeEditModal, openEditModal,
    searchQuery, setSearchQuery,
    handleManualRefresh,
    isDeleting,
    data,
    status,
    openConfirm
  } = useManagement();

  const subTabs = [
    { id: "Tables", icon: <MdTableBar />, label: t('dashboard.management.tabs.tables') },
    { id: "Categories", icon: <MdCategory />, label: t('dashboard.management.tabs.categories') },
    { id: "Items", icon: <MdRestaurantMenu />, label: t('dashboard.management.tabs.dishes') },
    { id: "Branches", icon: <MdStore />, label: t('dashboard.management.tabs.branches') },
    { id: "POSPoints", icon: <MdComputer />, label: t('dashboard.management.tabs.terminals') },
    { id: "Users", icon: <MdPeople />, label: t('dashboard.management.tabs.staff') },
    { id: "Coupons", icon: <FaTag />, label: "Coupons" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <ManagementHeader 
        subTabs={subTabs}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleManualRefresh={handleManualRefresh}
        openEditModal={openEditModal}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit="hidden"
          className={activeSubTab === "Users" ? "w-full" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}
        >
          {activeSubTab === "Tables" && (
            <TableList 
              data={data.tables} 
              loading={status.loadingTables} 
              error={status.errorTables} 
              onEdit={openEditModal}
              onDelete={openConfirm}
              onRetry={handleManualRefresh}
              itemVariants={itemVariants}
            />
          )}

          {activeSubTab === "Categories" && (
            <CategoryList 
              data={data.categories} 
              loading={status.loadingCategories} 
              error={status.errorCategories} 
              onEdit={openEditModal}
              onDelete={openConfirm}
              onRetry={handleManualRefresh}
              itemVariants={itemVariants}
            />
          )}

          {activeSubTab === "Items" && (
            <ItemList 
              data={data.items} 
              loading={status.loadingItems} 
              error={status.errorItems} 
              onEdit={openEditModal}
              onDelete={openConfirm}
              onRetry={handleManualRefresh}
              itemVariants={itemVariants}
            />
          )}

          {activeSubTab === "Branches" && (
            <BranchList 
              data={data.branches} 
              loading={status.loadingBranches} 
              error={status.errorBranches} 
              onEdit={openEditModal}
              onRetry={handleManualRefresh}
              itemVariants={itemVariants}
            />
          )}

          {activeSubTab === "POSPoints" && (
            <POSPointList 
              data={data.posPoints} 
              loading={status.loadingPOSPoints} 
              error={status.errorPOSPoints} 
              onEdit={openEditModal}
              onRetry={handleManualRefresh}
              itemVariants={itemVariants}
            />
          )}

          {activeSubTab === "Users" && (
            <StaffList 
              data={data.usersData} 
              loading={status.loadingUsers} 
              error={status.errorUsers} 
              onEdit={openEditModal}
              onDelete={openConfirm}
              onRetry={handleManualRefresh}
              searchQuery={searchQuery}
            />
          )}

          {activeSubTab === "Coupons" && (
            <div className="col-span-full">
              <CouponList 
                onAdd={() => openEditModal("coupon")}
                onEdit={(coupon) => openEditModal("coupon", coupon)}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

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

export default Management;
