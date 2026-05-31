import axios from "axios";

import { config } from "@draftly/config";
console.log(config.OPENROUTER_API_KEY);
export class AIService {
  public async generateReply(emailBody: string) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",

        {
          model: "openrouter/free",

          messages: [
            {
              role: "system",

              content: `
                You are an email assistant.

                Generate concise
                professional replies.
                `,
            },

            {
              role: "user",

              content: emailBody,
            },
          ],
        },

        {
          headers: {
            Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,

            "Content-Type": "application/json",
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error(error.response?.data || error.message);

      return "unable to generate reply";
    }
  }
}
