import { google } from "googleapis";

export class GmailService {
  public async getGmailClient(accessToken: string, refreshToken?: string) {
    const auth = new google.auth.OAuth2();

    auth.setCredentials({
      access_token: accessToken,

      refresh_token: refreshToken,
    });

    return google.gmail({
      version: "v1",
      auth,
    });
  }
  public getHeader(headers: any[] = [], name: string) {
    return headers.find(
      (header) => header.name?.toLowerCase() === name.toLowerCase(),
    )?.value;
  }

  public async getProfile(accessToken: string, refreshToken?: string) {
    const gmail = await this.getGmailClient(accessToken, refreshToken);

    const response = await gmail.users.getProfile({
      userId: "me",
    });

    return response.data;
  }

  public async getHistory(
    accessToken: string,
    refreshToken: string | undefined,
    startHistoryId: string,
  ) {
    const gmail = await this.getGmailClient(accessToken, refreshToken);

    const response = await gmail.users.history.list({
      userId: "me",

      startHistoryId,
    });

    return response.data;
  }
  public async getMessage(
    accessToken: string,
    refreshToken: string | undefined,
    messageId: string,
  ) {
    const gmail = await this.getGmailClient(accessToken, refreshToken);

    const response = await gmail.users.messages.get({
      userId: "me",

      id: messageId,
    });

    return response.data;
  }

  public decodeBase64(data?: string) {
    if (!data) {
      return "";
    }

    return Buffer.from(data, "base64").toString("utf-8");
  }
  public extractBody(payload: any): string {
    if (!payload) {
      return "";
    }

    // Plain text directly
    if (payload.mimeType === "text/plain" && payload.body?.data) {
      return this.decodeBase64(payload.body.data);
    }

    // Recursive multipart traversal
    const parts = payload.parts || [];

    for (const part of parts) {
      const text = this.extractBody(part);

      if (text) {
        return text;
      }
    }

    return "";
  }

  public cleanEmailBody(body: string) {
    if (!body) {
      return "";
    }

    // Remove quoted replies
    const replyPatterns = [/On .* wrote:/i, /From: .*/i, />.*/g];

    let cleaned = body;

    for (const pattern of replyPatterns) {
      cleaned = cleaned.split(pattern)[0];
    }

    // Remove excessive whitespace
    cleaned = cleaned
      .replace(/\r/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return cleaned;
  }
}
