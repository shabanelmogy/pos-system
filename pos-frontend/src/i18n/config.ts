import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ── Shared ──────────────────────────────────────────────
import sharedEn from "@/shared/i18n/en.json";
import sharedAr from "@/shared/i18n/ar.json";

// ── Features ─────────────────────────────────────────────
import authEn from "@/features/system/auth/i18n/en.json";
import authAr from "@/features/system/auth/i18n/ar.json";

import posEn from "@/features/pos/terminal/i18n/en.json";
import posAr from "@/features/pos/terminal/i18n/ar.json";

import dashboardEn from "@/features/reporting/dashboard/i18n/en.json";
import dashboardAr from "@/features/reporting/dashboard/i18n/ar.json";

import ordersEn from "@/features/pos/order/i18n/en.json";
import ordersAr from "@/features/pos/order/i18n/ar.json";

import customersEn from "@/features/crm/customer/i18n/en.json";
import customersAr from "@/features/crm/customer/i18n/ar.json";

import tablesEn from "@/features/pos/table/i18n/en.json";
import tablesAr from "@/features/pos/table/i18n/ar.json";

import settingsEn from "@/features/system/settings/i18n/en.json";
import settingsAr from "@/features/system/settings/i18n/ar.json";

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
