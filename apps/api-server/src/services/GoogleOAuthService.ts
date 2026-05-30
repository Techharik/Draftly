import { google } from "googleapis";

import { config } from "@draftly/config";

export class GoogleOAuthService {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.GOOGLE_CLIENT_ID,

      config.GOOGLE_CLIENT_SECRET,

      config.GOOGLE_REDIRECT_URI,
    );
  }

  public generateAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",

      prompt: "consent",

      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.modify",
      ],
    });
  }

  public async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    //   console.log(tokens);
    this.oauth2Client.setCredentials(tokens);

    return tokens;
  }
  public async getUserInfo(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const oauth2 = google.oauth2({
      version: "v2",
      auth: oauth2Client,
    });

    const { data } = await oauth2.userinfo.get();

    return data;
  }
}
