import "./src/utils/terminalColorizer.js"; // Force hot-reload trigger v4
console.log("Starting POS Backend Server...");
import express, { Request, Response, NextFunction } from "express";
import { exec } from "child_process";
import fs from "fs";
import https from "https";
import config from "./config/config.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import modularRoutes from "./src/modules/routes.js";
import { pool } from "./src/config/database.js";
import { runWithCorrelationId } from "./src/utils/logger.js";
import { randomBytes } from "crypto";
import { initSocket } from "./src/utils/socket.js";
import { i18nMiddleware } from "./src/utils/i18n/i18n.js";

const app = express();
const PORT = config.port || 8000;

const corsOptions = {
  credentials: true,
  origin: (config.corsOrigin || "").split(",").map((url) => url.trim()),
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "x-shift-id", "x-pos-point-id"]
};

// Middlewares
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(i18nMiddleware);

// Correlation ID Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomBytes(8).toString('hex');
  res.setHeader('x-correlation-id', correlationId);
  runWithCorrelationId(correlationId, next);
});

// Debug Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === "OPTIONS" || req.originalUrl.includes("/api/")) {
    console.log(`[DEBUG] Incoming ${req.method} request to ${req.originalUrl}`);
    console.log(`[DEBUG] Cookies present:`, req.cookies ? Object.keys(req.cookies) : "None");
    console.log(`[DEBUG] Origin: ${req.headers.origin}`);
  }
  next();
});

// Root Endpoint - Status Check
app.get("/", async (req: Request, res: Response) => {
  let dbStatus = "Disconnected";
  try {
    const result = await pool.query("SELECT 1");
    if (result.rows) dbStatus = "Connected";
  } catch (e: any) {
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
app.get("/api-docs.json", (req: Request, res: Response) => {
  res.json(swaggerSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Modular Routes
app.use("/api", modularRoutes);

// Global Error Handler
app.use(globalErrorHandler);

// Server — Self-Healing Startup

const killPort = (port: number | string): Promise<void> => {
  return new Promise((resolve) => {
    // Windows command to find and kill the process on the port
    exec(
      `FOR /F "tokens=5" %i IN ('netstat -ano ^| findstr :${port} ^| findstr LISTENING') DO taskkill /PID %i /F`,
      () => {
        setTimeout(resolve, 800); // Wait for OS to release the port
      }
    );
  });
};

const startServer = async () => {
  const certPath = "./.cert/server.crt";
  const keyPath = "./.cert/server.key";
  let server: any;

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const options = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    server = https.createServer(options, app).listen(PORT);
    console.log(`🔒 POS Server is running on HTTPS port ${PORT}`);
  } else {
    server = app.listen(PORT);
    console.log(`✅ POS Server is running on HTTP port ${PORT}`);
  }

  // Initialize Sockets
  initSocket(server, corsOptions);

  server.on("listening", () => {
    console.log(`📚 Swagger Docs: ${fs.existsSync(certPath) ? 'https' : 'http'}://localhost:${PORT}/api-docs`);

    // Test DB connection
    pool.connect()
      .then((client) => {
        console.log("✅ PostgreSQL connected successfully");
        client.release(); // CRITICAL: Return client to pool to prevent leaks & idle crashes
      })
      .catch((err: any) => console.error("❌ PostgreSQL Connection Failed:", err.message));
  });

  server.on("error", async (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️  Port ${PORT} is in use. Killing occupying process and retrying...`);
      server.close();
      await killPort(PORT);
      console.log(`🔄 Retrying on port ${PORT}...`);
      // Retry after killing
      startServer();
    } else {
      console.error(`❌ Server error: ${err.message}`);
      process.exit(1);
    }
  });
};

startServer();
