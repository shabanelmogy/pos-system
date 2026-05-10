import React, { useState } from "react";
import { register } from "../../https";
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
            <label className="flex items-center gap-2 text-[#ababab] text-[10px] font-black uppercase tracking-widest ml-1"><MdPerson /> Full Name</label>
            <input name="name" type="text" value={formData.name} onChange={handleChange} required placeholder="Employee Name" className="w-full bg-[#1a1a1a] border border-[#333] focus:border-[#f6b100] rounded-2xl p-4 text-white focus:outline-none transition-all font-bold placeholder:text-[#333]" />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[#ababab] text-[10px] font-black uppercase tracking-widest ml-1"><MdEmail /> Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="Professional Email" className="w-full bg-[#1a1a1a] border border-[#333] focus:border-[#f6b100] rounded-2xl p-4 text-white focus:outline-none transition-all font-bold placeholder:text-[#333]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[#ababab] text-[10px] font-black uppercase tracking-widest ml-1"><MdPhone /> Phone</label>
            <input name="phone" type="text" value={formData.phone} onChange={handleChange} required placeholder="Contact Number" className="w-full bg-[#1a1a1a] border border-[#333] focus:border-[#f6b100] rounded-2xl p-4 text-white focus:outline-none transition-all font-bold placeholder:text-[#333]" />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[#ababab] text-[10px] font-black uppercase tracking-widest ml-1"><MdLock /> Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Security Pass" className="w-full bg-[#1a1a1a] border border-[#333] focus:border-[#f6b100] rounded-2xl p-4 text-white focus:outline-none transition-all font-bold placeholder:text-[#333]" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[#ababab] text-[10px] font-black uppercase tracking-widest ml-1"><MdSecurity /> Select Access Level</label>
          <div className="flex gap-3">
            {["Waiter", "Cashier", "Admin"].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelection(role)}
                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  formData.role === role 
                    ? "bg-[#f6b100] text-[#1a1a1a] border-[#f6b100] shadow-lg shadow-yellow-500/20" 
                    : "bg-[#1a1a1a] border-[#333] text-[#555] hover:border-[#444] hover:text-[#ababab]"
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
          className="w-full bg-[#f6b100] text-[#1a1a1a] font-black py-5 rounded-2xl mt-4 flex items-center justify-center gap-3 shadow-2xl shadow-yellow-500/10 hover:bg-yellow-600 transition-all uppercase tracking-[0.3em] text-xs disabled:opacity-50"
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
