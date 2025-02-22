import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

/**
 * useSocket
 * -----------
 * A custom hook that establishes a Socket.io connection and provides a minimal interface.
 * 
 * @param {string} url - The URL of the Socket.io server.
 * @returns {object} An object containing:
 *  - isConnected: Boolean indicating the connection status.
 *  - on: Function to register event listeners.
 *  - emit: Function to emit events.
 *
 * Note: This hook automatically cleans up the socket connection on component unmount.
 */
export const useSocket = (url) => {
  // Persist the socket instance.
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize the socket connection.
    socketRef.current = io(url, {
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
    });

    // Update connection status when connected.
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
      setIsConnected(true);
    });

    // Update connection status on disconnect.
    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    // Cleanup socket connection on unmount.
    return () => {
      socketRef.current.disconnect();
    };
  }, [url]);

  // Register an event listener.
  const on = (event, callback) => {
    socketRef.current.on(event, callback);
  };

  // Emit an event.
  const emit = (event, data) => {
    socketRef.current.emit(event, data);
  };

  return { isConnected, on, emit };
};