console.log("Starting POS Backend Server...");
import express from "express";
import config from "./config/config.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import modularRoutes from "./src/modules/routes.js";
import { pool } from "./src/config/database.js";

const app = express();
const PORT = config.port || 8000;

const corsOptions = {
  credentials: true,
  origin: (config.corsOrigin || "").split(",").map((url) => url.trim()),
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
};

// Middlewares
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Debug Middleware
app.use((req, res, next) => {
  if (req.method === "OPTIONS" || req.originalUrl.includes("/api/")) {
    console.log(`[DEBUG] Incoming ${req.method} request from Origin: ${req.headers.origin}`);
  }
  next();
});

// Root Endpoint - Status Check
app.get("/", async (req, res) => {
  let dbStatus = "Disconnected";
  try {
    const result = await pool.query("SELECT 1");
    if (result.rows) dbStatus = "Connected";
  } catch (e) {
    dbStatus = "Error: " + e.message;
  }

  res.json({
    status: "Online",
    database: dbStatus,
    node_env: process.env.NODE_ENV,
    cors_configured: config.corsOrigin
  });
});

// API Docs
app.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Modular Routes
app.use("/api", modularRoutes);

// Global Error Handler
app.use(globalErrorHandler);

// Server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`POS Server is listening on port ${PORT}`);
      console.log(`Swagger Docs available at: http://localhost:${PORT}/api-docs`);
    });


    // Test DB connection
    pool.connect()
      .then(() => console.log("PostgreSQL connected successfully"))
      .catch(err => console.error("PostgreSQL Connection Failed:", err.message));

  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
