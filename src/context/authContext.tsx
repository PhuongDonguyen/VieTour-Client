import { createContext, useState } from "react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";


interface AuthContextType {
  user: any;
  // setUser: (user: User | null) => void;
  login: (user: any) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  // setUser: () => { },
  login: () => { },
  logout: () => { },
  loading: true
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { getItem, setItem, removeItem } = useLocalStorage();

  useEffect(() => {
    setLoading(true);
    console.log("Run AuthProvider useEffect");
    const storedUser = getItem("user");
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

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

  const logout = () => {
    setUser(null);
    removeItem("user");
  }

  console.log({ contextUser: user });

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}; 