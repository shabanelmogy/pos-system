import React from "react";
import { useTranslation } from "../../../node_modules/react-i18next";
import { motion } from "framer-motion";
import { MdLanguage } from "react-icons/md";

export const LanguageSwitcher: React.FC = () => {
  const { i18n: i18nInstance } = useTranslation();
  const currentLanguage = i18nInstance.language;

  const toggleLanguage = () => {
    const nextLang = currentLanguage.startsWith('ar') ? 'en' : 'ar';
    i18nInstance.changeLanguage(nextLang).then(() => {
      // Fail-safe direction enforcement
      const dir = nextLang.startsWith('ar') ? 'rtl' : 'ltr';
      document.documentElement.dir = dir;
      document.documentElement.lang = nextLang;
    });
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className="group relative flex h-8 cursor-pointer items-center gap-1.5 overflow-hidden rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] px-2 text-[var(--text-main)] shadow-sm transition-all hover:border-[var(--primary)] 2xl:h-11 2xl:gap-2 2xl:rounded-2xl 2xl:px-3"
      title="Switch Language"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="me-0.5 hidden h-1 w-1 animate-pulse rounded-full bg-[var(--primary)] sm:block 2xl:me-1" />

      <div className="hidden flex-col items-start leading-none lg:flex">
        <span className="mb-px text-[7px] font-black uppercase tracking-tighter text-[var(--text-muted)] 2xl:mb-0.5 2xl:text-[8px]">Language</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-main)] 2xl:text-[10px]">
          {currentLanguage === "en" ? "English" : "العربية"}
        </span>
      </div>

      <MdLanguage className={`text-lg text-[var(--primary)] transition-all duration-500 2xl:text-xl ${currentLanguage === 'ar' ? 'rotate-180' : ''}`} />
    </motion.button>
  );
};
