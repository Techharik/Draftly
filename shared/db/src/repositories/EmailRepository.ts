import { databaseManager } from "../index.js";

export interface CreateEmailInput {
  gmailMessageId: string;

  gmailThreadId: string;

  subject?: string;

  from?: string;

  body?: string;
}

export class EmailRepository {
  public async create(input: CreateEmailInput) {
    const result = await databaseManager.pool.query(
      `
        INSERT INTO emails (
          gmail_message_id,
          gmail_thread_id,
          subject,
          "from",
          body
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
      [
        input.gmailMessageId,
        input.gmailThreadId,
        input.subject,
        input.from,
        input.body,
      ],
    );

    return result.rows[0];
  }

  public async findByMessageId(gmailMessageId: string) {
    const result = await databaseManager.pool.query(
      `
        SELECT *
        FROM emails
        WHERE gmail_message_id = $1
        LIMIT 1
        `,
      [gmailMessageId],
    );

    return result.rows[0];
  }

  public async findByGmailMessageId(gmailMessageId: string) {
    const result = await databaseManager.pool.query(
      `
        SELECT *
        FROM emails
        WHERE gmail_message_id = $1
        LIMIT 1
        `,
      [gmailMessageId],
    );

    return result.rows[0];
  }

  public async getInboxEmails() {
    const result = await databaseManager.pool.query(
      `
          SELECT
            emails.id,
            emails.subject,
            emails.from,
            emails.body,
            emails.gmail_thread_id,

            drafts.content AS draft,
            drafts.status

          FROM emails

          LEFT JOIN drafts
          ON drafts.email_id = emails.id

          ORDER BY emails.created_at DESC
        `,
    );

    return result.rows;
  }
}
