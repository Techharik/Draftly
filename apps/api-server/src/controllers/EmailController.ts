import { Request, Response } from "express";

import { EmailService } from "../services/EmailService.js";
import { UserRepository } from "@draftly/db";
import { GmailService } from "../services/GmailService.js";
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

  public getInbox = async (_: Request, res: Response) => {
    const emails = await this.emailService.getInboxEmails();

    res.json({
      success: true,

      emails,
    });
  };

  public approveDraft = async (req: Request, res: Response) => {
    const emailId = req.params.id;

    const emails = await this.emailService.getInboxEmails();

    const email = emails.find((e: any) => e.id === emailId);

    if (!email) {
      return res.status(404).json({
        error: "Email not found",
      });
    }

    const userRepository = new UserRepository();

    const user = await userRepository.findByGoogleEmail(
      "khariprasath30@gmail.com",
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const gmailService = new GmailService();

    const repl = await gmailService.sendReply(
      user.access_token,

      user.refresh_token,

      email.from,

      email.subject,

      req.body.content,

      email.gmail_thread_id,
    );
    console.log(repl);
    res.json({
      success: true,
    });
  };
}
