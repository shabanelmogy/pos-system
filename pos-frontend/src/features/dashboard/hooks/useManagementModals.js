import { useState } from "react";

export const useManagementModals = () => {
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", id: null, name: "" });
  const [editModal, setEditModal] = useState({ isOpen: false, type: "", data: null });

  const openConfirm = (type, id, name) => {
    setConfirmModal({ isOpen: true, type, id, name });
  };

  const closeConfirm = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const openEditModal = (type, data) => {
    setEditModal({ isOpen: true, type, data });
  };

  const closeEditModal = () => {
    setEditModal((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    confirmModal, openConfirm, closeConfirm,
    editModal, openEditModal, closeEditModal
  };
};
