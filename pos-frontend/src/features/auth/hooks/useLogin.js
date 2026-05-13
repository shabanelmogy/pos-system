import { useMutation } from "@tanstack/react-query";
import { login } from "../api/authApi";
import { enqueueSnackbar } from "notistack";
import useUserStore from "../store/useUserStore";
import usePOSStore from "../../pos/store/usePOSStore";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * Zod schema for login validation
 */
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Custom hook to handle login logic and state using React Hook Form.
 */
const useLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const { setActiveShift, setSelectedBranch, setSelectedPOSPoint } = usePOSStore();
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (reqData) => login(reqData),
    onSuccess: (res) => {
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
      enqueueSnackbar(`Welcome back, ${userData.name}`, { variant: "success" });
      navigate("/");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Invalid credentials or server error.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  const handleDemoLogin = (email, password) => {
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
