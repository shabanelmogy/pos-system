import { useMutation } from "@tanstack/react-query";
import { register as registerApi } from "../api/authApi";
import { enqueueSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * Zod schema for registration validation
 */
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Please select an enterprise role"),
});

/**
 * Custom hook to handle registration logic and state.
 */
const useRegister = ({ setIsRegister }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "",
    },
  });

  const selectedRole = watch("role");

  const registerMutation = useMutation({
    mutationFn: (reqData) => registerApi(reqData),
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message, { variant: "success" });
      reset();
      
      setTimeout(() => {
        setIsRegister(false);
      }, 1500);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Registration failed. Check server status.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const onSubmit = (data) => {
    registerMutation.mutate(data);
  };

  const handleRoleSelection = (role) => {
    setValue("role", role, { shouldValidate: true });
  };

  return {
    register,
    onSubmit: handleSubmit(onSubmit),
    handleRoleSelection,
    selectedRole,
    errors,
    isLoading: registerMutation.isPending,
  };
};

export default useRegister;
