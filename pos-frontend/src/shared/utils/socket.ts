import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = (branchId?: string) => {
  if (socket) return socket;

  const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  socket = io(url, {
    transports: ["websocket"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("Connected to Real-time Server:", socket?.id);
    if (branchId) {
      socket?.emit("join_branch", branchId);
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from Real-time Server");
  });

  return socket;
};

export const getSocket = () => socket;
