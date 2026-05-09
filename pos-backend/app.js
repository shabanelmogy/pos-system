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

// Root Endpoint
app.get("/", (req,res) => {
    res.redirect("/api-docs");
})

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
