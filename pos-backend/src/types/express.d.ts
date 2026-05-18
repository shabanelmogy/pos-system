import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      language: string;
      t: (key: string, replacements?: Record<string, string | number>) => string;
    }
  }
}
