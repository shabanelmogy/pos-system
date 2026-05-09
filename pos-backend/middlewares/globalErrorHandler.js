const config = require("../config/config");

const globalErrorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map((error) => error.message).join(", ");
    }

    if (err.code === 11000) {
        statusCode = 409;
        const fields = Object.keys(err.keyValue || {}).join(", ");
        message = `${fields || "Record"} already exists`;
    }

    console.error(`[${req.method}] ${req.originalUrl} ${statusCode}: ${message}`);

    return res.status(statusCode).json({
        success: false,
        status: statusCode,
        message,
        error: err.name,
        // Include stack only in development
        stack: config.nodeEnv === "development" ? err.stack : undefined
    })
}

module.exports = globalErrorHandler;
