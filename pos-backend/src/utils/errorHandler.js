import logger from "./logger.js";

/**
 * Standardized error thrower for services
 * @param {string} message 
 * @param {number} status 
 */
export const fail = (message, status = 400) => {
    const error = new Error(message);
    error.statusCode = status;
    throw error;
};

/**
 * Standardized error handler for controllers
 * @param {object} res - Express response object
 * @param {Error} error - The caught error
 * @param {string} context - Where the error occurred
 */
export const handleError = (res, error, context) => {
    logger.error(`Error in ${context}`, error, { context });
    
    let statusCode = error.statusCode || 500;
    let message = error.message || "Internal Server Error";
    
    // Handle Zod validation errors
    if (error.name === "ZodError" || error.issues) {
        statusCode = 400;
        const issues = error.issues || error.errors || [];
        message = issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    }
    
    return res.status(statusCode).json({
        success: false,
        message,
        details: error.name === "ZodError" ? error.errors : undefined,
        context: process.env.NODE_ENV === 'development' ? context : undefined
    });
};
