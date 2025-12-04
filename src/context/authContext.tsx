import { createContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import * as accountApi from '../apis/account.api';
import { ChatSocketManager } from "@/services/chatSocket.service";


interface AuthContextType {
  user: any;
  // setUser: (user: User | null) => void;
  login: (user: any) => void;
  logout: () => Promise<void>;
  loading: boolean;
  chatSocketManagerRef: React.RefObject<ChatSocketManager | null>;
  unreadCount: number;
  setUnreadCount: (count: number | ((prev: number) => number)) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  // setUser: () => { },
  login: () => { },
  logout: async () => { },
  loading: true,
  chatSocketManagerRef: { current: null },
  unreadCount: 0,
  setUnreadCount: () => { }
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { getItem, setItem, removeItem } = useLocalStorage();
  const [unreadCount, setUnreadCountState] = useState(0);
  const chatSocketManagerRef = useRef<ChatSocketManager | null>(null);

  // Wrapper để hỗ trợ cả direct value và functional update
  const setUnreadCount = (count: number | ((prev: number) => number)) => {
    if (typeof count === 'function') {
      setUnreadCountState(count);
    } else {
      setUnreadCountState(count);
    }
  };
  useEffect(() => {
    setLoading(true);
    console.log("Run AuthProvider useEffect");
    const storedUser = getItem("user");
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    chatSocketManagerRef.current = new ChatSocketManager();
    return () => {
      try {
        chatSocketManagerRef.current?.disconnect();
      } finally {
        chatSocketManagerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    if (!chatSocketManagerRef.current) return;
    console.log("user: ", user);
    console.log("Connect socket: ", user.id, (user as any)?.role || "provider");
    chatSocketManagerRef.current.connect(
      user.id as any,
      (user as any)?.role || "provider",
      user?.account_id
    );
  }, [user]);


  // Listen for messages from popup windows
  // useEffect(() => {
  //   const handleMessage = (event: MessageEvent) => {
  //     if (event.data.type === 'LOGIN_SUCCESS') {
  //       login(event.data.user);
  //     }
  //   };

  //   window.addEventListener('message', handleMessage);
  //   return () => window.removeEventListener('message', handleMessage);
  // }, []);

  const login = (userData: any) => {
    setUser(userData);
    setItem("user", userData);
  }

  const logout = async () => {
    setUser(null);
    removeItem("user");
    await accountApi.logout();
  }

  console.log({ contextUser: user });

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, chatSocketManagerRef, unreadCount, setUnreadCount }}>
      {children}
    </AuthContext.Provider>
  );
}; 