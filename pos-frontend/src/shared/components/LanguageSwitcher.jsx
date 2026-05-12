import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { MdLanguage } from "react-icons/md";

export const LanguageSwitcher = () => {
  const { i18n: i18nInstance } = useTranslation();
  const currentLanguage = i18nInstance.language;

  const toggleLanguage = () => {
    const nextLang = currentLanguage === "en" ? "ar" : "en";
    i18nInstance.changeLanguage(nextLang);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className="bg-[var(--bg-main)] border border-[var(--border-main)] hover:border-[var(--primary)] text-[var(--text-main)] rounded-xl px-3 h-11 cursor-pointer transition-all shadow-sm flex items-center gap-2 group relative overflow-hidden"
      title="Switch Language"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <MdLanguage className={`text-xl transition-all duration-500 ${currentLanguage === 'ar' ? 'rotate-180' : ''} text-[var(--primary)]`} />
      
      <div className="flex flex-col items-start leading-none hidden lg:flex">
        <span className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-tighter mb-0.5">Language</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">
          {currentLanguage === "en" ? "English" : "العربية"}
        </span>
      </div>

      <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-pulse hidden sm:block ms-1"></div>
    </motion.button>
  );
};
