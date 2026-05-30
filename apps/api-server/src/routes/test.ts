import { Router } from "express";

import { EmailService } from "../services/EmailService.js";

const router = Router();

const emailService = new EmailService();

router.post("/", async (req, res) => {
  const email = await emailService.createEmail({
    gmailMessageId: req.body.gmailMessageId,

    gmailThreadId: req.body.gmailThreadId,

    subject: req.body.subject,

    from: req.body.from,

    body: req.body.body,
  });

  res.json(email);
});

export const testRouter = router;
