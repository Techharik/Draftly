import Redis from "ioredis";

import { config } from "@draftly/config";

export const publisher = new Redis.default({
  host: config.REDIS_HOST,

  port: config.REDIS_PORT,

  maxRetriesPerRequest: null,
});

export const subscriber = new Redis.default({
  host: config.REDIS_HOST,

  port: config.REDIS_PORT,

  maxRetriesPerRequest: null,
});
