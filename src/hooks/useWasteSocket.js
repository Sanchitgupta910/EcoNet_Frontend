import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useWasteSocket(branchId, onUpdate) {
  const socketRef = useRef(null);
  useEffect(() => {
    if (!branchId) return;

    // No need for VITE_APP_API_URL—use relative so the proxy kicks in
    const socket = io('/', {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      query: { branchId },
    });

    socketRef.current = socket;
    socket.on('connect', () => console.log('[WS] connected', socket.id));
    socket.on('connect_error', (err) => console.error('[WS] connect_error', err));
    socket.on('wasteUpdate', (payload) => onUpdate(payload));
    return () => socket.disconnect();
  }, [branchId, onUpdate]);
}
