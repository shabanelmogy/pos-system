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
        taxRate: z.coerce.number().min(0, "Tax rate cannot be negative").default(0),
        serviceChargeRate: z.coerce.number().min(0, "Service charge cannot be negative").default(0),
        currency: z.string().default("INR"),
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
    case "coupon":
      return z.object({
        code: z.string().min(1, "Code is required"),
        type: z.enum(["PERCENTAGE", "FIXED"]),
        value: z.coerce.number().min(0, "Value cannot be negative"),
        minOrderAmount: z.coerce.number().min(0).default(0),
        maxDiscountAmount: z.coerce.number().min(0).optional(),
        validUntil: z.string().optional(),
        isActive: z.boolean().default(true),
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
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
        tableNo: "", seats: "", name: "", price: "", categoryId: "",
        code: "", phone: "", email: "", address: "", city: "",
        branchId: "", role: "cashier", password: "",
        taxRate: 0, serviceChargeRate: 0, currency: "INR",
        type: "PERCENTAGE", value: 0, minOrderAmount: 0, maxDiscountAmount: "", validUntil: "", isActive: true
    }
  });

  // Sync form with initialData or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          ...initialData,
          price: initialData.price?.toString() || "",
          taxRate: initialData.taxRate?.toString() || "0",
          serviceChargeRate: initialData.serviceChargeRate?.toString() || "0",
          value: initialData.value?.toString() || "0",
          minOrderAmount: initialData.minOrderAmount?.toString() || "0",
          maxDiscountAmount: initialData.maxDiscountAmount?.toString() || "",
          validUntil: initialData.validUntil ? new Date(initialData.validUntil).toISOString().split('T')[0] : "",
          password: "", // Don't show password
        });
      } else {
        reset({
          tableNo: "", seats: "", name: "", price: "", categoryId: "",
          code: "", phone: "", email: "", address: "", city: "",
          branchId: "", role: "cashier", password: "",
          taxRate: 0, serviceChargeRate: 0, currency: "INR",
          type: "PERCENTAGE", value: 0, minOrderAmount: 0, maxDiscountAmount: "", validUntil: "", isActive: true
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
