console.log("Starting POS Backend Server...");
try {
const express = require("express");
const connectDB = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const app = express();

const PORT = config.port || 8000;
const corsOptions = {
    credentials: true,
    origin: (config.corsOrigin || "").split(",").map((url) => url.trim()),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"]
};

// Middlewares
app.use(cors(corsOptions))
app.options("*", cors(corsOptions))
app.use(express.json()); // parse incoming request in json format
app.use(cookieParser())

// Debug Middleware
app.use((req, res, next) => {
    if (req.method === "OPTIONS" || req.originalUrl.includes("/api/")) {
        console.log(`[DEBUG] Incoming ${req.method} request from Origin: ${req.headers.origin}`);
    }
    next();
});

// Root Endpoint - Status Check
app.get("/", (req, res) => {
    const mongoose = require("mongoose");
    res.json({
        status: "Online",
        database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        node_env: process.env.NODE_ENV,
        cors_configured: config.corsOrigin
    });
});

// Log Viewer - View server logs from browser
app.get("/debug-logs", (req, res) => {
    const fs = require("fs");
    const path = require("path");
    const logDir = path.join(__dirname, "logs");
    
    try {
        if (!fs.existsSync(logDir)) {
            return res.send("Logs directory not found.");
        }
        
        const files = fs.readdirSync(logDir).filter(f => f.startsWith("node"));
        if (files.length === 0) {
            return res.send("No log files found yet. Make sure stdoutLogEnabled='true' in web.config.");
        }
        
        // Sort by modification time to get latest
        files.sort((a, b) => {
            return fs.statSync(path.join(logDir, b)).mtime.getTime() - 
                   fs.statSync(path.join(logDir, a)).mtime.getTime();
        });
        
        const latestLog = path.join(logDir, files[0]);
        const content = fs.readFileSync(latestLog, "utf8");
        
        res.header("Content-Type", "text/plain");
        res.send(`Latest Log File: ${files[0]}\n\n${content}`);
    } catch (error) {
        res.status(500).send("Error reading logs: " + error.message);
    }
});

app.get("/api-docs.json", (req, res) => {
    res.json(swaggerSpec);
})

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Other Endpoints
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/table", require("./routes/tableRoute"));
app.use("/api/payment", require("./routes/paymentRoute"));

// Global Error Handler
app.use(globalErrorHandler);

// Server
const startServer = async () => {
    try {
        // Start listening FIRST so IIS doesn't timeout
        app.listen(PORT, () => {
            console.log(`POS Server is listening on port ${PORT}`);
        });

        // Then connect to DB in the background
        connectDB().then(() => {
            console.log("Database connected successfully");
        }).catch((err) => {
            console.error("Delayed Database Connection Failed:", err.message);
        });

    } catch (error) {
        console.error(`Server startup failed: ${error.message}`);
        process.exit(1);
    }
}

startServer();
} catch (startupError) {
    console.error("CRITICAL STARTUP ERROR:", startupError);
    process.exit(1);
}
