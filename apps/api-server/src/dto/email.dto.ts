import { z } from "zod";

export const CreateEmailSchema = z.object({
  gmailMessageId: z.string().min(1),

  gmailThreadId: z.string().min(1),

  subject: z.string().optional(),

  from: z.string().email(),

  body: z.string().optional(),
});

export type CreateEmailDTO = z.infer<typeof CreateEmailSchema>;
