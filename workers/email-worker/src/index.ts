import { Worker } from "bullmq";

import { redisManager } from "@draftly/redis";

import { logger } from "@draftly/logger";

import { QueueName } from "@draftly/types";

import { UserRepository } from "@draftly/db";

import { queueManager } from "@draftly/queue";

import { GmailService } from "../../../apps/api-server/src/services/GmailService.js";

import { EmailService } from "../../../apps/api-server/src/services/EmailService.js";

const userRepository = new UserRepository();

const gmailService = new GmailService();

const emailService = new EmailService();

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

    logger.info({
      storedHistoryId: user.last_history_id,

      type: typeof user.last_history_id,
    });

    // IMPORTANT:
    // use PREVIOUS checkpoint
    // not incoming webhook historyId
    const history = await gmailService.getHistory(
      user.access_token,

      user.refresh_token,

      String(user.last_history_id),
    );

    logger.info({
      history,
    });

    const historyItems = history.history || [];

    for (const item of historyItems) {
      // ONLY NEW EMAILS
      const messages = item.messagesAdded || [];

      for (const entry of messages) {
        const message = entry.message;

        if (!message?.id) {
          continue;
        }

        let fullMessage;

        try {
          fullMessage = await gmailService.getMessage(
            user.access_token,

            user.refresh_token,

            message.id,
          );
        } catch (error: any) {
          logger.error({
            gmailMessageId: message.id,

            error: error.message,
          });

          continue;
        }

        if (!fullMessage) {
          continue;
        }

        // FILTERING
        const labels = fullMessage.labelIds || [];

        const ignoredLabels = [
          "CATEGORY_PROMOTIONS",
          "CATEGORY_SOCIAL",
          "SENT",
        ];

        const shouldIgnore = labels.some((label) =>
          ignoredLabels.includes(label),
        );

        if (shouldIgnore) {
          logger.info({
            message: "Skipping ignored email",

            labels,

            gmailMessageId: fullMessage.id,
          });

          continue;
        }

        // PARSING
        const headers = fullMessage.payload?.headers || [];

        const subject = gmailService.getHeader(headers, "Subject");

        const from = gmailService.getHeader(headers, "From");

        const body = gmailService.extractBody(fullMessage.payload);

        const cleanedBody = gmailService.cleanEmailBody(body);

        logger.info({
          gmailMessageId: fullMessage.id,

          threadId: fullMessage.threadId,

          subject,

          from,

          body: cleanedBody.slice(0, 200),
        });

        // SAVE EMAIL
        const savedEmail = await emailService.createEmail({
          gmailMessageId: fullMessage.id!,

          gmailThreadId: fullMessage.threadId!,

          subject,

          from,

          body: cleanedBody,
        });

        logger.info({
          message: "EMAIL SAVED",

          emailId: savedEmail.id,

          subject,
        });

        // AI QUEUE
        const aiQueue = queueManager.getQueue(QueueName.AI_DRAFT);

        await aiQueue.add(
          "generate-draft",

          {
            emailId: savedEmail.id,

            body: cleanedBody,

            subject,
          },
        );

        logger.info({
          message: "AI JOB ADDED",

          emailId: savedEmail.id,
        });
      }
    }

    // UPDATE CHECKPOINT
    await userRepository.updateHistoryId(
      user.id,

      String(job.data.historyId),
    );

    logger.info({
      message: "History checkpoint updated",

      historyId: job.data.historyId,
    });
  },

  {
    connection: redisManager.getClient(),
  },
);

worker.on(
  "completed",

  (job) => {
    logger.info({
      worker: "EmailWorker",

      status: "completed",

      jobId: job.id,
    });
  },
);

worker.on(
  "failed",

  (job, error) => {
    logger.error({
      worker: "EmailWorker",

      status: "failed",

      jobId: job?.id,

      error: error.message,
    });
  },
);

logger.info("Email Worker Started");
