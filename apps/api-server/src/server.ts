import { app } from "./app.js";

import { config } from "@draftly/config";

import { logger } from "@draftly/logger";
import { createServer } from "http";
import { startRealtime } from "./realtime.js";
import { initSocket } from "./socket.js";
async function bootstrap() {
  try {
    const httpServer = createServer(app);

    initSocket(httpServer);
    startRealtime();
    httpServer.listen(
      config.PORT,

      () => {
        logger.info(`Server running`);
      },
    );
  } catch (error) {
    logger.error(error);

    process.exit(1);
  }
}

bootstrap();
