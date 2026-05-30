import { databaseManager } from "../index.js";

export interface CreateUserInput {
  email: string;

  googleId: string;

  accessToken?: string;

  refreshToken?: string;
}

export class UserRepository {
  public async create(input: CreateUserInput) {
    const result = await databaseManager.pool.query(
      `
        INSERT INTO users (
          email,
          google_id,
          access_token,
          refresh_token
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
      [input.email, input.googleId, input.accessToken, input.refreshToken],
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
}
