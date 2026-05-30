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
}
