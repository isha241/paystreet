import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";

// Import routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import beneficiaryRoutes from "./routes/beneficiaries";
import transactionRoutes from "./routes/transactions";
import fxRoutes from "./routes/fx-rates";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || "5001", 10);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Logging middleware
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Debug endpoint
app.get("/debug", (req: Request, res: Response) => {
  res.json({
    environment: process.env.NODE_ENV,
    currentDir: __dirname,
    workingDir: process.cwd(),
    frontendPath: path.join(__dirname, "../frontend/build"),
    frontendExists: require("fs").existsSync(
      path.join(__dirname, "../frontend/build")
    ),
    parentDirContents: require("fs").readdirSync(path.join(__dirname, "..")),
  });
});

// API routes - defined BEFORE environment-specific logic
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/beneficiaries", beneficiaryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/fx-rates", fxRoutes);

// Serve frontend build files in production
if (process.env.NODE_ENV === "production") {
  console.log("🚀 Production mode - serving frontend build files");

  // The frontend build is in the parent directory's frontend/build folder
  const frontendPath = path.join(__dirname, "../frontend/build");

  console.log(`🔍 Looking for frontend build at: ${frontendPath}`);

  try {
    // Check if the frontend build exists
    const indexPath = path.join(frontendPath, "index.html");
    require("fs").accessSync(indexPath, require("fs").constants.F_OK);
    console.log(`✅ Found frontend build at: ${frontendPath}`);

    // Serve static files from the frontend build directory
    app.use(express.static(frontendPath));

    // Handle React routing - send all non-API requests to index.html
    app.get("*", (req: Request, res: Response) => {
      // Don't serve frontend for API routes
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({
          error: "Route not found",
          path: req.originalUrl,
        });
      }

      console.log(`📱 Serving frontend for route: ${req.path}`);
      // Serve frontend for all other routes
      return res.sendFile(path.join(frontendPath, "index.html"));
    });
  } catch (error) {
    console.log(`❌ Frontend build not found at: ${frontendPath}`);
    console.log("Current directory:", __dirname);
    console.log("Working directory:", process.cwd());

    // List contents of current and parent directories
    try {
      const fs = require("fs");
      console.log("Current dir contents:", fs.readdirSync(__dirname));
      console.log(
        "Parent dir contents:",
        fs.readdirSync(path.join(__dirname, ".."))
      );
    } catch (e) {
      console.log("Could not list directory contents:", (e as Error).message);
    }

    // Note: Removed the problematic fallback catch-all route
    // that was intercepting API requests
  }
} else {
  console.log(" Development mode - API-only");
}

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error("Global error handler:", err);

  if (err.name === "ValidationError") {
    res.status(400).json({
      error: "Validation failed",
      details: err.message,
    });
    return;
  }

  if (err.name === "UnauthorizedError") {
    res.status(401).json({
      error: "Unauthorized",
    });
    return;
  }

  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PayStreet Backend Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
});

export default app;
