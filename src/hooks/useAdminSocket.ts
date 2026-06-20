import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

export const useAdminSocket = () => {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  // Expose socket as state so consumers re-render (and re-register listeners)
  // when the socket instance is first created or replaced.
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    // If the token changed, tear down the old socket first
    if (socketRef.current) {
      const currentToken = (socketRef.current.auth as any)?.token;
      if (currentToken !== accessToken) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    }

    // No token yet — don't connect
    if (!accessToken) return;

    // Socket already exists and is healthy — nothing to do
    if (socketRef.current) return;

    const newSocket = io(
      `${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000'}/admin`,
      {
        transports: ['websocket'],
        autoConnect: true,
        auth: { token: accessToken },
      }
    );

    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);

    socketRef.current = newSocket;
    // Trigger re-render in consumers so they can attach their event listeners
    setSocket(newSocket);

    return () => {
      newSocket.off('connect', onConnect);
      newSocket.off('disconnect', onDisconnect);
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [accessToken]);

  return { socket, isConnected };
};
