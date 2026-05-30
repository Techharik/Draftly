import express from "express";

import cors from "cors";

import { healthRouter } from "./routes/health.js";
import { testRouter } from "./routes/test.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import { authRouter } from "./routes/auth.js";
import { webhookRouter } from "./routes/webhooks.js";
const app = express();

app.use(cors());

app.use(express.json());

app.use("/health", healthRouter);
app.use("/test", testRouter);
app.use("/auth", authRouter);
app.use("/webhooks", webhookRouter);
app.use(errorMiddleware);
export { app };
