import { Request, Response } from "express";

import { EmailService } from "../services/EmailService.js";

export class EmailController {
  private emailService;

  constructor() {
    this.emailService = new EmailService();
  }

  public createEmail = async (req: Request, res: Response) => {
    const email = await this.emailService.createEmail({
      gmailMessageId: req.body.gmailMessageId,

      gmailThreadId: req.body.gmailThreadId,

      subject: req.body.subject,

      from: req.body.from,

      body: req.body.body,
    });

    res.json(email);
  };
}
