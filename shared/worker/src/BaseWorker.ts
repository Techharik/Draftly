import { Job, Worker } from "bullmq";

import { config } from "@draftly/config";

import { logger } from "@draftly/logger";

export abstract class BaseWorker<T> {
  private worker: Worker;

  constructor(queueName: string) {
    this.worker = new Worker(
      queueName,

      async (job: Job<T>) => {
        logger.info({
          worker: this.constructor.name,
          queue: queueName,
          jobId: job.id,
          data: job.data,
        });

        await this.process(job);
      },

      {
        connection: {
          host: config.REDIS_HOST,
          port: config.REDIS_PORT,
        },
      },
    );

    this.registerEvents();
  }

  protected abstract process(job: Job<T>): Promise<void>;

  private registerEvents() {
    this.worker.on("completed", (job) => {
      logger.info({
        worker: this.constructor.name,
        status: "completed",
        jobId: job.id,
      });
    });

    this.worker.on("failed", (job, err) => {
      logger.error({
        worker: this.constructor.name,
        status: "failed",
        jobId: job?.id,
        error: err.message,
      });
    });
  }
}
