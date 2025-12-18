import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

export function initializeWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Join admin room for real-time updates
    socket.on("join-admin", () => {
      socket.join("admin-dashboard");
      console.log(`[WebSocket] Admin joined: ${socket.id}`);
    });

    // Leave admin room
    socket.on("leave-admin", () => {
      socket.leave("admin-dashboard");
      console.log(`[WebSocket] Admin left: ${socket.id}`);
    });

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getWebSocketServer(): SocketIOServer | null {
  return io;
}

export function broadcastRegistrationUpdate(data: any) {
  if (io) {
    io.to("admin-dashboard").emit("registration-updated", data);
  }
}

export function broadcastPaymentStatusUpdate(data: any) {
  if (io) {
    io.to("admin-dashboard").emit("payment-status-updated", data);
  }
}

export function broadcastNewRegistration(data: any) {
  if (io) {
    io.to("admin-dashboard").emit("new-registration", data);
  }
}
