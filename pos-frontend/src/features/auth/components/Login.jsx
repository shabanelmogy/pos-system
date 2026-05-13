import React from "react";
import { motion } from "framer-motion";
import { MdEmail, MdLock, MdLogin, MdAdminPanelSettings, MdPointOfSale } from "react-icons/md";
import useLogin from "../hooks/useLogin";

const Login = () => {
  const { register, onSubmit, handleDemoLogin, errors, isLoading } = useLogin();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] ms-1">
            <MdEmail className="text-[var(--primary)]" /> Terminal Email
          </label>
          <div className="group relative">
            <input
              type="email"
              {...register("email")}
              placeholder="e.g. cashier01@enterprise.com"
              className={`w-full bg-[var(--bg-card)] border ${errors.email ? 'border-red-500' : 'border-[var(--border-main)]'} focus:border-[var(--primary)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none transition-all placeholder:text-[var(--text-dim)] font-bold`}
            />
            {errors.email && (
              <span className="text-[10px] text-red-500 font-bold mt-1 ms-2 block uppercase tracking-wider">
                {errors.email.message}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] ms-1">
            <MdLock className="text-[var(--primary)]" /> Security Code
          </label>
          <div className="group relative">
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className={`w-full bg-[var(--bg-card)] border ${errors.password ? 'border-red-500' : 'border-[var(--border-main)]'} focus:border-[var(--primary)] rounded-2xl p-5 text-[var(--text-main)] focus:outline-none transition-all placeholder:text-[var(--text-dim)] font-bold tracking-[0.5em]`}
            />
            {errors.password && (
              <span className="text-[10px] text-red-500 font-bold mt-1 ms-2 block uppercase tracking-wider">
                {errors.password.message}
              </span>
            )}
          </div>
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
              Verifying...
            </span>
          ) : (
            <>
              <MdLogin size={20} /> Authorize Access
            </>
          )}
        </motion.button>
      </form>

      {/* Demo Login Section */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[var(--border-main)]"></div>
          <span className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest whitespace-nowrap">Development Sandbox</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[var(--border-main)]"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { role: 'Admin', email: 'admin@gmail.com', icon: <MdAdminPanelSettings size={22} /> },
            { role: 'Cashier', email: 'cashier@gmail.com', icon: <MdPointOfSale size={22} /> }
          ].map((demo) => (
            <button
              key={demo.role}
              type="button"
              onClick={() => handleDemoLogin(demo.email, 'Adam@2008')}
              className="group relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[var(--bg-card-alt)] border border-[var(--border-main)] hover:border-[var(--primary)] hover:bg-[var(--bg-card)] transition-all cursor-pointer overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="text-[var(--text-dim)] group-hover:text-[var(--primary)] group-hover:scale-110 transition-all z-10">
                {demo.icon}
              </div>

              <span className="text-[10px] font-black uppercase tracking-tighter text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors z-10">
                {demo.role}
              </span>

              {/* Decorative indicator */}
              <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-[var(--border-main)] group-hover:bg-[var(--primary)] transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
