import { createContext, useState } from "react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  avatar: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  // setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  // setUser: () => { },
  login: () => { },
  logout: () => { }
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { getItem, setItem, removeItem } = useLocalStorage();

  useEffect(() => {
    const storedUser = getItem("user");
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setItem("user", userData);
  }

  const logout = () => {
    setUser(null);
    removeItem("user");
  }

  console.log({ contextUser: user });

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 