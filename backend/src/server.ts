import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import rateLimit from "express-rate-limit";
import { config } from "./config/index.js";
import { initDb } from "./db/db.js";

import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import alertRoutes from "./routes/alert.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or localhost
      if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
  })
);

// Rate limiting (generous for dev, secure for prod)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // 1000 requests per 15 min
  message: { message: "Too many requests from this IP, please try again later." },
});
app.use("/api", limiter);

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (config.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

// Serve uploaded complaint photos statically
const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    system: "Smart City Management & Citizen Services Platform API",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/users", userRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
    ...(config.nodeEnv === "development" ? { stack: err.stack } : {}),
  });
});

// Start Server
async function start() {
  try {
    await initDb();
    const server = app.listen(config.port, () => {
      console.log("==================================================");
      console.log(`🏙️  Smart City Management API Server running!`);
      console.log(`📡 URL: http://localhost:${config.port}`);
      console.log(`🩺 Health: http://localhost:${config.port}/api/health`);
      console.log(`📸 Uploads: http://localhost:${config.port}/uploads`);
      console.log("==================================================");
    });

    server.on("error", (e: any) => {
      if (e.code === "EADDRINUSE") {
        console.error(`Port ${config.port} is already in use.`);
      } else {
        console.error("Server error:", e);
      }
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

export default app;