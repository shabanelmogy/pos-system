import type { StorefrontConfig } from "../types";

export const STOREFRONT_CONFIGS: Record<string, StorefrontConfig> = {
  en: {
    locale: "en",
    currency: "USD",
    currencySymbol: "$",
    localeCode: "en-US",
    dir: "ltr",
  },
  ar: {
    locale: "ar",
    currency: "EGP",
    currencySymbol: "ج.م",
    localeCode: "ar-EG",
    dir: "rtl",
  },
};

export function getStorefrontConfig(locale = "en"): StorefrontConfig {
  return STOREFRONT_CONFIGS[locale] || STOREFRONT_CONFIGS.en;
}

export function formatPrice(
  amount: number,
  config: StorefrontConfig
): string {
  return new Intl.NumberFormat(config.localeCode, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDiscount(discount: number): string {
  return `-${discount}%`;
}
