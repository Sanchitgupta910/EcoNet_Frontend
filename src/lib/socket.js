import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on('connect', () => {
  console.log("Socket connected: ", socket.id);
});

socket.on('connect_error', (error) => {
  console.error("Socket connection error:", error);
});

socket.on('disconnect', (reason) => {
  console.log("Socket disconnected:", reason);
});

export default socket;