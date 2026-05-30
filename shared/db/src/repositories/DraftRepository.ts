import { databaseManager } from "../index.js";

export interface CreateDraftInput {
  emailId: string;

  content: string;

  status: string;
}

export class DraftRepository {
  public async create(input: CreateDraftInput) {
    const result = await databaseManager.pool.query(
      `
        INSERT INTO drafts (
          email_id,
          content,
          status
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `,
      [input.emailId, input.content, input.status],
    );

    return result.rows[0];
  }

  public async findById(draftId: string) {
    const result = await databaseManager.pool.query(
      `
        SELECT *
        FROM drafts
        WHERE id = $1
        LIMIT 1
        `,
      [draftId],
    );

    return result.rows[0];
  }

  public async updateStatus(draftId: string, status: string) {
    const result = await databaseManager.pool.query(
      `
        UPDATE drafts
        SET status = $1
        WHERE id = $2
        RETURNING *
        `,
      [status, draftId],
    );

    return result.rows[0];
  }
}
