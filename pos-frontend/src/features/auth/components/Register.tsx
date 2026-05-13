import React from "react";
import { motion } from "framer-motion";
import { MdPerson, MdEmail, MdPhone, MdLock, MdAppRegistration, MdSecurity } from "react-icons/md";
import useRegister from "../hooks/useRegister";

interface RegisterProps {
  setIsRegister: (value: boolean) => void;
}

const Register: React.FC<RegisterProps> = ({ setIsRegister }) => {
  const { 
    register, 
    onSubmit, 
    handleRoleSelection, 
    selectedRole, 
    errors, 
    isLoading 
  } = useRegister({ setIsRegister });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest ms-1">
              <MdPerson /> Full Name
            </label>
            <input 
              {...register("name")}
              type="text" 
              placeholder="Employee Name" 
              className={`w-full bg-[var(--bg-card)] border ${errors.name ? 'border-red-500' : 'border-[var(--border-main)]'} focus:border-[var(--primary)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none transition-all font-bold placeholder:text-[var(--text-dim)]`} 
            />
            {errors.name && <span className="text-[9px] text-red-500 font-bold ms-2 uppercase tracking-tighter">{errors.name.message as string}</span>}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest ms-1">
              <MdEmail /> Email
            </label>
            <input 
              {...register("email")}
              type="email" 
              placeholder="Professional Email" 
              className={`w-full bg-[var(--bg-card)] border ${errors.email ? 'border-red-500' : 'border-[var(--border-main)]'} focus:border-[var(--primary)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none transition-all font-bold placeholder:text-[var(--text-dim)]`} 
            />
            {errors.email && <span className="text-[9px] text-red-500 font-bold ms-2 uppercase tracking-tighter">{errors.email.message as string}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest ms-1">
              <MdPhone /> Phone
            </label>
            <input 
              {...register("phone")}
              type="text" 
              placeholder="Contact Number" 
              className={`w-full bg-[var(--bg-card)] border ${errors.phone ? 'border-red-500' : 'border-[var(--border-main)]'} focus:border-[var(--primary)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none transition-all font-bold placeholder:text-[var(--text-dim)]`} 
            />
            {errors.phone && <span className="text-[9px] text-red-500 font-bold ms-2 uppercase tracking-tighter">{errors.phone.message as string}</span>}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest ms-1">
              <MdLock /> Password
            </label>
            <input 
              {...register("password")}
              type="password" 
              placeholder="Security Pass" 
              className={`w-full bg-[var(--bg-card)] border ${errors.password ? 'border-red-500' : 'border-[var(--border-main)]'} focus:border-[var(--primary)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none transition-all font-bold placeholder:text-[var(--text-dim)]`} 
            />
            {errors.password && <span className="text-[9px] text-red-500 font-bold ms-2 uppercase tracking-tighter">{errors.password.message as string}</span>}
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest ms-1">
            <MdSecurity /> Select Access Level
          </label>
          <div className="flex flex-wrap gap-3">
            {["Waiter", "Cashier", "Manager", "Admin"].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelection(role)}
                className={`flex-1 min-w-[100px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  selectedRole.toLowerCase() === role.toLowerCase() 
                    ? "bg-[var(--primary)] text-[var(--bg-card)] border-[var(--primary)] shadow-lg shadow-yellow-500/20" 
                    : "bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-[var(--text-dim)] hover:text-[var(--text-main)]"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          {errors.role && <span className="text-[9px] text-red-500 font-bold ms-2 uppercase tracking-tighter">{errors.role.message as string}</span>}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-[var(--primary)] text-[var(--bg-card)] font-black py-5 rounded-2xl mt-4 flex items-center justify-center gap-3 shadow-2xl shadow-yellow-500/10 hover:bg-yellow-600 transition-all uppercase tracking-[0.3em] text-xs disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              Creating Account...
            </span>
          ) : (
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
