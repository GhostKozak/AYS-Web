import { io, Socket } from "socket.io-client";

// Determine the WebSocket server endpoint.
// In dev server, standard proxy configuration will route '/socket.io' calls.
// Using relative path '/events' allows routing via the proxy.
// If the websocket is disconnected or needs absolute URL, we fall back to standard localhost backend url in dev.
const isDev = import.meta.env.DEV;
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const socketUrl = isDev ? `${backendUrl}/events` : "/events";

console.log(`[Socket] Initializing WebSocket client for url: ${socketUrl}`);

export const socket: Socket = io(socketUrl, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  autoConnect: true,
});

if (typeof window !== "undefined") {
  (window as any)._socket = socket;
}
