import { Router } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";

import { validate } from "../middleware/validate.js";

import { GmailWebhookSchema } from "../dto/gmailWebhook.dto.js";

import { GmailWebhookController } from "../controllers/GmailWebhookController.js";

const router = Router();

const controller = new GmailWebhookController();

router.post(
  "/gmail",

  validate(GmailWebhookSchema),

  asyncHandler(controller.handleWebhook),
);

export const webhookRouter = router;
