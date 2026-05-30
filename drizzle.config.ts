import "dotenv/config";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/db/src/schema/*",

  out: "./drizzle",

  dialect: "postgresql",

  dbCredentials: {
    host: process.env.POSTGRES_HOST || "127.0.0.1",

    port: Number(process.env.POSTGRES_PORT || 5432),

    user: process.env.POSTGRES_USER || "draftly",

    password: process.env.POSTGRES_PASSWORD || "draftly",

    database: process.env.POSTGRES_DB || "draftly",
    ssl: false,
  },
});
