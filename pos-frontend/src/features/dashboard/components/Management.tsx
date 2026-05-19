import React from "react";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import ManagementModal from "./ManagementModal";
import { useTranslation } from "react-i18next";

// Custom Hook
import { useManagement } from "../hooks/useManagement";

// Sub-components
import { MasterTreeList } from "./management/MasterTreeList";

const Management: React.FC = () => {
  const { t } = useTranslation();
  const {
    confirmModal, closeConfirm, handleConfirmAction,
    editModal, closeEditModal, openEditModal,
    handleManualRefresh,
    isDeleting,
    data,
    status,
    openConfirm
  } = useManagement();

  const isDataLoading = 
    status.loadingCategories || 
    status.loadingItems || 
    status.loadingTables || 
    status.loadingBranches || 
    status.loadingPOSPoints || 
    status.loadingUsers;

  const hasDataError = 
    status.errorCategories || 
    status.errorItems || 
    status.errorTables || 
    status.errorBranches || 
    status.errorPOSPoints || 
    status.errorUsers;

  return (
    <div className="space-y-6">
      <MasterTreeList
        categories={data.categories}
        items={data.items}
        tables={data.tables}
        branches={data.branches}
        posPoints={data.posPoints}
        usersData={data.usersData}
        loading={isDataLoading}
        error={hasDataError}
        onEdit={openEditModal}
        onDelete={openConfirm}
        onRetry={handleManualRefresh}
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

export default Management;
