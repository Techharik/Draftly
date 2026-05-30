import { Job } from "bullmq";

import { QueueName } from "@draftly/types";

import { logger } from "@draftly/logger";

import { BaseWorker } from "@draftly/worker";

interface EmailJobData {
  emailId: string;
}

class EmailWorker extends BaseWorker<EmailJobData> {
  constructor() {
    super(QueueName.EMAIL_FETCH);
  }

  protected async process(job: Job<EmailJobData>): Promise<void> {
    logger.info({
      message: "Received Gmail webhook job",

      payload: job.data,
    });
  }
}

new EmailWorker();

logger.info("Email Worker Started");
