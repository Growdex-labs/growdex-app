import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

if (!SOCKET_URL) {
  console.warn("NEXT_PUBLIC_BACKEND_API_URL is not defined; socket connection will fail");
}

let socket: Socket | null = null;

/**
 * Returns a singleton Socket.IO client instance.
 * Call this only on the client side.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL || "", {
      auth: (cb) => {
        // Token will be retrieved from cookies automatically by the browser
        cb({ token: "" });
      },
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}