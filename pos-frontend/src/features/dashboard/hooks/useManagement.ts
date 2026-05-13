import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { useManagementQueries } from "./useManagementQueries";
import { useManagementMutations } from "./useManagementMutations";
import { useManagementModals } from "./useManagementModals";

export const useManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState("Tables");
  const [searchQuery, setSearchQuery] = useState("");

  const { confirmModal, openConfirm, closeConfirm, editModal, openEditModal, closeEditModal } = useManagementModals();
  const { data, status, refetch } = useManagementQueries();
  const { executeDelete, isDeleting } = useManagementMutations(closeConfirm);

  const handleConfirmAction = () => {
    if (confirmModal.id) {
        executeDelete(confirmModal.type as any, confirmModal.id);
    }
  };

  const handleManualRefresh = () => {
    const refreshMap: { [key: string]: () => void } = {
      Tables: refetch.refetchTables,
      Categories: refetch.refetchCategories,
      Items: refetch.refetchItems,
      Branches: refetch.refetchBranches,
      POSPoints: refetch.refetchPOSPoints,
      Users: refetch.refetchUsers,
    };

    const refreshFn = refreshMap[activeSubTab];
    if (refreshFn) refreshFn();
    
    enqueueSnackbar("Syncing data...", { variant: "info", autoHideDuration: 1000 });
  };

  return {
    activeSubTab, setActiveSubTab,
    confirmModal, openConfirm, closeConfirm, handleConfirmAction,
    editModal, closeEditModal, openEditModal,
    searchQuery, setSearchQuery,
    handleManualRefresh,
    isDeleting,
    data,
    status
  };
};
