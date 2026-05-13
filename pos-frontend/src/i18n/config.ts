import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ── Shared ──────────────────────────────────────────────
import sharedEn from '../shared/i18n/en.json';
import sharedAr from '../shared/i18n/ar.json';

// ── Features ─────────────────────────────────────────────
import authEn from '../features/auth/i18n/en.json';
import authAr from '../features/auth/i18n/ar.json';

import posEn from '../features/pos/i18n/en.json';
import posAr from '../features/pos/i18n/ar.json';

import dashboardEn from '../features/dashboard/i18n/en.json';
import dashboardAr from '../features/dashboard/i18n/ar.json';

import ordersEn from '../features/orders/i18n/en.json';
import ordersAr from '../features/orders/i18n/ar.json';

import customersEn from '../features/customers/i18n/en.json';
import customersAr from '../features/customers/i18n/ar.json';

import tablesEn from '../features/tables/i18n/en.json';
import tablesAr from '../features/tables/i18n/ar.json';

import settingsEn from '../features/settings/i18n/en.json';
import settingsAr from '../features/settings/i18n/ar.json';

const resources = {
  en: {
    translation: {
      ...sharedEn,
      ...authEn,
      ...posEn,
      ...dashboardEn,
      ...ordersEn,
      ...customersEn,
      ...tablesEn,
      ...settingsEn,
    }
  },
  ar: {
    translation: {
      ...sharedAr,
      ...authAr,
      ...posAr,
      ...dashboardAr,
      ...ordersAr,
      ...customersAr,
      ...tablesAr,
      ...settingsAr,
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    load: 'languageOnly',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
