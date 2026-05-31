import { Request, Response } from "express";

import { queueManager } from "@draftly/queue";

import { QueueName } from "@draftly/types";

export const gmailWebhook = async (req: Request, res: Response) => {
  try {
    const pubsubMessage = req.body.message;

    if (!pubsubMessage?.data) {
      return res.status(400).json({
        error: "Missing Pub/Sub data",
      });
    }

    const decoded = Buffer.from(pubsubMessage.data, "base64").toString();

    const payload = JSON.parse(decoded);

    console.log({
      gmailWebhookPayload: payload,
    });

    const emailQueue = queueManager.getQueue(QueueName.EMAIL_FETCH);

    await emailQueue.add(
      "gmail-history-sync",

      {
        emailAddress: payload.emailAddress,

        historyId: payload.historyId,
      },
    );

    return res.status(200).json({
      success: true,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
};
