import { useForm, UseFormRegister, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { openShift, closeShift } from "../../features/pos/api/posApi";
import usePOSStore from "../../features/pos/store/usePOSStore";
import useUserStore from "../../features/auth/store/useUserStore";
import { enqueueSnackbar } from "notistack";
import { Branch, POSPoint, Shift } from "../types";

const openShiftSchema = z.object({
  openingBalance: z.coerce.number().min(0, "Balance cannot be negative"),
});

const closeShiftSchema = z.object({
  closingBalance: z.coerce.number().min(0, "Balance cannot be negative"),
});

type OpenShiftData = z.infer<typeof openShiftSchema>;
type CloseShiftData = z.infer<typeof closeShiftSchema>;

interface ShiftManagerHook {
  activeShift: Shift | null;
  selectedBranch: Branch | null;
  selectedPOSPoint: POSPoint | null;
  setShowShiftModal: (show: boolean) => void;
  loading: boolean;
  openForm: {
    register: UseFormRegister<OpenShiftData>;
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    errors: FieldErrors<OpenShiftData>;
  };
  closeForm: {
    register: UseFormRegister<CloseShiftData>;
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    errors: FieldErrors<CloseShiftData>;
  };
}

const useShiftManager = (): ShiftManagerHook => {
  const { 
    activeShift, 
    selectedBranch, 
    selectedPOSPoint, 
    setActiveShift, 
    setShowShiftModal 
  } = usePOSStore();
  
  const [loading, setLoading] = useState(false);

  const openForm = useForm<OpenShiftData>({
    resolver: zodResolver(openShiftSchema),
    defaultValues: { openingBalance: 0 },
  });

  const closeForm = useForm<CloseShiftData>({
    resolver: zodResolver(closeShiftSchema),
    defaultValues: { closingBalance: 0 },
  });

  const handleOpenShift = async (data: OpenShiftData) => {
    if (!selectedBranch || !selectedPOSPoint) return;
    try {
      setLoading(true);
      const res = await openShift({
        branchId: selectedBranch.id,
        posPointId: selectedPOSPoint.id,
        openingBalance: data.openingBalance
      });
      setActiveShift(res.data.data);
      setShowShiftModal(false);
      enqueueSnackbar("Shift started successfully", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || "Failed to start shift", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = async (data: CloseShiftData) => {
    if (!activeShift) return;
    try {
      setLoading(true);
      await closeShift(activeShift.id, {
        closingBalance: data.closingBalance
      });
      setActiveShift(null);
      setShowShiftModal(false);
      enqueueSnackbar("Shift closed successfully", { variant: "success" });

      // Auto-logout for non-admin users (Cashiers, etc.)
      const user = useUserStore.getState();
      if (user.role?.toLowerCase() !== "admin") {
        user.removeUser();
      }
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || "Failed to close shift", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return {
    activeShift,
    selectedBranch,
    selectedPOSPoint,
    setShowShiftModal,
    loading,
    openForm: {
      register: openForm.register,
      onSubmit: openForm.handleSubmit(handleOpenShift),
      errors: openForm.formState.errors,
    },
    closeForm: {
      register: closeForm.register,
      onSubmit: closeForm.handleSubmit(handleCloseShift),
      errors: closeForm.formState.errors,
    }
  };
};

export default useShiftManager;
