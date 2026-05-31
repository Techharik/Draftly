import { Router } from "express";

import { EmailController } from "../controllers/EmailController.js";

const router = Router();

const controller = new EmailController();

router.get("/", controller.getInbox);
router.post("/:id/approve", controller.approveDraft);
export default router;
