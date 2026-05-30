import { Worker } from "bullmq";

import { QueueName } from "@draftly/types";

import { redisManager } from "@draftly/redis";

import { logger } from "@draftly/logger";

import { DraftRepository } from "@draftly/db";

import { AIService } from "../../../apps/api-server/src/services/AIService.js";

const draftRepository = new DraftRepository();

const aiService = new AIService();
import { publisher } from "@draftly/redis";

import { RealtimeEvent } from "@draftly/types";

const worker = new Worker(
  QueueName.AI_DRAFT,

  async (job) => {
    logger.info({
      message: "Generating AI draft",

      payload: job.data,
    });

    const draft = await aiService.generateReply(job.data.body);

    logger.info({
      message: "AI draft generated",

      preview: draft?.slice(0, 120),
    });

    await draftRepository.create(
      job.data.emailId,

      draft || "",
    );

    logger.info({
      message: "Draft stored",

      emailId: job.data.emailId,
    });
    await publisher.publish(
      RealtimeEvent.DRAFT_GENERATED,

      JSON.stringify({
        emailId: job.data.emailId,

        draft,
      }),
    );
  },

  {
    connection: redisManager.getClient(),
  },
);

worker.on(
  "failed",

  (job, error) => {
    logger.error({
      worker: "AIWorker",

      jobId: job?.id,

      error: error.message,
    });
  },
);

logger.info("AI Worker Started");
