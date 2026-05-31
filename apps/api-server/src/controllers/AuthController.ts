import { Request, Response } from "express";

import { GoogleOAuthService } from "../services/GoogleOAuthService.js";

import { UserRepository } from "@draftly/db";

import { GmailService } from "../services/GmailService.js";

export class AuthController {
  private googleOAuthService;

  constructor() {
    this.googleOAuthService = new GoogleOAuthService();
  }

  public login = async (_: Request, res: Response) => {
    const url = this.googleOAuthService.generateAuthUrl();

    console.log(url);

    res.redirect(url);
  };

  public callback = async (req: Request, res: Response) => {
    const code = req.query.code as string;

    console.log("In callback");

    const tokens = await this.googleOAuthService.getTokens(code);

    const gmailService = new GmailService();

    let latestHistoryId = "";

    try {
      const watchResponse = await gmailService.watchInbox(
        tokens.access_token!,

        tokens.refresh_token!,
      );

      console.log("WATCH ENABLED");

      console.log(watchResponse.data);

      latestHistoryId = String(watchResponse.data.historyId || "");
    } catch (e) {
      console.log(e);
    }

    const userInfo = await this.googleOAuthService.getUserInfo(
      tokens.access_token!,
    );

    const userRepository = new UserRepository();

    const existingUser = await userRepository.findByEmail(userInfo.email);

    if (!existingUser) {
      await userRepository.create({
        email: userInfo.email,

        googleId: userInfo.id,

        accessToken: tokens.access_token,

        refreshToken: tokens.refresh_token,

        lastHistoryId: latestHistoryId,
      });
    } else {
      await userRepository.updateTokens(
        userInfo.email,

        tokens.access_token!,

        tokens.refresh_token,
      );

      await userRepository.updateHistoryId(
        existingUser.id,

        latestHistoryId,
      );
    }

    const profile = await gmailService.getProfile(
      tokens.access_token!,

      tokens.refresh_token,
    );

    console.log(profile);

    res.json({
      success: true,

      email: userInfo.email,
    });
  };
}
