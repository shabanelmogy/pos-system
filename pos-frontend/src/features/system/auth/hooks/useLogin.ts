import { useMutation } from "@tanstack/react-query";
import { login } from "@/shared/api/services/authApi";
import { enqueueSnackbar } from "notistack";
import useUserStore from "@/features/system/auth/store/useUserStore";
import usePOSStore from "@/features/pos/terminal/store/usePOSStore";
import { useNavigate } from "react-router-dom";
import { useForm, UseFormRegister, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";

/**
 * Zod schema for login validation
 */
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

interface LoginHook {
  register: UseFormRegister<LoginData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleDemoLogin: (email: string, password: string) => void;
  errors: FieldErrors<LoginData>;
  isLoading: boolean;
}

/**
 * Custom hook to handle login logic and state using React Hook Form.
 */
const useLogin = (): LoginHook => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const { setActiveShift, setSelectedBranch, setSelectedPOSPoint } = usePOSStore();
  const { t } = useTranslation();
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (reqData: LoginData) => login(reqData),
    onSuccess: (res: any) => {
      const { token, activeShift, data: userData } = res.data;

      if (token) localStorage.setItem("accessToken", token);

      // Initialize POS session state
      if (activeShift) {
        setActiveShift(activeShift);
        if (activeShift.branch) setSelectedBranch(activeShift.branch);
        if (activeShift.posPoint) setSelectedPOSPoint(activeShift.posPoint);
      } else {
        if (userData.branch) setSelectedBranch(userData.branch);
        const assignedPOS = userData.posPermissions?.[0]?.posPoint;
        if (assignedPOS) setSelectedPOSPoint(assignedPOS);
      }

      setUser(userData);
      enqueueSnackbar(t('auth.welcome_back', { name: userData.name }), { variant: "success" });
      navigate("/");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Invalid credentials or server error.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const handleDemoLogin = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
    loginMutation.mutate({ email, password });
  };

  return {
    register,
    onSubmit: handleSubmit(onSubmit),
    handleDemoLogin,
    errors,
    isLoading: loginMutation.isPending,
  };
};

export default useLogin;
