import dotenv from "dotenv";
import { resolve } from "path";

// process.cwd() is apps/api-server. Go up two levels to root.
dotenv.config({ path: resolve(process.cwd(), "../../.env") });

console.log("My NODE_ENV is:", process.env.NODE_ENV);
class Config {
  public readonly NODE_ENV: string;

  public readonly PORT: number;

  public readonly REDIS_HOST: string;

  public readonly REDIS_PORT: number;

  public readonly POSTGRES_HOST: string;

  public readonly POSTGRES_PORT: number;

  public readonly POSTGRES_USER: string;

  public readonly POSTGRES_PASSWORD: string;

  public readonly POSTGRES_DB: string;

  public readonly GOOGLE_CLIENT_ID: string;

  public readonly GOOGLE_CLIENT_SECRET: string;

  public readonly GOOGLE_REDIRECT_URI: string;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || "development";

    this.PORT = Number(process.env.PORT || 3000);

    this.REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";

    this.REDIS_PORT = Number(process.env.REDIS_PORT || 6379);

    this.POSTGRES_HOST = process.env.POSTGRES_HOST || "127.0.0.1";

    this.POSTGRES_PORT = Number(process.env.POSTGRES_PORT || 5432);

    this.POSTGRES_USER = process.env.POSTGRES_USER || "draftly";

    this.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || "draftly";

    this.POSTGRES_DB = process.env.POSTGRES_DB || "draftly";
    this.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

    this.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

    this.GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "";
  }
}

export const config = new Config();
