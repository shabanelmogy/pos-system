import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { openShift, closeShift } from "../../features/pos/api/posApi";
import usePOSStore from "../../features/pos/store/usePOSStore";
import { enqueueSnackbar } from "notistack";

const openShiftSchema = z.object({
  openingBalance: z.coerce.number().min(0, "Balance cannot be negative"),
});

const closeShiftSchema = z.object({
  closingBalance: z.coerce.number().min(0, "Balance cannot be negative"),
});

const useShiftManager = () => {
  const { 
    activeShift, 
    selectedBranch, 
    selectedPOSPoint, 
    setActiveShift, 
    setShowShiftModal 
  } = usePOSStore();
  
  const [loading, setLoading] = useState(false);

  const openForm = useForm({
    resolver: zodResolver(openShiftSchema),
    defaultValues: { openingBalance: 0 },
  });

  const closeForm = useForm({
    resolver: zodResolver(closeShiftSchema),
    defaultValues: { closingBalance: 0 },
  });

  const handleOpenShift = async (data) => {
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
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || "Failed to start shift", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = async (data) => {
    try {
      setLoading(true);
      const res = await closeShift(activeShift.id, {
        closingBalance: data.closingBalance
      });
      setActiveShift(null);
      setShowShiftModal(false);
      enqueueSnackbar("Shift closed successfully", { variant: "success" });
    } catch (error) {
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
