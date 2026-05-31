import { EmailRepository } from "@draftly/db/src/repositories/index.js";

export interface CreateEmailDTO {
  gmailMessageId: string;

  gmailThreadId: string;

  subject?: string;

  from?: string;

  body?: string;
}

export class EmailService {
  private emailRepository;

  constructor() {
    this.emailRepository = new EmailRepository();
  }

  public async createEmail(input: CreateEmailDTO) {
    const existingEmail = await this.emailRepository.findByGmailMessageId(
      input.gmailMessageId,
    );

    // throw new Error("Testing middleware");
    if (existingEmail) {
      return existingEmail;
    }
    const email = await this.emailRepository.create(input);

    return email;
  }

  public async getInboxEmails() {
    return this.emailRepository.getInboxEmails();
  }
}
