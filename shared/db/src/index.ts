import pg from "pg";

import { drizzle } from "drizzle-orm/node-postgres";

import { config } from "@draftly/config";

import { logger } from "@draftly/logger";

const { Pool } = pg;

class DatabaseManager {
  public pool;

  public db;

  constructor() {
    this.pool = new Pool({
      host: config.POSTGRES_HOST,
      port: config.POSTGRES_PORT,
      user: config.POSTGRES_USER,
      password: config.POSTGRES_PASSWORD,
      database: config.POSTGRES_DB,
    });

    this.db = drizzle(this.pool);

    logger.info("PostgreSQL initialized");
  }

  public async testConnection() {
    const client = await this.pool.connect();

    await client.query("SELECT 1");

    client.release();

    logger.info("PostgreSQL connected");
  }
}

export const databaseManager = new DatabaseManager();
export * from "./repositories/index.js";
