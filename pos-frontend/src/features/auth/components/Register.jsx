import React, { useState } from "react";
import { register } from "../api/authApi";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { motion } from "framer-motion";
import { MdPerson, MdEmail, MdPhone, MdLock, MdAppRegistration, MdSecurity } from "react-icons/md";

const Register = ({setIsRegister}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelection = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.role) {
      enqueueSnackbar("Please select an enterprise role", { variant: "warning" });
      return;
    }
    registerMutation.mutate(formData);
  };

  const registerMutation = useMutation({
    mutationFn: (reqData) => register(reqData),
    onSuccess: (res) => {
      const { data } = res;
      enqueueSnackbar(data.message, { variant: "success" });
      setFormData({ name: "", email: "", phone: "", password: "", role: "" });
      
      setTimeout(() => {
        setIsRegister(false);
      }, 1500);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Registration failed. Check server status.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest ms-1"><MdPerson /> Full Name</label>
            <input name="name" type="text" value={formData.name} onChange={handleChange} required placeholder="Employee Name" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] focus:border-[var(--primary)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none transition-all font-bold placeholder:text-[var(--text-dim)]" />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest ms-1"><MdEmail /> Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="Professional Email" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] focus:border-[var(--primary)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none transition-all font-bold placeholder:text-[var(--text-dim)]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest ms-1"><MdPhone /> Phone</label>
            <input name="phone" type="text" value={formData.phone} onChange={handleChange} required placeholder="Contact Number" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] focus:border-[var(--primary)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none transition-all font-bold placeholder:text-[var(--text-dim)]" />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest ms-1"><MdLock /> Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Security Pass" className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] focus:border-[var(--primary)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none transition-all font-bold placeholder:text-[var(--text-dim)]" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest ms-1"><MdSecurity /> Select Access Level</label>
          <div className="flex gap-3">
            {["Waiter", "Cashier", "Admin"].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelection(role)}
                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  formData.role === role 
                    ? "bg-[var(--primary)] text-[var(--bg-card)] border-[var(--primary)] shadow-lg shadow-yellow-500/20" 
                    : "bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-[var(--text-dim)] hover:text-[var(--text-main)]"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full bg-[var(--primary)] text-[var(--bg-card)] font-black py-5 rounded-2xl mt-4 flex items-center justify-center gap-3 shadow-2xl shadow-yellow-500/10 hover:bg-yellow-600 transition-all uppercase tracking-[0.3em] text-xs disabled:opacity-50"
        >
          {registerMutation.isPending ? "Creating Account..." : (
            <>
               <MdAppRegistration size={20} /> Register Employee
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default Register;
