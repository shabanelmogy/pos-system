import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query"
import { login } from "../../https/index"
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdEmail, MdLock, MdLogin } from "react-icons/md";
import { setActiveShift, setSelectedBranch, setSelectedPOSPoint } from "../../redux/slices/posSlice";
 
const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const[formData, setFormData] = useState({
      email: "",
      password: "",
    });
  
    const handleChange = (e) => {
      setFormData({...formData, [e.target.name]: e.target.value});
    }

    const handleSubmit = (e) => {
      e.preventDefault();
      loginMutation.mutate(formData);
    }

    const loginMutation = useMutation({
      mutationFn: (reqData) => login(reqData),
        onSuccess: (res) => {
          const { token, activeShift, data: userData } = res.data;
          
          if (token) localStorage.setItem("accessToken", token);

          // One shot update: Shift then User
          if (activeShift) {
            dispatch(setActiveShift(activeShift));
            
            // Auto-assign branch and POS if present in shift
            if (activeShift.branch) dispatch(setSelectedBranch(activeShift.branch));
            if (activeShift.posPoint) dispatch(setSelectedPOSPoint(activeShift.posPoint));
          } else {
             // Fallback to user permissions if no active shift
             if (userData.branch) dispatch(setSelectedBranch(userData.branch));
             const assignedPOS = userData.posPermissions?.[0]?.posPoint;
             if (assignedPOS) dispatch(setSelectedPOSPoint(assignedPOS));
          }

          dispatch(setUser(userData));

          enqueueSnackbar(`Welcome back, ${userData.name}`, { variant: "success" });
          navigate("/");
        },
      onError: (error) => {
        const message = error.response?.data?.message || "Invalid credentials or server error.";
        enqueueSnackbar(message, { variant: "error" });
      }
    })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] ml-1">
            <MdEmail className="text-[var(--primary)]" /> Terminal Email
          </label>
          <div className="group relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. cashier01@enterprise.com"
              className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] focus:border-[var(--primary)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none transition-all placeholder:text-[var(--text-dim)] font-bold"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] ml-1">
            <MdLock className="text-[var(--primary)]" /> Security Code
          </label>
          <div className="group relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] focus:border-[var(--primary)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none transition-all placeholder:text-[var(--text-dim)] font-bold tracking-[0.5em]"
              required
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-[var(--primary)] text-[var(--bg-card)] font-black py-5 rounded-2xl mt-4 flex items-center justify-center gap-3 shadow-2xl shadow-yellow-500/10 hover:bg-yellow-600 transition-all uppercase tracking-[0.3em] text-xs disabled:opacity-50"
        >
          {loginMutation.isPending ? (
            <span className="flex items-center gap-2">
               <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
               Verifying...
            </span>
          ) : (
            <>
               <MdLogin size={20} /> Authorize Access
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default Login;
