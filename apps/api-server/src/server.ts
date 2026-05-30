import { app } from "./app.js";

import { config } from "@draftly/config";

import { logger } from "@draftly/logger";

async function bootstrap() {
  try {
    app.listen(config.PORT, () => {
      logger.info({
        message: "API Server Started",
        port: config.PORT,
      });
    });
  } catch (error) {
    logger.error(error);

    process.exit(1);
  }
}

bootstrap();
