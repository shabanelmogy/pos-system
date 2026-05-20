import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import config from "../config/config.js";

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err instanceof ZodError) {
        statusCode = 400;
        message = err.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(", ");
    }

    if (err.name === "ValidationError" && err.errors) {
        statusCode = 400;
        message = Object.values(err.errors).map((error: any) => error.message).join(", ");
    }

    if (err.code === "23505") { // PostgreSQL Unique constraint violation
        statusCode = 409;
        message = "Duplicate entry found";
    }

    console.error(`[${req.method}] ${req.originalUrl} ${statusCode}: ${message}`);

    return res.status(statusCode).json({
        success: false,
        status: statusCode,
        message,
        error: err.name !== 'Error' ? err.name : undefined,
        stack: config.nodeEnv === "development" ? err.stack : undefined
    });
};

export default globalErrorHandler;
