// import { useEffect, useRef } from 'react';
// import { io } from 'socket.io-client';

// export function useWasteSocket(branchId, onUpdate) {
//   const socketRef = useRef(null);

//   useEffect(() => {
//     if (!branchId) return;
//     socketRef.current = io(process.env.REACT_APP_WS_URL, {
//       transports: ['websocket'],
//       query: { branchId },
//       pingInterval: 5000,
//       pingTimeout: 5000,
//     });

//     socketRef.current.on('wasteUpdate', (payload) => {
//       onUpdate(payload);
//     });

//     return () => {
//       socketRef.current.disconnect();
//       socketRef.current = null;
//     };
//   }, [branchId, onUpdate]);
// }
// File: src/hooks/useWasteSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Default socket options
const DEFAULT_WS_OPTIONS = {
  transports: ['websocket'],
  pingInterval: 5000,
  pingTimeout: 5000,
};

export function useWasteSocket(branchId, onUpdate) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!branchId) return;

    // Connect to same-origin (no need for process.env at runtime)
    socketRef.current = io({
      ...DEFAULT_WS_OPTIONS,
      query: { branchId },
    });

    socketRef.current.on('wasteUpdate', onUpdate);

    return () => {
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [branchId, onUpdate]);
}
