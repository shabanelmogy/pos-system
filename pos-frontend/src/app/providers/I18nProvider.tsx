import React, { useEffect, useState } from 'react';
import i18n from '../../i18n/config';

export const getDirection = (lng: string) => {
  return lng.startsWith('ar') ? 'rtl' : 'ltr';
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const dir = getDirection(lng);
      document.documentElement.dir = dir;
      document.documentElement.lang = lng;
    };

    const onInitialized = () => {
      handleLanguageChange(i18n.language);
      setReady(true);
    };

    if (i18n.isInitialized) {
      onInitialized();
    } else {
      i18n.on('initialized', onInitialized);
    }

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('initialized', onInitialized);
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  if (!ready) return null;

  return <>{children}</>;
};
