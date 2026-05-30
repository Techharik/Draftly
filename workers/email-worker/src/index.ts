import { Worker } from "bullmq";

import { redisManager } from "@draftly/redis";

import { logger } from "@draftly/logger";

import { QueueName } from "@draftly/types";

import { UserRepository } from "@draftly/db";

import { GmailService } from "../../../apps/api-server/src/services/GmailService.js";
import { EmailService } from "../../../apps/api-server/src/services/EmailService.js";
const userRepository = new UserRepository();

const gmailService = new GmailService();

const worker = new Worker(
  QueueName.EMAIL_FETCH,

  async (job) => {
    logger.info({
      message: "Received Gmail webhook job",

      payload: job.data,
    });

    const user = await userRepository.findByGoogleEmail(job.data.emailAddress);

    if (!user) {
      throw new Error("User not found");
    }

    const history = await gmailService.getHistory(
      user.access_token,

      user.refresh_token,

      job.data.historyId,
    );

    logger.info({
      history,
    });

    const historyItems = history.history || [];

    for (const item of historyItems) {
      const messages = item.messages || [];

      for (const message of messages) {
        if (!message.id) {
          continue;
        }

        const fullMessage = await gmailService.getMessage(
          user.access_token,

          user.refresh_token,

          message.id,
        );

        const headers = fullMessage.payload?.headers || [];

        const subject = gmailService.getHeader(headers, "Subject");

        const from = gmailService.getHeader(headers, "From");
        const emailService = new EmailService();

        await emailService.createEmail({
          gmailMessageId: fullMessage.id!,

          gmailThreadId: fullMessage.threadId!,

          subject,

          from,

          body: "",
        });

        logger.info({
          gmailMessageId: fullMessage.id,

          threadId: fullMessage.threadId,

          subject,

          from,
        });
      }
    }
  },

  {
    connection: redisManager.getClient(),
  },
);

worker.on("completed", (job) => {
  logger.info({
    worker: "EmailWorker",
    status: "completed",
    jobId: job.id,
  });
});

worker.on("failed", (job, error) => {
  logger.error({
    worker: "EmailWorker",
    status: "failed",
    jobId: job?.id,
    error: error.message,
  });
});

logger.info("Email Worker Started");
