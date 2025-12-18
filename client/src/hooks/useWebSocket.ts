import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface UseWebSocketOptions {
  onNewRegistration?: (data: any) => void;
  onPaymentStatusUpdate?: (data: any) => void;
  onRegistrationUpdate?: (data: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    const socket = io(window.location.origin, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("[WebSocket] Connected");
      isConnectedRef.current = true;
      socket.emit("join-admin");
    });

    socket.on("new-registration", (data) => {
      console.log("[WebSocket] New registration:", data);
      options.onNewRegistration?.(data);
    });

    socket.on("payment-status-updated", (data) => {
      console.log("[WebSocket] Payment status updated:", data);
      options.onPaymentStatusUpdate?.(data);
    });

    socket.on("registration-updated", (data) => {
      console.log("[WebSocket] Registration updated:", data);
      options.onRegistrationUpdate?.(data);
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
      isConnectedRef.current = false;
    });

    socket.on("error", (error) => {
      console.error("[WebSocket] Error:", error);
    });

    socketRef.current = socket;
  }, [options]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("leave-admin");
      socketRef.current.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected: isConnectedRef.current,
    socket: socketRef.current,
  };
}
