import { JobsOptions, Queue } from "bullmq";

import { config } from "@draftly/config";

class QueueManager {
  private queues: Map<string, Queue>;

  constructor() {
    this.queues = new Map();
  }

  public getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: {
          host: config.REDIS_HOST,
          port: config.REDIS_PORT,
        },

        defaultJobOptions: this.getDefaultJobOptions(),
      });

      this.queues.set(name, queue);
    }

    return this.queues.get(name)!;
  }

  private getDefaultJobOptions(): JobsOptions {
    return {
      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 2000,
      },

      removeOnComplete: 100,

      removeOnFail: false,
    };
  }
}

export const queueManager = new QueueManager();
