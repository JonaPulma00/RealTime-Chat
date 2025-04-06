import { instrument } from "@socket.io/admin-ui";
import { Server } from "socket.io";

const io = new Server(3500, {
  cors: {
    origin: ["http://localhost:4200"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", (groupId) => {
    socket.join(groupId.toString());
    console.log(`User ${socket.id} joined room ${groupId}`);
  });

  socket.on("leave-room", (groupId) => {
    socket.leave(groupId.toString());
    console.log(`User ${socket.id} left room ${groupId}`);
  });

  socket.on("send-message", (data) => {
    console.log(`Message received in group ${data.groupId}: ${data.message}`);
    socket.to(data.groupId).emit("receive-message", {
      id: data.messageId,
      text: data.message,
      username: data.username,
    });
  });
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

instrument(io, { auth: false, mode: "development" });
