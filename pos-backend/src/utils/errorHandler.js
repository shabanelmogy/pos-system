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
    console.error(`[ERROR] ${context}:`, error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    
    return res.status(statusCode).json({
        success: false,
        message,
        error: error.name !== 'Error' ? error.name : undefined,
        context: process.env.NODE_ENV === 'development' ? context : undefined
    });
};
