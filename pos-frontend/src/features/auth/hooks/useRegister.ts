import { useMutation } from "@tanstack/react-query";
import { register as registerApi } from "../api/authApi";
import { enqueueSnackbar } from "notistack";
import { useForm, UseFormRegister, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserRole } from "../../../shared/types";

/**
 * Zod schema for registration validation
 */
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "manager", "cashier", "waiter"], { 
    message: "Please select an enterprise role" 
  }),
});

type RegisterData = z.infer<typeof registerSchema>;

interface RegisterHook {
  register: UseFormRegister<RegisterData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleRoleSelection: (role: string) => void;
  selectedRole: string;
  errors: FieldErrors<RegisterData>;
  isLoading: boolean;
}

interface UseRegisterProps {
  setIsRegister: (value: boolean) => void;
}

/**
 * Custom hook to handle registration logic and state.
 */
const useRegister = ({ setIsRegister }: UseRegisterProps): RegisterHook => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "" as any,
    },
  });

  const selectedRole = watch("role");

  const registerMutation = useMutation({
    mutationFn: (reqData: RegisterData) => registerApi(reqData),
    onSuccess: (res: any) => {
      enqueueSnackbar(res.data.message, { variant: "success" });
      reset();
      
      setTimeout(() => {
        setIsRegister(false);
      }, 1500);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Registration failed. Check server status.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const onSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  const handleRoleSelection = (role: string) => {
    // Normalize to lowercase to match our UserRole enum
    setValue("role", role.toLowerCase() as UserRole, { shouldValidate: true });
  };

  return {
    register,
    onSubmit: handleSubmit(onSubmit),
    handleRoleSelection,
    selectedRole: selectedRole || "",
    errors,
    isLoading: registerMutation.isPending,
  };
};

export default useRegister;
