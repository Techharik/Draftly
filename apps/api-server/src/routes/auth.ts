import { Router } from "express";

import { AuthController } from "../controllers/AuthController.js";

import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const authController = new AuthController();

router.get("/google", asyncHandler(authController.login));

router.get("/google/callback", asyncHandler(authController.callback));

export const authRouter = router;
