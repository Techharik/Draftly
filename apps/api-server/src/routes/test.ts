import { Router } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";

import { EmailController } from "../controllers/EmailController.js";
import { validate } from "../middleware/validate.js";

import { CreateEmailSchema } from "../dto/email.dto.js";
const router = Router();

const emailController = new EmailController();

router.post(
  "/",

  validate(CreateEmailSchema),

  asyncHandler(emailController.createEmail),
);

export const testRouter = router;
