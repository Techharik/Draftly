import express from "express";

import cors from "cors";

import { healthRouter } from "./routes/health.js";
import { testRouter } from "./routes/test.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
const app = express();

app.use(cors());

app.use(express.json());

app.use("/health", healthRouter);
app.use("/test", testRouter);
app.use(errorMiddleware);
export { app };
