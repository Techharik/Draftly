import Redis from "ioredis";

import { config } from "@draftly/config";
import { logger } from "@draftly/logger";

class RedisManager {
  private client;

  constructor() {
    this.client = new Redis.default({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
    });

    this.client.on("connect", () => {
      logger.info("Redis connected");
    });

    this.client.on("error", (err) => {
      logger.error(err, "Redis connection failed");
    });
  }

  public getClient() {
    return this.client;
  }
}

export const redisManager = new RedisManager();
