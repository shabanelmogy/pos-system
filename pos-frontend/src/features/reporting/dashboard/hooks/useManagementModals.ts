import { useState } from "react";

interface ConfirmModalState {
  isOpen: boolean;
  type: string;
  id: string | null;
  name: string;
}

interface EditModalState {
  isOpen: boolean;
  type: string;
  data: any;
}

export const useManagementModals = () => {
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ isOpen: false, type: "", id: null, name: "" });
  const [editModal, setEditModal] = useState<EditModalState>({ isOpen: false, type: "", data: null });

  const openConfirm = (type: string, id: string, name: string) => {
    setConfirmModal({ isOpen: true, type, id, name });
  };

  const closeConfirm = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const openEditModal = (type: string, data: any) => {
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
