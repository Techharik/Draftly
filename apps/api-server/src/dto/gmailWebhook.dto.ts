import { z } from "zod";

export const GmailWebhookSchema = z.object({
  emailAddress: z.string().email(),

  historyId: z.string(),
});

export type GmailWebhookDTO = z.infer<typeof GmailWebhookSchema>;
