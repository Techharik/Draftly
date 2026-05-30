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

    res.redirect(url);
  };

  public callback = async (req: Request, res: Response) => {
    const code = req.query.code as string;

    const tokens = await this.googleOAuthService.getTokens(code);

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
      });
    } else {
      await userRepository.updateTokens(
        userInfo.email,

        tokens.access_token!,

        tokens.refresh_token,
      );
    }
    const gmailService = new GmailService();

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
