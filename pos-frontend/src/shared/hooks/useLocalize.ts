import { useTranslation } from 'react-i18next';
import { LocalizedString } from "@/shared/types";

/**
 * Hook to automatically extract the localized string based on the current active language.
 */
export const useLocalize = () => {
  const { i18n } = useTranslation();

  const localize = (val: LocalizedString | string | undefined | null): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;

    const currentLang = i18n.language || 'en';
    
    // If current lang is available, return it. Otherwise fallback to 'en', then first available.
    if (currentLang === 'ar' && val.ar) return val.ar;
    if (val.en) return val.en;
    
    // Ultimate fallback if malformed data
    return Object.values(val)[0] || '';
  };

  return { localize };
};

export default useLocalize;
