import { Server } from "socket.io";

let io: Server;

export const initSocket = (httpServer: any) => {
  io = new Server(
    httpServer,

    {
      cors: {
        origin: "*",
      },
    },
  );

  io.on(
    "connection",

    (socket) => {
      console.log("Client connected:", socket.id);
    },
  );

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }

  return io;
};
