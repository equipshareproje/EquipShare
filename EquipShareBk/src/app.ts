import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { apiReference } from "@scalar/express-api-reference";
import { env } from "./config/env";
import { generateOpenApiSpec } from "./config/openapi";
import { registerModules } from "./modules";
import { errorHandler } from "./shared/middleware/errorHandler";
import { notFound } from "./shared/middleware/notFound";

const app = express();

// Trust the Azure Container Apps / reverse-proxy forwarded headers
app.set("trust proxy", 1);

// API docs — registered before helmet so CSP doesn't block Scalar's CDN
const spec = generateOpenApiSpec();
app.get("/api/docs/spec.json", (_req, res) => res.json(spec));
app.use("/api/docs", apiReference({ spec: { url: "/api/docs/spec.json" } }));

// Security
app.use(helmet());
app.use(
  cors({
    origin: [
      "https://witty-mud-0d2a7a10f.7.azurestaticapps.net",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check — fast response, no DB dependency (required for Container Apps)
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Routes
registerModules(app);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
