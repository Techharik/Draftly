import { Router } from "express";

import { gmailWebhook } from "../controllers/WebhookController.js";

const router = Router();

router.post("/gmail", gmailWebhook);

export default router;
