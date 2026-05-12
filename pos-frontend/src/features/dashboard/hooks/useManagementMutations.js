import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  deleteCategory, deleteItem, deleteTable, deleteUser 
} from "../api/dashboardApi";
import { enqueueSnackbar } from "notistack";

export const useManagementMutations = (onSuccessCallback) => {
  const queryClient = useQueryClient();

  const deleteItemMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries(["items"]);
      enqueueSnackbar("Item deleted successfully", { variant: "success" });
      onSuccessCallback?.();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to delete item", { variant: "error" });
      onSuccessCallback?.();
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      enqueueSnackbar("Category deleted successfully", { variant: "success" });
      onSuccessCallback?.();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to delete category", { variant: "error" });
      onSuccessCallback?.();
    }
  });

  const deleteTableMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries(["tables"]);
      enqueueSnackbar("Table deleted successfully", { variant: "success" });
      onSuccessCallback?.();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to delete table", { variant: "error" });
      onSuccessCallback?.();
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      enqueueSnackbar("Staff member deleted successfully", { variant: "success" });
      onSuccessCallback?.();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to delete user", { variant: "error" });
      onSuccessCallback?.();
    }
  });

  const isDeleting = 
    deleteItemMutation.isPending || 
    deleteCategoryMutation.isPending || 
    deleteTableMutation.isPending || 
    deleteUserMutation.isPending;

  const executeDelete = (type, id) => {
    if (type === "item") deleteItemMutation.mutate(id);
    else if (type === "category") deleteCategoryMutation.mutate(id);
    else if (type === "table") deleteTableMutation.mutate(id);
    else if (type === "user") deleteUserMutation.mutate(id);
  };

  return { executeDelete, isDeleting };
};
