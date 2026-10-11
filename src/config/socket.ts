import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './env';
import { STORAGE_KEYS } from './api';

let socket: Socket | null = null;

export function connectSocket(accessToken: string): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: (callback) => {
      const currentToken = localStorage.getItem(STORAGE_KEYS.accessToken) ?? accessToken;
      callback({ token: currentToken });
    },
    transports: ['websocket'],
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function joinOrderRoom(orderId: string) {
  socket?.emit('join_order', orderId);
}

export function leaveOrderRoom(orderId: string) {
  socket?.emit('leave_order', orderId);
}
