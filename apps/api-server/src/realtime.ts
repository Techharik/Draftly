import { subscriber } from "@draftly/redis";

import { RealtimeEvent } from "@draftly/types";

import { getIO } from "./socket.js";

export const startRealtime = async () => {
  await subscriber.subscribe(RealtimeEvent.DRAFT_GENERATED);

  subscriber.on(
    "message",

    (channel, message) => {
      console.log({
        channel,
        message,
      });

      const io = getIO();

      io.emit(
        channel,

        JSON.parse(message),
      );
    },
  );
};
