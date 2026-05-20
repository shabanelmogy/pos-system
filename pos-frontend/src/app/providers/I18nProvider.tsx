import React, { useEffect, useState } from 'react';
import i18n from "@/i18n/config";
import { useTranslation } from 'react-i18next';

export const getDirection = (lng: string) => {
  return lng.startsWith('ar') ? 'rtl' : 'ltr';
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n: i18nInstance } = useTranslation();
  const [ready, setReady] = useState(i18n.isInitialized);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (lng) {
        const dir = getDirection(lng);
        document.documentElement.dir = dir;
        document.documentElement.lang = lng;
      }
    };

    // Listen for events directly on the global instance
    i18n.on('languageChanged', handleLanguageChange);
    i18n.on('initialized', () => {
      handleLanguageChange(i18n.language);
      setReady(true);
    });

    // Initial check
    if (i18n.isInitialized) {
      handleLanguageChange(i18n.language);
    }

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  if (!ready) return null;

  return <>{children}</>;
};
