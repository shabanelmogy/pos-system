import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localesDir = path.join(__dirname, "locales");

const translations: Record<string, Record<string, string>> = {};

// Sync function to load translation files at startup
const initTranslations = (): void => {
  try {
    const langs = fs.readdirSync(localesDir);
    for (const lang of langs) {
      const langPath = path.join(localesDir, lang);
      if (!fs.statSync(langPath).isDirectory()) continue;

      translations[lang] = {};
      const files = fs.readdirSync(langPath);

      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        const filePath = path.join(langPath, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(content);

        const ns = path.basename(file, ".json");
        
        // Flatten and merge
        Object.entries(data).forEach(([key, val]) => {
          if (typeof val === "string") {
            if (ns === "common") {
              translations[lang][key] = val;
            } else {
              translations[lang][`${ns}.${key}`] = val;
            }
          }
        });
      }
    }
  } catch (error) {
    console.error("❌ Failed to load localization files:", error);
  }
};

// Initialize translations synchronously at boot
initTranslations();

export const i18nMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // 1. Detect language (Query parameter ?lang=, x-language header, or Accept-Language header)
  let lang = req.query.lang || req.headers["x-language"] || req.headers["accept-language"];
  
  if (typeof lang !== "string") {
    lang = "en";
  } else {
    // Parse Accept-Language like "en-US,en;q=0.9,ar;q=0.8"
    lang = lang.split(",")[0].split("-")[0].trim().toLowerCase();
  }

  // Fallback to "en" if language not supported
  if (!translations[lang]) {
    lang = "en";
  }

  req.language = lang;

  // 2. Define the t() translation function
  req.t = (key: string, replacements?: Record<string, string | number>): string => {
    const dict = translations[lang] || translations.en;
    let text = dict[key] || translations.en[key] || key;

    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, "g"), String(v));
      });
    }

    return text;
  };

  next();
};
