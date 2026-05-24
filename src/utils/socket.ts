import { io, Socket } from "socket.io-client";

const isDev = import.meta.env.DEV;
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const socketUrl = isDev ? `${backendUrl}/events` : "/events";

export const socket: Socket = io(socketUrl, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: false,
});

export const connectSocket = (): void => {
  if (!socket.connected) {
    const token = localStorage.getItem("access_token");
    if (token) {
      socket.auth = { token };
    }
    socket.connect();
  }
};

export const disconnectSocket = (): void => {
  if (socket.connected) {
    socket.disconnect();
  }
};

if (typeof window !== "undefined") {
  (window as any).__connectSocket = connectSocket;
  (window as any).__disconnectSocket = disconnectSocket;
}

if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as any)._socket = socket;
}

