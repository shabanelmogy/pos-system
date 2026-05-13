import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

/**
 * Generates dynamic validation schema based on management type.
 */
const getValidationSchema = (type: string, isEdit: boolean) => {
  switch (type) {
    case "table":
      return z.object({
        tableNo: z.coerce.number().min(1, "Table number must be positive"),
        seats: z.coerce.number().min(1, "At least 1 seat is required"),
      });
    case "dishes":
      return z.object({
        name: z.string().min(1, "Name is required"),
        price: z.coerce.number().min(0, "Price cannot be negative"),
        categoryId: z.string().min(1, "Category is required"),
      });
    case "category":
      return z.object({
        name: z.string().min(1, "Name is required"),
      });
    case "branch":
      return z.object({
        name: z.string().min(1, "Name is required"),
        code: z.string().min(1, "Branch code is required"),
        city: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      });
    case "posPoint":
      return z.object({
        name: z.string().min(1, "Terminal name is required"),
        code: z.string().min(1, "Terminal code is required"),
        branchId: z.string().min(1, "Please assign to a branch"),
      });
    case "user":
      return z.object({
        name: z.string().min(1, "Full name is required"),
        email: z.string().email("Invalid email address"),
        phone: z.string().min(10, "Phone number must be at least 10 digits"),
        role: z.string().min(1, "Role is required"),
        branchId: z.string().min(1, "Branch is required"),
        password: isEdit ? z.string().optional() : z.string().min(6, "Password must be at least 6 characters"),
      });
    default:
      return z.object({});
  }
};

/**
 * Custom hook to manage forms in ManagementModal.
 */
const useManagementForm = (type: string, initialData: any, isOpen: boolean) => {
  const isEdit = !!initialData;
  const schema = getValidationSchema(type, isEdit);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
        tableNo: "", seats: "", name: "", price: "", categoryId: "",
        code: "", phone: "", email: "", address: "", city: "",
        branchId: "", role: "cashier", password: ""
    }
  });

  // Sync form with initialData or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          ...initialData,
          price: initialData.price?.toString() || "",
          password: "", // Don't show password
        });
      } else {
        reset({
          tableNo: "", seats: "", name: "", price: "", categoryId: "",
          code: "", phone: "", email: "", address: "", city: "",
          branchId: "", role: "cashier", password: ""
        });
      }
    }
  }, [initialData, isOpen, type, reset]);

  return {
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
  };
};

export default useManagementForm;
