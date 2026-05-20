import React from "react";
import { motion } from "framer-motion";
import { MdPerson, MdEmail, MdPhone, MdLock, MdAppRegistration, MdSecurity } from "react-icons/md";
import useRegister from "@/features/system/auth/hooks/useRegister";
import { useTranslation } from "react-i18next";

interface RegisterProps {
  setIsRegister: (value: boolean) => void;
}

const Register: React.FC<RegisterProps> = ({ setIsRegister }) => {
  const { t } = useTranslation();
  const { register, onSubmit, handleRoleSelection, selectedRole, errors, isLoading } = useRegister({ setIsRegister });

  const roles = [
    { key: "waiter",   label: t('auth.role_waiter') },
    { key: "cashier",  label: t('auth.role_cashier') },
    { key: "manager",  label: t('auth.role_manager') },
    { key: "admin",    label: t('auth.role_admin') },
  ];

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
              <MdPerson /> {t('auth.name_label')}
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder={t('auth.placeholder_name')}
              className={`w-full bg-[var(--bg-card)] border ${errors.name ? 'border-red-500' : 'border-[var(--border-main)]'} focus:border-[var(--primary)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none transition-all font-bold placeholder:text-[var(--text-dim)]`}
            />
            {errors.name && <span className="text-[9px] text-red-500 font-bold ms-2 uppercase tracking-tighter">{errors.name.message as string}</span>}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest ms-1">
              <MdEmail /> {t('auth.email_label')}
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder={t('auth.placeholder_pro_email')}
              className={`w-full bg-[var(--bg-card)] border ${errors.email ? 'border-red-500' : 'border-[var(--border-main)]'} focus:border-[var(--primary)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none transition-all font-bold placeholder:text-[var(--text-dim)]`}
            />
            {errors.email && <span className="text-[9px] text-red-500 font-bold ms-2 uppercase tracking-tighter">{errors.email.message as string}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest ms-1">
              <MdPhone /> {t('auth.phone_label')}
            </label>
            <input
              {...register("phone")}
              type="text"
              placeholder={t('auth.placeholder_phone')}
              className={`w-full bg-[var(--bg-card)] border ${errors.phone ? 'border-red-500' : 'border-[var(--border-main)]'} focus:border-[var(--primary)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none transition-all font-bold placeholder:text-[var(--text-dim)]`}
            />
            {errors.phone && <span className="text-[9px] text-red-500 font-bold ms-2 uppercase tracking-tighter">{errors.phone.message as string}</span>}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest ms-1">
              <MdLock /> {t('auth.password_label')}
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder={t('auth.placeholder_password')}
              className={`w-full bg-[var(--bg-card)] border ${errors.password ? 'border-red-500' : 'border-[var(--border-main)]'} focus:border-[var(--primary)] rounded-2xl p-4 text-[var(--text-main)] focus:outline-none transition-all font-bold placeholder:text-[var(--text-dim)]`}
            />
            {errors.password && <span className="text-[9px] text-red-500 font-bold ms-2 uppercase tracking-tighter">{errors.password.message as string}</span>}
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest ms-1">
            <MdSecurity /> {t('auth.role_label')}
          </label>
          <div className="flex flex-wrap gap-3">
            {roles.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleRoleSelection(key)}
                className={`flex-1 min-w-[100px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  selectedRole.toLowerCase() === key
                    ? "bg-[var(--primary)] text-[var(--bg-card)] border-[var(--primary)] shadow-lg shadow-yellow-500/20"
                    : "bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-[var(--text-dim)] hover:text-[var(--text-main)]"
                }`}
              >
                {label}
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
              {t('auth.register_loading')}
            </span>
          ) : (
            <>
              <MdAppRegistration size={20} /> {t('auth.register_button')}
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default Register;
