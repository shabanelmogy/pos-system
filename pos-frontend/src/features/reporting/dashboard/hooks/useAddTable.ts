import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { addTable } from "@/shared/api/services/dashboardApi";
import { enqueueSnackbar } from "notistack";

const tableSchema = z.object({
  tableNo: z.coerce.number().min(1, "Table number must be positive"),
  seats: z.coerce.number().min(1, "At least 1 seat is required"),
});

interface UseAddTableProps {
  setIsTableModalOpen: (isOpen: boolean) => void;
}

const useAddTable = ({ setIsTableModalOpen }: UseAddTableProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      tableNo: "",
      seats: "",
    },
  });

  const tableMutation = useMutation({
    mutationFn: (reqData: any) => addTable(reqData),
    onSuccess: (res: any) => {
      setIsTableModalOpen(false);
      enqueueSnackbar(res.data.message, { variant: "success" });
      reset();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to add table";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const onSubmit = (data: any) => {
    tableMutation.mutate(data);
  };

  return {
    register,
    onSubmit: handleSubmit(onSubmit),
    errors,
    isLoading: tableMutation.isPending,
  };
};

export default useAddTable;
