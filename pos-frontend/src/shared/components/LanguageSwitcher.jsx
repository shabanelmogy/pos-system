import i18n from "i18next";
import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

export const LanguageSwitcher = () => {
  const { i18n: i18nInstance } = useTranslation();
  const currentLanguage = i18nInstance.language;

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
  ];

  const toggleLanguage = () => {
    const nextLang = currentLanguage === "en" ? "ar" : "en";
    i18nInstance.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="bg-[var(--bg-main)] border border-[var(--border-main)] hover:border-[var(--primary)] text-[var(--text-main)] rounded-xl px-3 h-11 cursor-pointer transition-all shadow-sm flex items-center gap-2 group"
      title="Switch Language"
    >
      <span className="text-lg group-hover:scale-110 transition-transform">
        {currentLanguage === "en" ? "🇺🇸" : "🇸🇦"}
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">
        {currentLanguage === "en" ? "EN" : "AR"}
      </span>
    </button>
  );
};
