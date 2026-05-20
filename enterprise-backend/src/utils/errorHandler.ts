import { Response } from "express";
import logger from "./logger.js";

export interface CustomError extends Error {
  statusCode?: number;
  issues?: any[];
  errors?: any[];
}

export const fail = (message: string, status: number = 400): never => {
    const error = new Error(message) as CustomError;
    error.statusCode = status;
    throw error;
};

export const handleError = (res: Response, error: any, context: string): Response => {
    logger.error(`Error in ${context}: ${error.message || error}`);
    
    let statusCode = error.statusCode || 500;
    let message = error.message || "errors.internal";
    
    if (error.name === "ZodError" || error.issues) {
        statusCode = 400;
        const issues = error.issues || error.errors || [];
        message = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
    } else {
        if (res.req && typeof (res.req as any).t === 'function') {
            const t = (res.req as any).t;
            let key = message;
            if (key === "Internal Server Error") {
                key = "errors.internal";
            }
            message = t(key);
        }
    }
    
    return res.status(statusCode).json({
        success: false,
        message,
        details: error.name === "ZodError" ? error.errors : undefined,
        context: process.env.NODE_ENV === 'development' ? context : undefined
    });
};
