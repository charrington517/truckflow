import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { boostRouter } from "./routes/boost.routes";
import { eventsRouter } from "./routes/events.routes";
import { flowIntelRouter } from "./routes/flowIntel.routes";
import { healthRouter } from "./routes/health.routes";
import { leadsRouter } from "./routes/leads.routes";
import { localDataRouter } from "./routes/local-data.routes";
import { locationsRouter } from "./routes/locations.routes";
import { menuRouter } from "./routes/menu.routes";
import { reportRouter } from "./routes/report.routes";

const allowedOrigins = new Set([
  "http://192.168.0.210:3000",
  "http://192.168.0.210",
  "https://truckflow.konhomelab.com",
  "http://localhost:3000"
]);

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  })
);
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", healthRouter);
app.use("/api", reportRouter);
app.use("/api", leadsRouter);
app.use("/api", localDataRouter);
app.use("/api", locationsRouter);
app.use("/api", menuRouter);
app.use("/api", eventsRouter);
app.use("/api", flowIntelRouter);
app.use("/api", boostRouter);

app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({
      error: "Invalid JSON body",
      message: "Request body must be valid JSON."
    });
  }

  return next(error);
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});
