import { databaseManager } from "../index.js";

export interface CreateUserInput {
  email: string;

  googleId: string;

  accessToken?: string;

  refreshToken?: string;

  lastHistoryId?: string;
}

export class UserRepository {
  public async create(input: CreateUserInput) {
    const result = await databaseManager.pool.query(
      `
          INSERT INTO users (
            email,
            google_id,
            access_token,
            refresh_token,
            last_history_id
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `,
      [
        input.email,

        input.googleId,

        input.accessToken,

        input.refreshToken,

        input.lastHistoryId,
      ],
    );

    return result.rows[0];
  }

  public async findByEmail(email: string) {
    const result = await databaseManager.pool.query(
      `
          SELECT *
          FROM users
          WHERE email = $1
          LIMIT 1
        `,
      [email],
    );

    return result.rows[0];
  }

  public async findByGoogleEmail(email: string) {
    const result = await databaseManager.pool.query(
      `
          SELECT *
          FROM users
          WHERE email = $1
          LIMIT 1
        `,
      [email],
    );

    return result.rows[0];
  }

  public async updateTokens(
    email: string,
    accessToken: string,
    refreshToken?: string,
  ) {
    const result = await databaseManager.pool.query(
      `
          UPDATE users
          SET
            access_token = $1,
            refresh_token = COALESCE($2, refresh_token)
          WHERE email = $3
          RETURNING *
        `,
      [accessToken, refreshToken, email],
    );

    return result.rows[0];
  }

  public async updateHistoryId(userId: string, historyId: string) {
    const result = await databaseManager.pool.query(
      `
          UPDATE users
          SET last_history_id = $1
          WHERE id = $2
          RETURNING *
        `,
      [historyId, userId],
    );

    return result.rows[0];
  }
}
