import { Request, Response } from "express";

import { queueManager } from "@draftly/queue";

import { QueueName } from "@draftly/types";

export class GmailWebhookController {
  public handleWebhook = async (req: Request, res: Response) => {
    const queue = queueManager.getQueue(QueueName.EMAIL_FETCH);

    await queue.add(
      "gmail-webhook-event",

      {
        emailAddress: req.body.emailAddress,

        historyId: req.body.historyId,
      },
    );

    res.json({
      success: true,
    });
  };
}
