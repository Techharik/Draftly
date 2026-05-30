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

  public async getProfile(accessToken: string, refreshToken?: string) {
    const gmail = await this.getGmailClient(accessToken, refreshToken);

    const response = await gmail.users.getProfile({
      userId: "me",
    });

    return response.data;
  }
}
