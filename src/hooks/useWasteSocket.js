import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useWasteSocket(branchId, onUpdate) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!branchId) return;

    // If we already have a live socket for this branch, do nothing
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.off('wasteUpdate', onUpdate);
      socketRef.current.on('wasteUpdate', onUpdate);
      return;
    }

    // Create a new socket only once
    const socket = io('/', {
      path: '/socket.io',
      transports: ['polling', 'websocket'], // WebSocket only
      query: { branchId },
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => console.log('[WS] connected', socket.id));
    socket.on('connect_error', (err) => console.error('[WS] connect_error', err));
    socket.on('wasteUpdate', (payload) => {
      console.log('[WS] 🔔 wasteUpdate callback', payload);
      onUpdate(payload);
    });

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('wasteUpdate', onUpdate);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [branchId, onUpdate]);
}
