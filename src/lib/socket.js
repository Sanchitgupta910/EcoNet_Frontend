import { io } from "socket.io-client";

// Replace with backend URL and port if needed.
const socket = io("http://localhost:3000", {
  transports: ["websocket"], // Use websocket transport for best performance
  autoConnect: true,
});

export default socket;
